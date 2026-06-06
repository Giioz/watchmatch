import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { personalLibraryService } from '@/services/personalLibraryService';
import { LibraryMovie, MovieWatchStatus } from '@/types/library';

export const useLibrary = () => {
  const [libraryMovies, setLibraryMovies] = useState<LibraryMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    try {
      const [watchlist, likes, statusesMap] = await Promise.all([
        personalLibraryService.getWatchlist(),
        personalLibraryService.getLikes(),
        personalLibraryService.getWatchStatuses(),
      ]);

      const moviesMap = new Map<number, LibraryMovie>();

      watchlist.forEach(movie => {
        moviesMap.set(movie.id, {
          movie,
          addedAt: new Date().toISOString(),
          source: 'watchlist',
          watchStatus: statusesMap[movie.id],
        });
      });

      likes.forEach(movie => {
        if (!moviesMap.has(movie.id)) {
          moviesMap.set(movie.id, {
            movie,
            addedAt: new Date().toISOString(),
            source: 'liked',
            watchStatus: statusesMap[movie.id],
          });
        }
      });

      if (isMountedRef.current) {
        setLibraryMovies(Array.from(moviesMap.values()));
      }
    } catch (e) {
      console.error('Failed to load library', e);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      fetchLibrary();
      return () => { isMountedRef.current = false; };
    }, [fetchLibrary])
  );

  // Optimistic update: instantly patches local state, then persists async
  const updateWatchStatus = useCallback(async (status: MovieWatchStatus) => {
    // Optimistic local update
    setLibraryMovies(prev =>
      prev.map(item =>
        item.movie.id === status.movieId
          ? { ...item, watchStatus: status }
          : item
      )
    );
    // Persist in background
    await personalLibraryService.setWatchStatus(status);
  }, []);

  // Optimistic remove: instantly clears from local state, persists async
  const removeWatchStatus = useCallback(async (movieId: number) => {
    setLibraryMovies(prev =>
      prev.map(item =>
        item.movie.id === movieId
          ? { ...item, watchStatus: undefined }
          : item
      )
    );
    await personalLibraryService.removeWatchStatus(movieId);
  }, []);

  return {
    libraryMovies,
    isLoading,
    refreshLibrary: fetchLibrary,
    updateWatchStatus,
    removeWatchStatus,
  };
};
