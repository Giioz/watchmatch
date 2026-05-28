import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import './global.css';

export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

/**
 * Root Layout - Dependency Injection & Global State Layer
 * - NativeWind Configuration
 * - Supabase Auth Session Provider
 * - Navigation Stack Boundaries
 */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    /* 
      Structural boundaries for:
      - AuthProvider (Supabase Session)
      - ThemeProvider (NativeWind Light/Dark)
    */
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create-room" />
      <Stack.Screen name="room/[code]" />
      <Stack.Screen name="swipe" />
      <Stack.Screen name="match" options={{ presentation: 'transparentModal' }} />
    </Stack>
  );
}
