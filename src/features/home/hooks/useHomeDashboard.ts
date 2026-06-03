import { useState, useEffect } from 'react';
import { Match, RoomMovie } from '@/types/database';
import { roomService } from '@/services/roomService';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

export function useHomeDashboard() {
  const { user } = useAuthSession();
  const [matchCount, setMatchCount] = useState(0);
  const [recentMatches, setRecentMatches] = useState<(Match & { movie: RoomMovie })[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [topGenreId, setTopGenreId] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStatsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchDashboard() {
      try {
        const [stats, matches, streakTaste] = await Promise.all([
          roomService.getUserStats(user!.id),
          roomService.getRecentMatches(user!.id),
          roomService.getStreakAndTaste(user!.id),
        ]);

        if (isMounted) {
          setMatchCount(stats.matchCount);
          setRecentMatches(matches);
          setStreakDays(streakTaste.streakDays);
          setTopGenreId(streakTaste.topGenreId);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    }

    fetchDashboard();
    return () => { isMounted = false; };
  }, [user]);

  return { matchCount, recentMatches, streakDays, topGenreId, statsLoading };
}
