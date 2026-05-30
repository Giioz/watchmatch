import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { RoomState } from '@/types/room';
import { MatchDetails, SwipePayload } from '@/types/swipe';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

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
