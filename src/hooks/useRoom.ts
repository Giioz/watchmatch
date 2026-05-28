import { RoomState, RoomFilter } from '../types/room';

export interface RoomHookResult {
  room: RoomState | null;
  isLoading: boolean;
  createRoom: (filters: RoomFilter) => Promise<string>;
  joinRoom: (code: string) => Promise<void>;
  leaveRoom: () => void;
  updateStatus: (status: RoomState['status']) => void;
}

/**
 * Manages state machine transitions for room creation, user joining, and cleanup.
 * NO LOGIC IMPLEMENTED.
 */
export const useRoom = (roomCode?: string): RoomHookResult => {
  // Implementation will handle Supabase Realtime subs and lifecycle
  return {} as RoomHookResult;
};
