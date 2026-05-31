import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';

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
    // GestureHandlerRootView აქ — root-ზე, ერთხელ
    // flex: 1 სავალდებულოა, თორემ ეკრანი ცარიელი იქნება
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="create-room" />
        <Stack.Screen name="waiting-room" />
        <Stack.Screen name="join-room" />
        <Stack.Screen name="room-joined" />
        <Stack.Screen name="room/[code]" />
        <Stack.Screen name="arena" />
        <Stack.Screen name="match" options={{ presentation: 'transparentModal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}