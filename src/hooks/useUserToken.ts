import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const USER_TOKEN_KEY = '@watchmatch_user_token';

export function useUserToken() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrGenerateToken() {
      try {
        let token = await AsyncStorage.getItem(USER_TOKEN_KEY);
        if (!token) {
          token = Crypto.randomUUID();
          await AsyncStorage.setItem(USER_TOKEN_KEY, token);
        }
        setUserToken(token);
      } catch (error) {
        console.error('Failed to load or generate user token:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrGenerateToken();
  }, []);

  return { userToken, loading };
}
