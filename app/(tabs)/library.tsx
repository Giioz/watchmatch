import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LibraryScreenContent } from '@/features/library/components/LibraryScreenContent';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

export default function LibraryTab() {
  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <View style={styles.container}>
      <LibraryScreenContent />
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
