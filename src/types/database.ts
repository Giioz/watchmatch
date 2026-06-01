import { TMDBMediaItem } from './movie';

export type DbRoomStatus = 'waiting' | 'swiping' | 'matched' | 'finished';
export type DbContentType = 'movie' | 'tv' | 'both';
export type DbMediaType = 'movie' | 'tv';
export type DbRoomUserRole = 'host' | 'guest';
export type DbRoomUserStatus = 'joined' | 'ready' | 'swiping' | 'done' | 'left';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: DbRoomStatus;
  content_type: DbContentType;
  genre_ids: number[];
  session_limit: number;
  matched_movie_id: number | null;
  created_at: string;
}

export interface RoomUser {
  id: string;
  room_id: string;
  user_id: string;
  role: DbRoomUserRole;
  status: DbRoomUserStatus;
  joined_at: string;
}

export interface RoomMovie {
  id: string;
  room_id: string;
  tmdb_id: number;
  position: number;
  media_type: DbMediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  vote_average: number | null;
  release_date: string | null;
  created_at: string;
}

export interface Swipe {
  id: string;
  room_id: string;
  user_id: string;
  room_movie_id: string;
  liked: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  room_id: string;
  room_movie_id: string;
  matched_at: string;
}

export interface CreateRoomInput {
  hostId: string;
  contentType: DbContentType;
  genreIds: number[];
  sessionLimit: number;
}

export interface CreateRoomResult {
  room: Room;
  hostMembership: RoomUser;
  movies: RoomMovie[];
}

export interface JoinRoomResult {
  room: Room;
  membership: RoomUser;
}

export interface RecordSwipeInput {
  roomId: string;
  userId: string;
  roomMovieId: string;
  liked: boolean;
}

export type RoomRealtimeHandler<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: Partial<T> | null;
}) => void;

export function mediaTypeForContentType(contentType: DbContentType): DbMediaType {
  return contentType === 'tv' ? 'tv' : 'movie';
}

export function roomMovieFromTMDB(
  movie: TMDBMediaItem,
  roomId: string,
  position: number,
  mediaType: DbMediaType,
) {
  return {
    room_id: roomId,
    tmdb_id: movie.id,
    position,
    media_type: mediaType,
    title: movie.title ?? movie.name ?? 'Untitled',
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path ?? null,
    overview: movie.overview ?? null,
    vote_average: movie.vote_average ?? null,
    release_date: movie.release_date ?? movie.first_air_date ?? null,
  };
}
