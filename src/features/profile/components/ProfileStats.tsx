import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface ProfileStatsProps {
  matchCount?: number;
  roomCount?: number;
  loading?: boolean;
}

export default function ProfileStats({
  matchCount = 0,
  roomCount = 0,
  loading = false,
}: ProfileStatsProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  const statsList = [
    { label: 'Matches', value: loading ? '...' : String(matchCount) },
    { label: 'Rooms', value: loading ? '...' : String(roomCount) },
    { label: 'Friends', value: 'Soon' },
  ];

  return (
    <View style={styles.container}>
      {statsList.map((stat) => (
        <View key={stat.label} style={styles.stat}>
          {loading && stat.value === '...' ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : (
            <Text style={styles.value}>{stat.value}</Text>
          )}
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 18,
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    minHeight: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 5,
  },
  loader: {
    marginBottom: 5,
    height: 25,
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
