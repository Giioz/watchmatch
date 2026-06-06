import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StreakWidget from '@/features/home/components/StreakWidget';
import { useHomeDashboard } from '@/features/home/hooks/useHomeDashboard';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

export default function StatsScreen() {
  const { user } = useAuthSession();
  const { matchCount, roomCount, streakDays, topGenreId, statsLoading } = useHomeDashboard();
  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Sign in to view your stats</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Stats</Text>
        <Text style={styles.subtitle}>Insights into your movie watching DNA</Text>
      </View>

      {statsLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <StreakWidget
          streakDays={streakDays}
          topGenreId={topGenreId}
          matchCount={matchCount}
          roomCount={roomCount}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 60,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
