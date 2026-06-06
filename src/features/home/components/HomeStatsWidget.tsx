import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';
interface HomeStatsWidgetProps {
  matchCount: number;
}

export default function HomeStatsWidget({ matchCount }: HomeStatsWidgetProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Ionicons name="flame" size={14} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.title}>Matches Found</Text>
      </View>
      <Text style={styles.count}>{matchCount}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: 32,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  count: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
});
