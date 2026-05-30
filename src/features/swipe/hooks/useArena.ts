import { Movie } from "@/features/swipe/components/SwipeCard";
import { movieService } from "@/src/services/tmdbApi";
import { useCallback, useEffect, useState } from "react";
import { useSharedValue } from "react-native-reanimated";

const PREFETCH_THRESHOLD = 5;
const getRandomPageNumber = () => Math.floor(Math.random() * 400) + 1;

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function useArena() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const topCardX = useSharedValue(0);

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
    loadMovies(getRandomPageNumber(), true);
  }, [loadMovies]);

  const checkAndPrefetch = useCallback(
    (nextIdx: number, total: number) => {
      if (total - nextIdx <= PREFETCH_THRESHOLD && !loadingMore) {
        loadMovies(getRandomPageNumber(), false);
      }
    },
    [loadingMore, loadMovies],
  );

  const handleSwipeRight = useCallback(() => {
    setLikedCount((p) => p + 1);
    setSwipedCount((p) => p + 1);
    topCardX.value = 0;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      checkAndPrefetch(next, movies.length);
      return next;
    });
  }, [movies.length, checkAndPrefetch, topCardX]);

  const handleSwipeLeft = useCallback(() => {
    setSwipedCount((p) => p + 1);
    topCardX.value = 0;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      checkAndPrefetch(next, movies.length);
      return next;
    });
  }, [movies.length, checkAndPrefetch, topCardX]);

  const handleRefresh = useCallback(() => {
    loadMovies(getRandomPageNumber(), true);
    setCurrentIndex(0);
  }, [loadMovies]);

  const openDetails = useCallback((movie: Movie) => {
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
    currentIndex,
    selectedMovie,
    isModalVisible,
    topCardX,
    handleSwipeLeft,
    handleSwipeRight,
    handleRefresh,
    openDetails,
    closeDetails,
  };
}
