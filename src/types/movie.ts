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
