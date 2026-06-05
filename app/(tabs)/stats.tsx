import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StreakWidget from '@/features/home/components/StreakWidget';
import { useHomeDashboard } from '@/features/home/hooks/useHomeDashboard';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

export default function StatsScreen() {
  const { user } = useAuthSession();
  const { matchCount, roomCount, streakDays, topGenreId, statsLoading } = useHomeDashboard();

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
          <ActivityIndicator size="large" color="#a78bfa" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyText: {
    color: '#71717a',
    textAlign: 'center',
    marginTop: 60,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
