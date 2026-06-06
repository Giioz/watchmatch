import { TMDBMediaItem } from './movie';

export type WatchStatus = 'watched' | 'unwatched' | 'in_progress';

export interface MovieWatchStatus {
  movieId: number;
  status: WatchStatus;
  progress?: number; // 0 to 100
  updatedAt: string;
}

export interface LibraryMovie {
  movie: TMDBMediaItem;
  addedAt: string; // ISO string
  source: 'watchlist' | 'liked';
  watchStatus?: MovieWatchStatus;
}
