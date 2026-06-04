import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DONE_KEY = 'wm_onboarding_done';
const GENRES_KEY = 'wm_taste_genres';

/**
 * First-launch taste quiz gate. Reads a persisted flag so the quiz only ever
 * shows once. `complete` stores the seed genres for the user's Taste DNA.
 */
export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DONE_KEY)
      .then((value) => {
        if (!active) return;
        setNeedsOnboarding(value !== 'true');
        setChecked(true);
      })
      .catch(() => {
        if (active) setChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const complete = useCallback(async (genreIds: number[]) => {
    setNeedsOnboarding(false);
    try {
      await AsyncStorage.multiSet([
        [DONE_KEY, 'true'],
        [GENRES_KEY, JSON.stringify(genreIds)],
      ]);
    } catch {
      // best-effort; quiz already dismissed for this session
    }
  }, []);

  return { needsOnboarding: checked && needsOnboarding, complete };
}
