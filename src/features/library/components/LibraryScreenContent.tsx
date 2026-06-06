import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibrary } from '../hooks/useLibrary';
import { LibraryMovieCard } from './LibraryMovieCard';
import HomeMovieBottomSheet from '@/features/home/components/HomeMovieBottomSheet';
import { TMDBMediaItem } from '@/types/movie';
import { WatchProgressSheet } from './WatchProgressSheet';
import { LibraryMovie } from '@/types/library';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';
import { useToast } from '@/components/Toast';

type Tab = 'watchlist' | 'watched';

export const LibraryScreenContent = () => {
  const { libraryMovies, isLoading, refreshLibrary, updateWatchStatus, removeWatchStatus, removeFromLibrary } = useLibrary();
  const [activeTab, setActiveTab] = useState<Tab>('watchlist');
  const [selectedMovie, setSelectedMovie] = useState<LibraryMovie | null>(null);
  const [movieDetails, setMovieDetails] = useState<TMDBMediaItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const watchlistMovies = useMemo(() => {
    return libraryMovies.filter(item => {
      const status = item.watchStatus?.status || 'unwatched';
      return status === 'unwatched' || status === 'in_progress';
    }).sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [libraryMovies]);

  const watchedMovies = useMemo(() => {
    return libraryMovies.filter(item => {
      const status = item.watchStatus?.status || 'unwatched';
      return status === 'watched';
    }).sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [libraryMovies]);

  const currentList = activeTab === 'watchlist' ? watchlistMovies : watchedMovies;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLibrary(true);
    setRefreshing(false);
  }, [refreshLibrary]);

  const handleMarkWatched = useCallback(async (movie: LibraryMovie) => {
    const movieTitle = movie.movie.title || movie.movie.name || 'Movie';
    await updateWatchStatus({
      movieId: movie.movie.id,
      status: 'watched',
      progress: 100,
      updatedAt: new Date().toISOString(),
    });
    showToast({
      message: `"${movieTitle}" marked as watched`,
      type: 'success',
      icon: 'checkmark-circle',
    });
  }, [updateWatchStatus, showToast]);

  const handleUnmarkWatched = useCallback(async (movie: LibraryMovie) => {
    const movieTitle = movie.movie.title || movie.movie.name || 'Movie';
    await removeWatchStatus(movie.movie.id);
    showToast({
      message: `"${movieTitle}" moved back to watchlist`,
      type: 'info',
      icon: 'arrow-undo',
    });
  }, [removeWatchStatus, showToast]);

  const handleSaveProgress = useCallback(async (status: any) => {
    await updateWatchStatus(status);
    const progressMovie = libraryMovies.find(m => m.movie.id === status.movieId);
    const movieTitle = progressMovie?.movie?.title || progressMovie?.movie?.name || 'Movie';
    if (status.status === 'watched') {
      showToast({
        message: `"${movieTitle}" marked as watched`,
        type: 'success',
        icon: 'checkmark-circle',
      });
    } else if (status.status === 'in_progress') {
      showToast({
        message: `Progress saved: ${status.progress}m`,
        type: 'info',
        icon: 'time',
      });
    }
  }, [updateWatchStatus, showToast, libraryMovies]);

  const handleRemoveProgress = useCallback(async (movieId: number) => {
    await removeWatchStatus(movieId);
    showToast({
      message: 'Progress cleared',
      type: 'info',
      icon: 'trash-outline',
    });
  }, [removeWatchStatus, showToast]);

  const handleRemoveFromWatchlist = useCallback(async (movie: LibraryMovie) => {
    const movieTitle = movie.movie.title || movie.movie.name || 'Movie';
    await removeFromLibrary(movie.movie.id);
    showToast({
      message: `"${movieTitle}" removed from library`,
      type: 'info',
      icon: 'trash-outline',
    });
  }, [removeFromLibrary, showToast]);

  const tabs: { key: Tab; label: string; count: number; icon: string }[] = [
    { key: 'watchlist', label: 'Watchlist', count: watchlistMovies.length, icon: 'bookmark-outline' },
    { key: 'watched', label: 'Watched', count: watchedMovies.length, icon: 'checkmark-circle-outline' },
  ];

  const renderItem = useCallback(({ item }: { item: LibraryMovie }) => (
    <LibraryMovieCard
      movie={item}
      onPress={() => setMovieDetails(item.movie)}
      onPressProgress={() => setSelectedMovie(item)}
      onMarkWatched={() => handleMarkWatched(item)}
      onUnmarkWatched={() => handleUnmarkWatched(item)}
      onRemoveWatchlist={() => handleRemoveFromWatchlist(item)}
      isWatchedTab={activeTab === 'watched'}
    />
  ), [activeTab, handleMarkWatched, handleUnmarkWatched, handleRemoveFromWatchlist]);

  const keyExtractor = useCallback((item: LibraryMovie) => item.movie.id.toString(), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Ambient Orbs */}
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
        <Text style={styles.headerTitle}>Library</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.78}
            >
              <Ionicons
                name={tab.icon as any}
                size={14}
                color={isActive ? colors.pureWhite : colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
              <View style={[styles.countBadge, isActive && styles.activeCountBadge]}>
                <Text style={[styles.countBadgeText, isActive && styles.activeCountBadgeText]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name={activeTab === 'watchlist' ? 'bookmark-outline' : 'checkmark-circle-outline'}
                  size={40}
                  color={colors.textSubtle}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'watchlist' ? 'Your watchlist is empty' : 'No watched movies yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'watchlist'
                  ? 'Movies you bookmark will appear here. Start swiping to build your list!'
                  : 'When you finish a movie, mark it as watched and it will move here.'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <WatchProgressSheet
        visible={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        movie={selectedMovie}
        onSave={handleSaveProgress}
        onRemove={handleRemoveProgress}
      />

      <HomeMovieBottomSheet
        visible={!!movieDetails}
        movie={movieDetails}
        onClose={() => setMovieDetails(null)}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orbTop: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primary,
    opacity: 0.08,
    top: -60,
    right: -60,
  },
  orbBottom: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primaryHover,
    opacity: 0.06,
    bottom: -50,
    left: -50,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  tabText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: colors.pureWhite,
  },
  countBadge: {
    marginLeft: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  activeCountBadgeText: {
    color: colors.pureWhite,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  loadingText: {
    marginTop: 14,
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
