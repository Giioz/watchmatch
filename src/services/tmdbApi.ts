import { MovieItem } from '../types/movie';

/**
 * TMDB API Service Boundaries
 */
export interface TMDBService {
  discoverMovies: (filters: any, page: number) => Promise<MovieItem[]>;
  getMovieDetails: (id: number) => Promise<MovieItem>;
  getGenres: () => Promise<{ id: number; name: string }[]>;
}

// Actual API client export (stub)
export const tmdbApi = {} as TMDBService;
