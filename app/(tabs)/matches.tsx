import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecentMatchesScroll from '@/features/home/components/RecentMatchesScroll';
import HomeMovieBottomSheet from '@/features/home/components/HomeMovieBottomSheet';
import { useHomeDashboard } from '@/features/home/hooks/useHomeDashboard';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { RoomMovie } from '@/types/database';
import { TMDBMediaItem } from '@/types/movie';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

export default function MatchesScreen() {
  const { user } = useAuthSession();
  const { recentMatches, statsLoading } = useHomeDashboard();
  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);

  const [selectedMovie, setSelectedMovie] = useState<TMDBMediaItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePressRecentMovie = (movie: RoomMovie) => {
    setSelectedMovie({
      id: movie.tmdb_id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview ?? '',
      vote_average: movie.vote_average ?? 0,
      release_date: movie.release_date ?? '',
      popularity: 0,
    });
    setIsModalVisible(true);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Sign in to view your matches</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>Recent successful co-watches</Text>
      </View>

      {statsLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <RecentMatchesScroll
          recentMatches={recentMatches}
          loading={statsLoading}
          onPressMovie={handlePressRecentMovie}
        />
      )}

      <HomeMovieBottomSheet
        visible={isModalVisible}
        movie={selectedMovie}
        onClose={() => setIsModalVisible(false)}
      />
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
    paddingBottom: 20,
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
