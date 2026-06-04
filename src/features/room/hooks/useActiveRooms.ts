import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Room } from '@/types/database';
import { roomService } from '@/services/roomService';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

export type ActiveRoom = Room & { participantCount: number };

/**
 * Loads the rooms the current user is part of that are still live
 * (waiting / swiping). Refreshes every time the screen regains focus so a
 * freshly created room shows up when the user navigates back to the tab.
 */
export function useActiveRooms() {
  const { user } = useAuthSession();
  const [rooms, setRooms] = useState<ActiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setRooms([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await roomService.getActiveRoomsForUser(user.id);
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active rooms.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      refresh().finally(() => {
        if (!active) return;
      });
      return () => {
        active = false;
      };
    }, [refresh]),
  );

  return { rooms, loading, error, refresh };
}
