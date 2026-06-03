import { TMDBMediaItem } from "@/types/movie";
import { movieService } from "@/src/services/tmdbApi";
import { roomService } from "@/services/roomService";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { useCallback, useEffect, useState } from "react";
import { useSharedValue } from "react-native-reanimated";

const PREFETCH_THRESHOLD = 5;
const getRandomPageNumber = () => Math.floor(Math.random() * 400) + 1;

const shuffleArray = (array: TMDBMediaItem[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface UseArenaOptions {
  roomCode?: string;
}

export function useArena(options: UseArenaOptions = {}) {
  const { roomCode } = options;
  const { user, loading: loadingAuth } = useAuthSession();
  const [movies, setMovies] = useState<TMDBMediaItem[]>([]);
  const [roomMovieIds, setRoomMovieIds] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCodeState, setRoomCodeState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const [opponentSwipes, setOpponentSwipes] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedMovie, setSelectedMovie] = useState<TMDBMediaItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [matchedMovie, setMatchedMovie] = useState<TMDBMediaItem | null>(null);

  const topCardX = useSharedValue(0);
  const isRoomMode = Boolean(roomCode && user);

  const mapRoomMovie = useCallback((roomMovie: {
    id: string;
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string | null;
    vote_average: number | null;
    release_date: string | null;
    genre_ids?: number[] | null;
  }): TMDBMediaItem => {
    return {
      id: roomMovie.tmdb_id,
      title: roomMovie.title,
      poster_path: roomMovie.poster_path,
      backdrop_path: roomMovie.backdrop_path,
      overview: roomMovie.overview ?? "",
      vote_average: roomMovie.vote_average ?? 0,
      release_date: roomMovie.release_date ?? undefined,
      genre_ids: roomMovie.genre_ids ?? undefined,
    };
  }, []);

  const loadMovies = useCallback(async (pageNum: number, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await movieService.discoverMedia("movie", [], pageNum);
      if (data?.results && data.results.length > 0) {
        const randomizedBatch = shuffleArray(data.results);
        setMovies((prev) =>
          isInitial ? randomizedBatch : [...prev, ...randomizedBatch],
        );
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (loadingAuth) return;

    if (!isRoomMode) {
      loadMovies(getRandomPageNumber(), true);
      return;
    }

    let cancelled = false;
    const bootstrapRoomArena = async () => {
      try {
        setLoading(true);
        const room = await roomService.getRoomByCode(roomCode!);
        if (!room) {
          throw new Error("Room not found.");
        }
        const queue = await roomService.getRoomMovies(room.id);
        if (cancelled) return;
        setRoomId(room.id);
        setRoomCodeState(room.code);
        setRoomMovieIds(queue.map((movie) => movie.id));
        setMovies(queue.map(mapRoomMovie));
      } catch (error) {
        console.error("Error loading room movies:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrapRoomArena();

    return () => {
      cancelled = true;
    };
  }, [isRoomMode, loadMovies, mapRoomMovie, roomCode, loadingAuth]);

  useEffect(() => {
    if (!isRoomMode || !roomId) return;

    if (user) {
      roomService.getOpponentSwipeCount(roomId, user.id).then((count) => {
        setOpponentSwipes(count);
      }).catch(() => {});
    }

    const channel = roomService.subscribeToMatches(roomId, async (payload) => {
      if (payload.eventType !== "INSERT" || !payload.new) return;
      const queue = await roomService.getRoomMovies(roomId);
      const matched = queue.find((movie) => movie.id === payload.new?.room_movie_id);
      if (!matched) return;
      setMatchedMovie(mapRoomMovie(matched));
      roomService.setRoomStatus(roomId, "matched").catch(() => {});
    });

    const swipeChannel = roomService.subscribeToSwipes(roomId, (payload) => {
      if (payload.eventType === "INSERT" && payload.new) {
        if (user && payload.new.user_id !== user.id) {
          setOpponentSwipes((prev) => prev + 1);
        }
      }
    });

    return () => {
      channel.unsubscribe();
      swipeChannel.unsubscribe();
    };
  }, [isRoomMode, mapRoomMovie, roomId, user]);

  const checkAndPrefetch = useCallback(
    (nextIdx: number, total: number) => {
      if (isRoomMode) return;
      if (total - nextIdx <= PREFETCH_THRESHOLD && !loadingMore) {
        loadMovies(getRandomPageNumber(), false);
      }
    },
    [isRoomMode, loadingMore, loadMovies],
  );

  const handleSwipeRight = useCallback(() => {
    setLikedCount((p) => p + 1);
    setSwipedCount((p) => p + 1);
    if (isRoomMode && roomId && user) {
      const currentRoomMovieId = roomMovieIds[currentIndex];
      if (currentRoomMovieId) {
        roomService
          .recordSwipe({
            roomId,
            userId: user.id,
            roomMovieId: currentRoomMovieId,
            liked: true,
          })
          .catch((error) => console.error("Failed to record like swipe:", error));
      }
    }
    topCardX.value = 0;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      checkAndPrefetch(next, movies.length);
      return next;
    });
  }, [movies.length, checkAndPrefetch, currentIndex, isRoomMode, roomId, roomMovieIds, topCardX, user]);

  const handleSwipeLeft = useCallback(() => {
    setSwipedCount((p) => p + 1);
    if (isRoomMode && roomId && user) {
      const currentRoomMovieId = roomMovieIds[currentIndex];
      if (currentRoomMovieId) {
        roomService
          .recordSwipe({
            roomId,
            userId: user.id,
            roomMovieId: currentRoomMovieId,
            liked: false,
          })
          .catch((error) => console.error("Failed to record nope swipe:", error));
      }
    }
    topCardX.value = 0;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      checkAndPrefetch(next, movies.length);
      return next;
    });
  }, [movies.length, checkAndPrefetch, currentIndex, isRoomMode, roomId, roomMovieIds, topCardX, user]);

  const handleRefresh = useCallback(() => {
    if (isRoomMode) {
      setCurrentIndex(0);
      return;
    }
    loadMovies(getRandomPageNumber(), true);
    setCurrentIndex(0);
  }, [isRoomMode, loadMovies]);

  const openDetails = useCallback((movie: TMDBMediaItem) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  }, []);

  const closeDetails = useCallback(() => {
    setIsModalVisible(false);
    setSelectedMovie(null);
  }, []);

  return {
    movies,
    loading,
    likedCount,
    swipedCount,
    opponentSwipes,
    currentIndex,
    selectedMovie,
    isModalVisible,
    matchedMovie,
    roomId,
    roomCode: roomCodeState,
    isRoomMode,
    topCardX,
    handleSwipeLeft,
    handleSwipeRight,
    handleRefresh,
    openDetails,
    closeDetails,
  };
}
