import { useState, useEffect } from 'react';
import { movieService } from '@/src/services/tmdbApi';

export function useHomeMovies(limit: number = 3) {
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrendingForHome() {
      try {
        setError(null);
        const data = await movieService.discoverMedia('movie', [], 1);
        if (data && data.results) {
          setTrendingMovies(data.results.slice(0, limit));
        } else {
          setError("No data received from TMDb");
        }
      } catch (err) {
        console.error("Failed to load home preview movies:", err);
        setError("Failed to fetch movies");
      } finally {
        setLoadingMovies(false);
      }
    }
    
    loadTrendingForHome();
  }, [limit]);

  return { trendingMovies, loadingMovies, error };
}