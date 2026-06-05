import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { roomService } from '@/services/roomService';

export function useProfile() {
  const router = useRouter();
  const { user, loading: loadingAuth, signOut } = useAuthSession();
  
  const [stats, setStats] = useState<{ matchCount: number; roomCount: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace('/auth');
    }
  }, [loadingAuth, router, user]);

  useEffect(() => {
    if (!user) return;
    
    let active = true;
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setStatsError(null);
        const data = await roomService.getUserStats(user.id);
        if (active) {
          setStats(data);
        }
      } catch (err) {
        if (active) {
          setStatsError(err instanceof Error ? err.message : 'Failed to fetch user statistics.');
        }
      } finally {
        if (active) {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return {
    router,
    user,
    loading: loadingAuth,
    loadingStats,
    stats,
    statsError,
    signOut: handleSignOut,
  };
}
