import { useMemo } from 'react';
import { useAppTheme } from './ThemeContext';
import { ThemeColors } from './colors';

export function useAppStyles<T>(
  styleFactory: (colors: ThemeColors, isDark: boolean) => T
): T {
  const { colors, isDark } = useAppTheme();
  
  return useMemo(() => {
    return styleFactory(colors, isDark);
  }, [colors, isDark, styleFactory]);
}
