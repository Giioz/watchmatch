/**
 * Normalized Movie Item derived from TMDB API
 */
export interface MovieItem {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  runtime?: number;
}

export interface MovieQueue {
  items: MovieItem[];
  totalAvailable: number;
  currentPage: number;
}

/**
 * Raw TMDB media item used directly by the current UI.
 */
export interface TMDBMediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  popularity?: number;
}

export interface TMDBDiscoverResponse {
  page: number;
  results: TMDBMediaItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreResponse {
  genres: TMDBGenre[];
}
