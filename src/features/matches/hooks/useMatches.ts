import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Match, RoomMovie } from '@/types/database';
import { roomService } from '@/services/roomService';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

export type MatchWithMovie = Match & { movie: RoomMovie };

/**
 * Aggregates everything the Matches tab needs: the full match history grid
 * plus the headline stats (total matches, top genre, longest streak). Refetches
 * on focus so newly matched films appear without a manual reload.
 */
export function useMatches() {
  const { user } = useAuthSession();
  const [matches, setMatches] = useState<MatchWithMovie[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [topGenreId, setTopGenreId] = useState<number | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [favoritePartner, setFavoritePartner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const [history, stats, streakTaste, partner] = await Promise.all([
        roomService.getRecentMatches(user.id, 60),
        roomService.getUserStats(user.id),
        roomService.getStreakAndTaste(user.id),
        roomService.getFavoritePartner(user.id),
      ]);
      setMatches(history);
      setMatchCount(stats.matchCount);
      setTopGenreId(streakTaste.topGenreId);
      setStreakDays(streakTaste.streakDays);
      setFavoritePartner(partner?.name ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refresh();
    }, [refresh]),
  );

  return { matches, matchCount, topGenreId, streakDays, favoritePartner, loading, error, user };
}
