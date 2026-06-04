import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { roomService } from '@/services/roomService';

type FavoritePartner = { name: string; matchCount: number; sessions: number; overlap: number } | null;

interface ProfileStatsState {
  matches: number;
  rooms: number;
  streakDays: number;
  genreBreakdown: Record<number, number>;
  favoritePartner: FavoritePartner;
  loading: boolean;
}

export function useProfile() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthSession();
  const [stats, setStats] = useState<ProfileStatsState>({
    matches: 0,
    rooms: 0,
    streakDays: 0,
    genreBreakdown: {},
    favoritePartner: null,
    loading: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function loadStats() {
      try {
        const [userStats, roomCount, streakTaste, breakdown, partner] = await Promise.all([
          roomService.getUserStats(user!.id),
          roomService.getRoomCountForUser(user!.id),
          roomService.getStreakAndTaste(user!.id),
          roomService.getGenreBreakdown(user!.id),
          roomService.getFavoritePartner(user!.id),
        ]);
        if (isMounted) {
          setStats({
            matches: userStats.matchCount,
            rooms: roomCount,
            streakDays: streakTaste.streakDays,
            genreBreakdown: breakdown,
            favoritePartner: partner,
            loading: false,
          });
        }
      } catch {
        if (isMounted) setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return {
    router,
    user,
    loading,
    stats,
    signOut: handleSignOut,
  };
}
