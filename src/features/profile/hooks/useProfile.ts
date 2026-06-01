import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

export function useProfile() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthSession();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, router, user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return {
    router,
    user,
    loading,
    signOut: handleSignOut,
  };
}
