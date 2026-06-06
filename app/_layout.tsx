import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ToastProvider } from '@/components/Toast';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <ToastProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="create-room" />
            <Stack.Screen name="room/[code]" />
            <Stack.Screen name="arena" />
            <Stack.Screen name="match" options={{ presentation: 'transparentModal' }} />
          </Stack>
        </GestureHandlerRootView>
      </ToastProvider>
    </ThemeProvider>
  );
}
