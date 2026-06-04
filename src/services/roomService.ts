import { RealtimeChannel } from '@supabase/supabase-js';
import { movieService } from './tmdbApi';
import { supabase } from './supabaseClient';
import {
  CreateRoomInput,
  CreateRoomResult,
  DbContentType,
  JoinRoomResult,
  Match,
  mediaTypeForContentType,
  RecordSwipeInput,
  Room,
  RoomMovie,
  RoomRealtimeHandler,
  RoomUser,
  roomMovieFromTMDB,
  Swipe,
  Profile,
} from '@/types/database';
import { TMDBMediaItem } from '@/types/movie';

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 4;
const MAX_ROOM_CODE_ATTEMPTS = 8;
const PG_UNIQUE_VIOLATION = '23505';

function generateRoomCode() {
  return Array.from({ length: ROOM_CODE_LENGTH }, () =>
    ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]
  ).join('');
}

function assertData<T>(data: T | null, message: string): T {
  if (!data) {
    throw new Error(message);
  }

  return data;
}

function toRealtimePayload<T>(payload: {
  eventType: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}) {
  return {
    eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
    new: (Object.keys(payload.new).length ? (payload.new as T) : null),
    old: (Object.keys(payload.old).length ? (payload.old as Partial<T>) : null),
  };
}

function getDiscoverType(contentType: DbContentType) {
  return contentType === 'tv' ? 'tv' : 'movie';
}

function clampSessionLimit(sessionLimit: number) {
  return Math.min(Math.max(sessionLimit, 5), 100);
}

function normalizeMovieQueue(movies: TMDBMediaItem[], sessionLimit: number) {
  const seen = new Set<number>();

  return movies
    .filter((movie) => {
      if (!movie.id || seen.has(movie.id)) return false;
      seen.add(movie.id);
      return Boolean(movie.title ?? movie.name);
    })
    .slice(0, sessionLimit);
}

async function fetchRoomQueue(input: CreateRoomInput) {
  const discoverType = getDiscoverType(input.contentType);
  const sessionLimit = clampSessionLimit(input.sessionLimit);
  const queue: TMDBMediaItem[] = [];
  let page = 1;

  while (queue.length < sessionLimit && page <= 5) {
    const response = await movieService.discoverMedia(discoverType, input.genreIds, page, {
      minVoteAverage: input.minVoteAverage,
      certification: input.certification,
      certificationCountry: input.certificationCountry,
      region: input.region,
    });

    if (!response?.results?.length) {
      break;
    }

    queue.push(...response.results);
    page += 1;
  }

  const normalizedQueue = normalizeMovieQueue(queue, sessionLimit);

  if (normalizedQueue.length === 0) {
    throw new Error('No movies found for this room.');
  }

  return normalizedQueue;
}

async function createRoomRow(input: CreateRoomInput, code: string) {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      code,
      host_id: input.hostId,
      content_type: input.contentType,
      genre_ids: input.genreIds,
      session_limit: clampSessionLimit(input.sessionLimit),
      status: 'waiting',
    })
    .select('*')
    .single<Room>();

  if (error) {
    throw error;
  }

  return assertData(data, 'Room was not created.');
}

async function createRoomWithUniqueCode(input: CreateRoomInput) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ROOM_CODE_ATTEMPTS; attempt += 1) {
    try {
      return await createRoomRow(input, generateRoomCode());
    } catch (error) {
      lastError = error;

      const maybeDbError = error as { code?: string };
      if (maybeDbError?.code !== PG_UNIQUE_VIOLATION) {
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Unable to generate a unique room code.');
}

export const roomService = {
  createRoomFromFilters: async (input: CreateRoomInput): Promise<CreateRoomResult> => {
    const mediaType = mediaTypeForContentType(input.contentType);
    const queue = await fetchRoomQueue(input);

    const room = await createRoomWithUniqueCode(input);

    try {
      const { data: hostMembership, error: hostError } = await supabase
        .from('room_users')
        .insert({
          room_id: room.id,
          user_id: input.hostId,
          role: 'host',
          status: 'joined',
        })
        .select('*')
        .single<RoomUser>();

      if (hostError) {
        throw hostError;
      }

      const movieRows = queue.map((movie, index) =>
        roomMovieFromTMDB(movie, room.id, index, mediaType)
      );

      const { data: movies, error: moviesError } = await supabase
        .from('room_movies')
        .insert(movieRows)
        .select('*')
        .returns<RoomMovie[]>();

      if (moviesError) {
        throw moviesError;
      }

      return {
        room,
        hostMembership: assertData(hostMembership, 'Host membership was not created.'),
        movies: movies ?? [],
      };
    } catch (err) {
      await supabase.from('rooms').delete().eq('id', room.id);
      throw err;
    }
  },

  getRoomByCode: async (code: string): Promise<Room | null> => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle<Room>();

    if (error) {
      throw error;
    }

    return data;
  },

  joinRoomByCode: async (code: string, userId: string): Promise<JoinRoomResult> => {
    const room = await roomService.getRoomByCode(code);

    if (!room) {
      throw new Error('Room not found.');
    }
    if (room.status === 'finished') {
      throw new Error('This room session is already finished.');
    }

    const { data: existingMembership, error: existingMembershipError } = await supabase
      .from('room_users')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .maybeSingle<RoomUser>();

    if (existingMembershipError) {
      throw existingMembershipError;
    }

    if (existingMembership) {
      return {
        room,
        membership: existingMembership,
      };
    }

    const { data: membership, error } = await supabase
      .from('room_users')
      .insert({
        room_id: room.id,
        user_id: userId,
        role: 'guest',
        status: 'joined',
      })
      .select('*')
      .single<RoomUser>();

    if (error) {
      throw error;
    }

    return {
      room,
      membership: assertData(membership, 'Room membership was not created.'),
    };
  },

  getRoomMovies: async (roomId: string): Promise<RoomMovie[]> => {
    const { data, error } = await supabase
      .from('room_movies')
      .select('*')
      .eq('room_id', roomId)
      .order('position', { ascending: true })
      .returns<RoomMovie[]>();

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  getRoomUsers: async (roomId: string): Promise<RoomUser[]> => {
    const { data, error } = await supabase
      .from('room_users')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true })
      .returns<RoomUser[]>();

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  getProfilesByUserIds: async (userIds: string[]): Promise<Profile[]> => {
    if (!userIds.length) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
      .returns<Profile[]>();
    if (error) throw error;
    return data ?? [];
  },

  setRoomUserStatus: async (roomId: string, userId: string, status: RoomUser['status']): Promise<RoomUser> => {
    const { data, error } = await supabase
      .from('room_users')
      .update({ status })
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .select('*')
      .single<RoomUser>();
    if (error) throw error;
    return assertData(data, 'Room user status was not updated.');
  },

  setRoomStatus: async (roomId: string, status: Room['status']): Promise<Room> => {
    const { data, error } = await supabase
      .from('rooms')
      .update({ status })
      .eq('id', roomId)
      .select('*')
      .single<Room>();

    if (error) {
      throw error;
    }

    return assertData(data, 'Room status was not updated.');
  },

  recordSwipe: async (input: RecordSwipeInput): Promise<Swipe> => {
    const { data, error } = await supabase
      .from('swipes')
      .insert({
        room_id: input.roomId,
        user_id: input.userId,
        room_movie_id: input.roomMovieId,
        liked: input.liked,
      })
      .select('*')
      .single<Swipe>();

    if (error) {
      throw error;
    }

    return assertData(data, 'Swipe was not recorded.');
  },

  getLikedRoomMovieIds: async (roomId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('swipes')
      .select('room_movie_id')
      .eq('room_id', roomId)
      .eq('liked', true);

    if (error) {
      throw error;
    }

    const counts = new Map<string, number>();
    (data ?? []).forEach((row) => {
      const value = (row as { room_movie_id?: string }).room_movie_id;
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    });

    const sharedIds: string[] = [];
    counts.forEach((count, id) => {
      if (count >= 2) {
        sharedIds.push(id);
      }
    });

    return sharedIds;
  },

  createRoomFromExistingQueue: async (input: {
    hostId: string;
    sourceRoom: Room;
    roomMovieIds: string[];
  }): Promise<CreateRoomResult> => {
    const sourceMovies = await roomService.getRoomMovies(input.sourceRoom.id);
    const selected = sourceMovies.filter((movie) => input.roomMovieIds.includes(movie.id));

    const room = await createRoomWithUniqueCode({
      hostId: input.hostId,
      contentType: input.sourceRoom.content_type,
      genreIds: input.sourceRoom.genre_ids,
      sessionLimit: input.roomMovieIds.length,
    });

    try {
      const { data: hostMembership, error: hostError } = await supabase
        .from('room_users')
        .insert({
          room_id: room.id,
          user_id: input.hostId,
          role: 'host',
          status: 'joined',
        })
        .select('*')
        .single<RoomUser>();

      if (hostError) throw hostError;

      const movieRows = selected.map((movie, index) => ({
        room_id: room.id,
        tmdb_id: movie.tmdb_id,
        position: index,
        media_type: movie.media_type,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        genre_ids: movie.genre_ids,
      }));

      const { data: movies, error: moviesError } = await supabase
        .from('room_movies')
        .insert(movieRows)
        .select('*')
        .returns<RoomMovie[]>();

      if (moviesError) throw moviesError;

      return {
        room,
        hostMembership: assertData(hostMembership, 'Host membership was not created.'),
        movies: movies ?? [],
      };
    } catch (err) {
      await supabase.from('rooms').delete().eq('id', room.id);
      throw err;
    }
  },

  subscribeToRoom: (roomId: string, handler: RoomRealtimeHandler<Room>): RealtimeChannel => {
    return supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => handler(toRealtimePayload<Room>(payload)),
      )
      .subscribe();
  },

  subscribeToRoomUsers: (roomId: string, handler: RoomRealtimeHandler<RoomUser>): RealtimeChannel => {
    return supabase
      .channel(`room-users:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_users', filter: `room_id=eq.${roomId}` },
        (payload) => handler(toRealtimePayload<RoomUser>(payload)),
      )
      .subscribe();
  },

  subscribeToMatches: (roomId: string, handler: RoomRealtimeHandler<Match>): RealtimeChannel => {
    return supabase
      .channel(`matches:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `room_id=eq.${roomId}` },
        (payload) => handler(toRealtimePayload<Match>(payload)),
      )
      .subscribe();
  },

  subscribeToSwipes: (roomId: string, handler: RoomRealtimeHandler<Swipe>): RealtimeChannel => {
    return supabase
      .channel(`swipes:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'swipes', filter: `room_id=eq.${roomId}` },
        (payload) => handler(toRealtimePayload<Swipe>(payload)),
      )
      .subscribe();
  },

  getOpponentSwipeCount: async (roomId: string, currentUserId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .neq('user_id', currentUserId);

    if (error) {
      throw error;
    }

    return count ?? 0;
  },

  getActiveRoomsForUser: async (
    userId: string,
  ): Promise<(Room & { participantCount: number })[]> => {
    const { data: memberships, error: memError } = await supabase
      .from('room_users')
      .select('room_id')
      .eq('user_id', userId)
      .neq('status', 'left');

    if (memError) throw memError;

    const roomIds = Array.from(new Set((memberships ?? []).map((m) => m.room_id)));
    if (roomIds.length === 0) return [];

    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .in('id', roomIds)
      .in('status', ['waiting', 'swiping'])
      .order('created_at', { ascending: false })
      .returns<Room[]>();

    if (roomsError) throw roomsError;
    if (!rooms || rooms.length === 0) return [];

    const { data: members, error: countError } = await supabase
      .from('room_users')
      .select('room_id, status')
      .in('room_id', rooms.map((r) => r.id))
      .neq('status', 'left');

    if (countError) throw countError;

    const counts = new Map<string, number>();
    (members ?? []).forEach((m) => {
      counts.set(m.room_id, (counts.get(m.room_id) ?? 0) + 1);
    });

    return rooms.map((room) => ({
      ...room,
      participantCount: counts.get(room.id) ?? 0,
    }));
  },

  getRoomCountForUser: async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('room_users')
      .select('room_id')
      .eq('user_id', userId);

    if (error) throw error;

    return new Set((data ?? []).map((r) => r.room_id)).size;
  },

  getUserStats: async (userId: string): Promise<{ matchCount: number }> => {
    const { data: userRooms, error: roomsError } = await supabase
      .from('room_users')
      .select('room_id')
      .eq('user_id', userId);

    if (roomsError) throw roomsError;
    if (!userRooms || userRooms.length === 0) return { matchCount: 0 };

    const roomIds = userRooms.map((r) => r.room_id);
    
    const { count, error: countError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .in('room_id', roomIds);

    if (countError) throw countError;

    return { matchCount: count ?? 0 };
  },

  getStreakAndTaste: async (userId: string): Promise<{ streakDays: number; topGenreId: number | null }> => {
    // --- Streak: count consecutive distinct days the user joined a room ---
    const { data: sessions, error: sessErr } = await supabase
      .from('room_users')
      .select('joined_at')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    let streakDays = 0;
    if (!sessErr && sessions && sessions.length > 0) {
      const days = Array.from(
        new Set(
          sessions.map((s) => new Date(s.joined_at).toISOString().slice(0, 10)),
        ),
      ).sort((a, b) => (a > b ? -1 : 1)); // descending

      const today = new Date().toISOString().slice(0, 10);
      let cursor = today;
      for (const day of days) {
        if (day === cursor) {
          streakDays++;
          const d = new Date(cursor);
          d.setDate(d.getDate() - 1);
          cursor = d.toISOString().slice(0, 10);
        } else {
          break;
        }
      }
    }

    // --- Taste DNA: most common genre from liked swipes ---
    const { data: likedSwipes, error: swipeErr } = await supabase
      .from('swipes')
      .select('room_movie_id')
      .eq('user_id', userId)
      .eq('liked', true);

    let topGenreId: number | null = null;
    if (!swipeErr && likedSwipes && likedSwipes.length > 0) {
      const movieIds = likedSwipes.map((s) => s.room_movie_id);
      const { data: movies, error: movErr } = await supabase
        .from('room_movies')
        .select('genre_ids')
        .in('id', movieIds);

      if (!movErr && movies) {
        const tally: Record<number, number> = {};
        for (const m of movies) {
          for (const gid of (m.genre_ids ?? []) as number[]) {
            tally[gid] = (tally[gid] ?? 0) + 1;
          }
        }
        const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) topGenreId = Number(sorted[0][0]);
      }
    }

    return { streakDays, topGenreId };
  },

  getRecentMatches: async (
    userId: string,
    limit = 10,
  ): Promise<(Match & { movie: RoomMovie })[]> => {
    const { data: userRooms, error: roomsError } = await supabase
      .from('room_users')
      .select('room_id')
      .eq('user_id', userId);

    if (roomsError) throw roomsError;
    if (!userRooms || userRooms.length === 0) return [];

    const roomIds = userRooms.map((r) => r.room_id);

    // Using raw any cast here to satisfy Supabase's generated types if room_movies isn't perfectly mapped in join
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`*, room_movies:room_movie_id(*)`)
      .in('room_id', roomIds)
      .order('matched_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (matches ?? []).map((m: any) => ({
      ...m,
      movie: m.room_movies,
    }));
  },
};
