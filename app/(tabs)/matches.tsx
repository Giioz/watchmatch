import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Clipboard,
  Platform,
  DeviceEventEmitter,
  ScrollView,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as WebBrowser from 'expo-web-browser';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { movieService } from '@/services/tmdbApi';
import { personalLibraryService } from '@/services/personalLibraryService';
import { TMDBMediaItem } from '@/types/movie';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';
import { useToast } from '@/components/Toast';
import HomeMovieBottomSheet from '@/features/home/components/HomeMovieBottomSheet';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

interface DiscoverCardProps {
  movie: TMDBMediaItem;
  height: number;
  isActive: boolean;
  onOpenDetails: (movie: TMDBMediaItem) => void;
  onShare: (movieTitle: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

function DiscoverCard({ movie, height, isActive, onOpenDetails, onShare, isMuted, setIsMuted }: DiscoverCardProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const { showToast } = useToast();

  const [providers, setProviders] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  const likeScale = useRef(new RNAnimated.Value(1)).current;
  const watchScale = useRef(new RNAnimated.Value(1)).current;

  // Reset states when card goes off-focus, and trigger autoplay with delay when ready
  useEffect(() => {
    if (!isActive) {
      setIsPlayerReady(false);
      setShouldPlay(false);
    }
  }, [isActive]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && isPlayerReady) {
      // Add a robust 500ms delay to ensure the WebView JS bridge is fully initialized
      // and ready to accept postMessage commands for autoplay.
      timer = setTimeout(() => {
        setShouldPlay(true);
      }, 500);
    } else {
      setShouldPlay(false);
    }
    return () => clearTimeout(timer);
  }, [isActive, isPlayerReady]);

  useEffect(() => {
    let active = true;
    async function checkStatus() {
      const liked = await personalLibraryService.isLiked(movie.id);
      const watchlisted = await personalLibraryService.isInWatchlist(movie.id);
      if (active) {
        setIsLiked(liked);
        setIsWatchlisted(watchlisted);
      }
    }
    checkStatus();

    // Fetch providers
    movieService.getWatchProviders(movie.id, 'movie').then((data) => {
      if (active && data?.results) {
        const countryResults = data.results.US || data.results.GB || Object.values(data.results)[0];
        if (countryResults?.flatrate) {
          setProviders(countryResults.flatrate.slice(0, 3));
        }
      }
    });

    // Fetch trailers
    movieService.getMovieVideos(movie.id, 'movie').then((data) => {
      if (active && data?.results) {
        const trailer = data.results.find(
          (v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
        ) || data.results.find(
          (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
        ) || data.results.find(
          (v: any) => v.site === 'YouTube'
        );
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      }
    });

    const subscription = DeviceEventEmitter.addListener('LIBRARY_UPDATED', () => {
      checkStatus();
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [movie.id]);

  const handlePlayTrailer = async () => {
    if (trailerKey) {
      const url = `https://www.youtube.com/watch?v=${trailerKey}`;
      try {
        await WebBrowser.openBrowserAsync(url, {
          readerMode: false,
          enableBarCollapsing: true,
          dismissButtonStyle: 'close',
        });
      } catch (err) {
        console.error('Failed to open trailer browser:', err);
        showToast({ message: 'Could not open trailer link.', type: 'info', icon: 'alert-circle-outline' });
      }
    } else {
      showToast({ message: 'No trailer is available for this title.', type: 'info', icon: 'alert-circle-outline' });
    }
  };

  const animateButton = (anim: RNAnimated.Value) => {
    RNAnimated.sequence([
      RNAnimated.timing(anim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      RNAnimated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleLike = async () => {
    animateButton(likeScale);
    const nextState = !isLiked;
    setIsLiked(nextState);
    if (nextState) {
      await personalLibraryService.addLike(movie);
      showToast({ message: `"${movie.title || movie.name}" added to Likes!`, type: 'success', icon: 'heart' });
    } else {
      await personalLibraryService.removeLike(movie.id);
      showToast({ message: `Removed "${movie.title || movie.name}" from Likes`, type: 'info', icon: 'heart-outline' });
    }
    DeviceEventEmitter.emit('LIBRARY_UPDATED');
  };

  const handleWatchlist = async () => {
    animateButton(watchScale);
    const nextState = !isWatchlisted;
    setIsWatchlisted(nextState);
    if (nextState) {
      await personalLibraryService.addToWatchlist(movie);
      showToast({ message: `"${movie.title || movie.name}" added to Watchlist`, type: 'success', icon: 'bookmark' });
    } else {
      await personalLibraryService.removeFromWatchlist(movie.id);
      showToast({ message: `Removed "${movie.title || movie.name}" from Watchlist`, type: 'info', icon: 'bookmark-outline' });
    }
    DeviceEventEmitter.emit('LIBRARY_UPDATED');
  };

  const backdropUri = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null);

  const releaseYear = (movie.release_date ?? '').slice(0, 4);

  // Map genres
  const genres = movie.genre_ids && movie.genre_ids.length > 0
    ? movie.genre_ids.map((id: number) => GENRE_MAP[id]).filter(Boolean)
    : [];

  const primaryGenre = genres.length > 0 ? ` • ${genres[0].toUpperCase()}` : '';

  return (
    <View style={[styles.card, { height }]}>
      {/* Immersive Background Backdrop */}
      {backdropUri ? (
        <Image source={{ uri: backdropUri }} style={styles.cardBackdrop} resizeMode="cover" />
      ) : (
        <View style={styles.backdropFallback}>
          <Ionicons name="film" size={64} color={colors.textMuted} />
        </View>
      )}

      {/* Dark Vignette Overlay for rich contrast (Applies to Backdrop only) */}
      <View style={styles.vignetteOverlay} pointerEvents="none" />

      {/* Blur background when video is active to focus on the player */}
      {isActive && trailerKey && (
        <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
      )}

      {/* Inline YouTube Player */}
      {isActive && trailerKey && (
        <View style={styles.videoContainer} pointerEvents="box-none">
          <YoutubePlayer
            height={SCREEN_HEIGHT}
            width={SCREEN_HEIGHT * 16 / 9} // Makes the iframe very wide to maintain 16:9, simulating object-fit: cover
            play={shouldPlay}
            videoId={trailerKey}
            mute={isMuted}
            volume={isMuted ? 0 : 100}
            onReady={() => setIsPlayerReady(true)}
            forceAndroidAutoplay={true}
            webViewProps={{
              mediaPlaybackRequiresUserAction: false,
              allowsInlineMediaPlayback: true,
              androidLayerType: 'hardware',
            }}
            initialPlayerParams={{
              controls: 0,
              modestbranding: 1,
              loop: 1,
              cc_load_policy: 0,
              preventFullScreen: true,
              rel: 0,
            }}
          />
          {!isPlayerReady && (
             <View style={styles.playerLoader}>
               <ActivityIndicator size="large" color={colors.primary} />
             </View>
          )}
        </View>
      )}

      {/* Bottom Overlay for Text Legibility */}
      <View style={styles.bottomOverlay} pointerEvents="none" />

      {/* Main Content Containers */}
      <RNAnimated.View 
        style={[
          styles.cardContent, 
          contentOffsetY ? { transform: [{ translateY: contentOffsetY }] } : {}
        ]} 
        pointerEvents="box-none"
      >
        
        {/* Left Panel: Movie Info */}
        <View style={styles.leftPanel} pointerEvents="box-none">

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={isExpanded ? undefined : 2}>
            {movie.title ?? movie.name ?? 'Untitled'}
          </Text>

          {/* Metadata Row (Always visible) */}
          <View style={styles.metaRow}>
            {movie.vote_average ? (
              <View style={styles.metaBadge}>
                <Ionicons name="star" size={10} color="#facc15" />
                <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
              </View>
            ) : null}

            {genres.length > 0 ? (
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{genres[0]}</Text>
              </View>
            ) : null}

            {isExpanded && releaseYear ? (
              <View style={styles.metaBadge}>
                <Ionicons name="calendar-outline" size={10} color={colors.primary} />
                <Text style={styles.metaBadgeText}>{releaseYear}</Text>
              </View>
            ) : null}

            {isExpanded ? (
              <View style={styles.metaBadge}>
                <Text style={styles.typeText}>MOVIE</Text>
              </View>
            ) : null}
          </View>

          {/* Expanded Only Details */}
          {isExpanded && (
            <View style={styles.expandedDetailsContainer}>
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.expandedOverviewScroll}
                nestedScrollEnabled={true}
              >
                <Text style={styles.cardOverviewExpanded}>
                  {movie.overview || 'No storyline description is currently available for this title.'}
                </Text>

                {genres.length > 1 && (
                  <View style={[styles.genresRow, { marginTop: 12 }]}>
                    {genres.slice(1).map((g: string, i: number) => (
                      <View key={i} style={styles.genreTag}>
                        <Text style={styles.genreTagText}>{g}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* Toggle Expand Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.expandToggleButton}
          >
            <Text style={styles.seeMoreText}>
              {isExpanded ? 'Show less' : 'See more'}
            </Text>
          </TouchableOpacity>

        </View>

        {/* Right Panel: Interactive TikTok Actions */}
        <View style={styles.rightPanel}>
          
          {/* Like Button */}
          <View style={styles.actionItem}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={handleLike} 
              style={[styles.actionButtonCircle, isLiked && styles.activeLikeCircle]}
            >
              <RNAnimated.View style={{ transform: [{ scale: likeScale }] }}>
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? '#ef4444' : '#fff'} 
                />
              </RNAnimated.View>
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{isLiked ? 'Liked' : 'Like'}</Text>
          </View>

          {/* Watchlist Button */}
          <View style={styles.actionItem}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={handleWatchlist} 
              style={[styles.actionButtonCircle, isWatchlisted && styles.activeWatchlistCircle]}
            >
              <RNAnimated.View style={{ transform: [{ scale: watchScale }] }}>
                <Ionicons 
                  name={isWatchlisted ? "bookmark" : "bookmark-outline"} 
                  size={22} 
                  color={isWatchlisted ? '#3b82f6' : '#fff'} 
                />
              </RNAnimated.View>
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{isWatchlisted ? 'Saved' : 'Save'}</Text>
          </View>

          {/* Providers Logo Column */}
          {providers.length > 0 && (
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => onOpenDetails(movie)} 
              style={styles.actionItem}
            >
              <View style={styles.providersContainer}>
                {providers.map((p, idx) => (
                  <Image
                    key={p.provider_id}
                    source={{ uri: `https://image.tmdb.org/t/p/w92${p.logo_path}` }}
                    style={[
                      styles.providerBadgeIcon,
                      idx > 0 && { marginTop: -8 } // Stacking overlay effect
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.actionLabel}>Stream</Text>
            </TouchableOpacity>
          )}

          {/* Mute/Audio Button */}
          {trailerKey && (
            <View style={styles.actionItem}>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => setIsMuted(!isMuted)} 
                style={[
                  styles.actionButtonCircle, 
                  !isMuted && styles.activeSpeakerCircle,
                  isMuted && { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
                ]}
              >
                <Ionicons 
                  name={isMuted ? "volume-mute-outline" : "volume-high-outline"} 
                  size={20} 
                  color="#fff" 
                />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>{isMuted ? 'Mute' : 'Audio'}</Text>
            </View>
          )}

          {/* Info Button */}
          <View style={styles.actionItem}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => onOpenDetails(movie)} 
              style={[styles.actionButtonCircle, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}
            >
              <Ionicons name="information-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Info</Text>
          </View>

          {/* Share Button */}
          <View style={styles.actionItem}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => onShare(movie.title ?? movie.name ?? 'Untitled')} 
              style={[styles.actionButtonCircle, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}
            >
              <Ionicons name="share-social-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Share</Text>
          </View>
        </View>

      </View>
    </View>
  );
}

export default function DiscoverScreen() {
  const { user } = useAuthSession();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const styles = useAppStyles(createStyles);

  const [movies, setMovies] = useState<TMDBMediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [selectedMovie, setSelectedMovie] = useState<TMDBMediaItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [layoutHeight, setLayoutHeight] = useState<number>(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const lastOffsetY = useRef(0);
  const isTabBarVisibleRef = useRef(true);
  const tabBarOffsetAnim = useRef(new RNAnimated.Value(0)).current;

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const diff = offsetY - lastOffsetY.current;

    if (diff > 5 && isTabBarVisibleRef.current) {
      // Scrolling down -> Hide Tab Bar
      isTabBarVisibleRef.current = false;
      DeviceEventEmitter.emit('TOGGLE_TAB_BAR', false);
      RNAnimated.spring(tabBarOffsetAnim, {
        toValue: Platform.OS === 'ios' ? 76 : 56, // Shift down to fill the gap
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start();
    } else if (diff < -5 && !isTabBarVisibleRef.current) {
      // Scrolling up -> Show Tab Bar
      isTabBarVisibleRef.current = true;
      DeviceEventEmitter.emit('TOGGLE_TAB_BAR', true);
      RNAnimated.spring(tabBarOffsetAnim, {
        toValue: 0, // Restore original position
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start();
    }

    lastOffsetY.current = offsetY;
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveCardIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  // Measure exact vertical space inside tab bar
  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setLayoutHeight(height);
  };

  const loadMovies = async (pageNum: number, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await movieService.discoverMedia('movie', [], pageNum);
      if (response && response.results) {
        // Filter out movies without images to preserve quality
        const filtered = response.results.filter(
          (m) => m.backdrop_path || m.poster_path
        );

        if (filtered.length === 0) {
          setHasMore(false);
        } else {
          setMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMovies = filtered.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newMovies];
          });
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to discover movies:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadMovies(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMovies(nextPage);
    }
  };

  const handleOpenDetails = (movie: TMDBMediaItem) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const handleShare = (movieTitle: string) => {
    const text = `Check out this movie recommendation: "${movieTitle}"! Discovered via WatchMatch app.`;
    Clipboard.setString(text);
    showToast({
      message: `"${movieTitle}" details copied to clipboard!`,
      type: 'success',
      icon: 'share-social-outline',
    });
  };

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: layoutHeight,
      offset: index * layoutHeight,
      index,
    }),
    [layoutHeight]
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Curate your collection</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Please sign in to discover and save new titles.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Curate your collection</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Searching for matching content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Immersive Floating Header */}
      {layoutHeight > 0 && (
        <View style={styles.floatingHeader}>
          <Text style={styles.floatingTitle}>Discover</Text>
          <View style={styles.floatingDot} />
          <Text style={styles.floatingSubtitle}>For You</Text>
        </View>
      )}

      {layoutHeight > 0 && movies.length > 0 && (
        <FlatList
          data={movies}
          keyExtractor={(item) => `discoverMovie-${item.id}`}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={layoutHeight}
          snapToAlignment="start"
          getItemLayout={getItemLayout}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          
          // Performance Optimization Props
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          removeClippedSubviews={Platform.OS === 'android'}
          disableIntervalMomentum={true}
          
          renderItem={({ item, index }) => (
            <DiscoverCard
              movie={item}
              height={layoutHeight}
              isActive={index === activeCardIndex}
              onOpenDetails={handleOpenDetails}
              onShare={handleShare}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              contentOffsetY={tabBarOffsetAnim}
            />
          )}
        />
      )}

      <HomeMovieBottomSheet
        visible={isModalVisible}
        movie={selectedMovie}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070a', // Dark deep space theme for Discover
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#07070a',
  },
  loaderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#07070a',
    paddingBottom: 80,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
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
  floatingHeader: {
    position: 'absolute',
    top: 54,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  floatingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginHorizontal: 8,
  },
  floatingSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // DiscoverCard styles
  card: {
    width: SCREEN_WIDTH,
    position: 'relative',
    backgroundColor: '#000',
  },
  cardBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#111116',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vignetteOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 250, // Made smaller so it only covers the bottom text and buttons
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Ensure perfect contrast under text widgets
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 76 : 56, // Extra padding for tab bar + bottom inset
    paddingTop: 60,
  },
  leftPanel: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingLeft: 20,
    paddingBottom: 24,
  },
  rightPanel: {
    width: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
    paddingRight: 6,
    gap: 16,
  },
  discoverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    marginBottom: 12,
    overflow: 'hidden',
  },
  discoverBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaBadgeText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '700',
  },
  typeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  descriptionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
    marginBottom: 14,
    marginRight: 10,
  },
  expandedDetailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    marginTop: 4,
    marginBottom: 10,
    marginRight: 10,
    maxHeight: 220,
  },
  expandedOverviewScroll: {
    maxHeight: 170,
  },
  cardOverview: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 13.5,
    lineHeight: 20,
  },
  cardOverviewExpanded: {
    color: '#fff',
    fontSize: 13.5,
    lineHeight: 20,
  },
  expandToggleButton: {
    paddingVertical: 4,
  },
  seeMoreText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    alignSelf: 'flex-start',
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genreTagText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '500',
  },
  // TikTok Actions
  actionItem: {
    alignItems: 'center',
    gap: 4,
  },
  actionButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  activeLikeCircle: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  activeWatchlistCircle: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  providersContainer: {
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerBadgeIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: '#000',
  },
  activeSpeakerCircle: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden', // Crop the overflowing width of the 16:9 iframe
  },
  playerLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  trailerPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  trailerPlayBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  trailerPlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
});
