import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Match, RoomMovie } from '@/types/database';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface RecentMatchesScrollProps {
  recentMatches: (Match & { movie: RoomMovie })[];
  loading: boolean;
  onPressMovie: (movie: RoomMovie) => void;
}

export default function RecentMatchesScroll({ recentMatches, loading, onPressMovie }: RecentMatchesScrollProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading recent matches…</Text>
      </View>
    );
  }

  if (!recentMatches || recentMatches.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No matches yet. Start a room and find a friend!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {recentMatches.map((match) => {
        const posterUri = match.movie.poster_path
          ? `https://image.tmdb.org/t/p/w200${match.movie.poster_path}`
          : null;
        return (
          <TouchableOpacity
            key={match.id}
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => onPressMovie(match.movie)}
          >
            {posterUri ? (
              <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
            ) : (
              <View style={styles.posterFallback}>
                <Ionicons name="film-outline" size={32} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Matched</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  loadingWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyWrap: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  item: {
    marginRight: 12,
    width: 100,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.pureWhite,
    fontSize: 9,
    fontWeight: '600',
  },
});
