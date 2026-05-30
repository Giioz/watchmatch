import { RoomState } from '@/types/room';
import { MatchDetails, SwipePayload } from '@/types/swipe';

/**
 * Supabase Data Source Provider Boundaries
 */
export interface SupabaseService {
  rooms: {
    create: (payload: RoomState) => Promise<RoomState>;
    subscribe: (code: string, callback: (payload: RoomState) => void) => () => void;
    update: (code: string, updates: Partial<RoomState>) => Promise<RoomState>;
  };
  swipes: {
    record: (payload: SwipePayload) => Promise<SwipePayload>;
    onMatch: (callback: (match: MatchDetails) => void) => () => void;
  };
}

// Actual client export (stub)
export const supabaseClient = {} as SupabaseService;
