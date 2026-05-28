/**
 * Schema for recording user decisions
 */
export type SwipeDirection = 'LEFT' | 'RIGHT';

export interface SwipePayload {
  userId: string;
  roomId: string;
  movieId: number;
  direction: SwipeDirection;
  timestamp: string;
}

export interface MatchDetails {
  movieId: number;
  userA: string;
  userB: string;
  roomCode: string;
}
