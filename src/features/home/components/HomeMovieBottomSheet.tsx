import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, DeviceEventEmitter, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TMDBMediaItem } from '@/types/movie';
import { BottomSheet } from '@/components/BottomSheet';
import { movieService } from '@/services/tmdbApi';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';
import { useToast } from '@/components/Toast';
import { personalLibraryService } from '@/services/personalLibraryService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  movie: TMDBMediaItem | null;
  onClose: () => void;
}

const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export default function HomeMovieBottomSheet({ visible, movie, onClose }: BottomSheetProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const { showToast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [runtime, setRuntime] = useState<number | null>(null);
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    if (visible && movie) {
      personalLibraryService.isLiked(movie.id).then(setIsLiked);
      personalLibraryService.isInWatchlist(movie.id).then(setIsWatchlist);

      let active = true;
      const mediaType = (movie.release_date || movie.title) ? 'movie' : 'tv';

      movieService.getMovieDetails(movie.id).then((details) => {
        if (active && details?.runtime) {
          setRuntime(details.runtime);
        }
      });

      movieService.getWatchProviders(movie.id, mediaType).then((data) => {
        if (active && data?.results) {
          const countryResults = data.results.US || data.results.GB || Object.values(data.results)[0];
          if (countryResults?.flatrate) {
            setProviders(countryResults.flatrate.slice(0, 4));
          }
        }
      });

      return () => {
        active = false;
      };
    } else {
      setRuntime(null);
      setProviders([]);
    }
  }, [visible, movie]);

  if (!movie) return null;

  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    if (nextState) {
      await personalLibraryService.addLike(movie);
      showToast({ message: `"${movie.title || movie.name}" liked!`, type: 'success', icon: 'heart' });
    } else {
      await personalLibraryService.removeLike(movie.id);
      showToast({ message: `"${movie.title || movie.name}" unliked`, type: 'info', icon: 'heart-outline' });
    }
    DeviceEventEmitter.emit('LIBRARY_UPDATED');
  };

  const handleWatchlist = async () => {
    const nextState = !isWatchlist;
    setIsWatchlist(nextState);
    if (nextState) {
      await personalLibraryService.addToWatchlist(movie);
      showToast({ message: `"${movie.title || movie.name}" added to watchlist`, type: 'success', icon: 'bookmark' });
    } else {
      await personalLibraryService.removeFromWatchlist(movie.id);
      showToast({ message: `"${movie.title || movie.name}" removed from watchlist`, type: 'info', icon: 'bookmark-outline' });
    }
    DeviceEventEmitter.emit('LIBRARY_UPDATED');
  };

  const backdropUri = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null;

  const posterUri = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  const releaseYear = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);

  return (
    <BottomSheet 
      visible={visible} 
      onClose={onClose}
      backgroundColor={colors.surface}
      contentContainerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cinematic Header: Backdrop Banner + Absolute Overlapping Poster */}
          <View style={styles.headerContainer}>
            <View style={styles.bannerContainer}>
              {backdropUri ? (
                <Image source={{ uri: backdropUri }} style={styles.bannerImage} resizeMode="cover" />
              ) : (
                <View style={styles.bannerFallback}>
                  <Ionicons name="film-outline" size={32} color={colors.textMuted} />
                </View>
              )}
            </View>
            
            {/* Overlapping vertical poster */}
            <View style={styles.posterContainer}>
              {posterUri ? (
                <Image source={{ uri: posterUri }} style={styles.posterImage} resizeMode="cover" />
              ) : (
                <View style={styles.posterFallback}>
                  <Ionicons name="image-outline" size={20} color={colors.textMuted} />
                </View>
              )}
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            {/* Title block shifted right to align with the overlapping poster */}
            <View style={styles.titleBlock}>
              <Text style={styles.titleText} numberOfLines={2}>
                {movie.title ?? movie.name ?? 'Untitled'}
              </Text>
              
              <View style={styles.metaRow}>
                {releaseYear ? (
                  <View style={styles.metaBadge}>
                    <Ionicons name="calendar-outline" size={11} color={colors.primary} />
                    <Text style={styles.metaText}>{releaseYear}</Text>
                  </View>
                ) : null}
                
                {movie.vote_average ? (
                  <View style={styles.metaBadge}>
                    <Ionicons name="star" size={11} color="#facc15" />
                    <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
                  </View>
                ) : null}

                {runtime ? (
                  <View style={styles.metaBadge}>
                    <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                    <Text style={styles.metaText}>{formatTime(runtime)}</Text>
                  </View>
                ) : null}

                {movie.popularity ? (
                  <View style={styles.metaBadge}>
                    <Ionicons name="trending-up-outline" size={11} color="#38bdf8" />
                    <Text style={styles.popularityText}>{Math.round(movie.popularity)}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Storyline block */}
            <Text style={styles.sectionHeader}>STORYLINE</Text>
            <Text style={styles.overviewText}>
              {movie.overview || 'No storyline summary is currently available for this title.'}
            </Text>

            {/* Watch Providers Section */}
            {providers.length > 0 && (
              <>
                <Text style={[styles.sectionHeader, { marginTop: 24 }]}>WHERE TO WATCH</Text>
                <View style={styles.providersContainer}>
                  {providers.map((p) => (
                    <View key={p.provider_id} style={styles.providerBadge}>
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w92${p.logo_path}` }}
                        style={styles.providerLogo}
                      />
                      <Text style={styles.providerName}>{p.provider_name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>
        
        {/* Fixed Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleLike} 
            style={[styles.likeButton, isLiked && { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}
          >
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? colors.primary : colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleWatchlist} 
            style={[styles.watchlistButton, isWatchlist && styles.watchlistButtonActive]}
          >
            <Ionicons 
              name={isWatchlist ? "bookmark" : "bookmark-outline"} 
              size={18} 
              color={isWatchlist ? colors.text : (isDark ? '#000' : '#fff')} 
              style={{ marginRight: 6 }} 
            />
            <Text style={[styles.watchlistButtonText, isWatchlist && styles.watchlistButtonTextActive]}>
              {isWatchlist ? 'In Watchlist' : 'Watchlist'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.78,
    backgroundColor: colors.surface,
  },
  scrollContainer: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    position: 'relative',
    height: 150,
    marginBottom: 32,
  },
  bannerContainer: {
    width: '100%',
    height: 150,
    backgroundColor: colors.surfaceHighlight,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.55,
  },
  bannerFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterContainer: {
    position: 'absolute',
    bottom: -32,
    right: 24, // Moved to right so title can be flush left
    width: 90,
    height: 135,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  titleBlock: {
    paddingRight: 104, // Offset past the absolute poster width + space on the right
    minHeight: 103,    // Ensure title and metadata stack cleanly beside the poster height
    justifyContent: 'center',
  },
  titleText: {
    color: colors.text,
    fontSize: 24, // Slightly larger for premium feel
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 28,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  ratingText: {
    color: "#facc15",
    fontSize: 10,
    fontWeight: "700",
  },
  popularityText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  overviewText: {
    fontSize: 13.5,
    color: colors.textMuted,
    lineHeight: 22,
    fontWeight: '400',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40, // Safe area padding at the bottom of the sheet
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  likeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchlistButton: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? colors.pureWhite : colors.pureBlack, // High contrast
    borderRadius: 25,
    shadowColor: isDark ? '#fff' : '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: isDark ? colors.pureWhite : colors.pureBlack,
  },
  watchlistButtonActive: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  watchlistButtonText: {
    color: isDark ? '#000' : '#fff', // Inverse text for contrast
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  watchlistButtonTextActive: {
    color: colors.text,
  },
  providersContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 8,
  },
  providerLogo: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  providerName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
