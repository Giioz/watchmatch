/**
 * Represents the current active session and room state
 */
export type RoomStatus = 'IDLE' | 'WAITING' | 'MATCHING' | 'FINISHED';

export interface RoomFilter {
  genreIds: number[];
  contentType: 'movie' | 'tv' | 'both';
  yearRange?: [number, number];
  sessionLimit: number; // e.g., max 50 movies to swipe through
}

export interface RoomMember {
  id: string;
  name: string;
  isHost: boolean;
  status: 'ready' | 'swiping' | 'done';
}

export interface RoomState {
  code: string;
  status: RoomStatus;
  filters: RoomFilter;
  members: RoomMember[];
  createdAt: string;
  activeMovieIndex: number;
}
