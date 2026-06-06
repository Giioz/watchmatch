import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated as RNAnimated,
  DeviceEventEmitter,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  interpolateColor,
  SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { TMDBMediaItem } from '@/types/movie';
import { personalLibraryService } from '@/services/personalLibraryService';
import { movieService } from '@/services/tmdbApi';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface TodaysPicksProps {
  userId: string;
  onPressMovie: (movie: TMDBMediaItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_HEIGHT = CARD_WIDTH * 1.45;
const SPACING = 16;
const SPACER = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

function PickCard({
  movie,
  onPress,
  userId,
  index,
  scrollX,
}: {
  movie: TMDBMediaItem;
  onPress: () => void;
  userId: string;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [runtime, setRuntime] = useState<number | null>(null);
  const [providers, setProviders] = useState<any[]>([]);

  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);

  const likeScale = useRef(new RNAnimated.Value(1)).current;
  const watchScale = useRef(new RNAnimated.Value(1)).current;

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
          setProviders(countryResults.flatrate.slice(0, 3));
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

  const triggerSpring = (animatedValue: RNAnimated.Value) => {
    RNAnimated.sequence([
      RNAnimated.timing(animatedValue, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      RNAnimated.spring(animatedValue, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleLike = async (e: any) => {
    e.stopPropagation();
    triggerSpring(likeScale);
    if (isLiked) {
      await personalLibraryService.removeLike(movie.id);
      setIsLiked(false);
    } else {
      await personalLibraryService.addLike(movie);
      setIsLiked(true);
    }
    DeviceEventEmitter.emit('LIBRARY_UPDATED');
  };

  const handleWatchlist = async (e: any) => {
    e.stopPropagation();
    triggerSpring(watchScale);
    if (isWatchlisted) {
      await personalLibraryService.removeFromWatchlist(movie.id);
      setIsWatchlisted(false);
    } else {
      await personalLibraryService.addToWatchlist(movie);
      setIsWatchlisted(true);
    }
    DeviceEventEmitter.emit('LIBRARY_UPDATED');
  };

  const posterUri = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  // Carousel Animations using Reanimated
  const ITEM_SIZE = CARD_WIDTH + SPACING;
  const inputRange = [
    (index - 1) * ITEM_SIZE,
    index * ITEM_SIZE,
    (index + 1) * ITEM_SIZE,
  ];

  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.cardContainer, cardStyle]}>
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
        {/* Poster */}
        {posterUri ? (
          <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterFallback}>
            <Ionicons name="film-outline" size={24} color={colors.textMuted} />
          </View>
        )}

        {/* Floating Action Pill (Top Right) */}
        <BlurView
          intensity={50}
          tint={isDark ? 'dark' : 'light'}
          style={styles.actionPill}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleWatchlist}
            style={[styles.actionPillBtn, isWatchlisted && styles.activeWatchBtn]}
          >
            <RNAnimated.View style={{ transform: [{ scale: watchScale }] }}>
              <Ionicons
                name={isWatchlisted ? 'bookmark' : 'bookmark-outline'}
                size={14}
                color={isWatchlisted ? colors.primary : colors.text}
              />
            </RNAnimated.View>
          </TouchableOpacity>

          <View style={styles.actionPillSeparator} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLike}
            style={[styles.actionPillBtn, isLiked && styles.activeLikeBtn]}
          >
            <RNAnimated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={14}
                color={isLiked ? colors.success : colors.text}
              />
            </RNAnimated.View>
          </TouchableOpacity>
        </BlurView>

        {/* Movie Info Floating Widget (Bottom) */}
        <BlurView
          intensity={65}
          tint={isDark ? 'dark' : 'light'}
          style={styles.infoWidget}
        >
          <Text style={styles.title} numberOfLines={2}>
            {movie.title ?? movie.name ?? 'Untitled'}
          </Text>
          
          <View style={styles.metaRow}>
            {movie.vote_average ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color="#facc15" />
                <Text style={styles.ratingText}>
                  {movie.vote_average.toFixed(1)}
                </Text>
              </View>
            ) : null}

            {runtime ? (
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={10} color={colors.textMuted} />
                <Text style={styles.durationText}>{formatTime(runtime)}</Text>
              </View>
            ) : null}
            
            {(movie.release_date || movie.first_air_date) && (
              <Text style={styles.yearText}>
                {(movie.release_date ?? movie.first_air_date ?? '').slice(0, 4)}
              </Text>
            )}

            {providers.length > 0 ? (
              <View style={styles.providersRow}>
                {providers.map((p) => (
                  <Image
                    key={p.provider_id}
                    source={{ uri: `https://image.tmdb.org/t/p/w92${p.logo_path}` }}
                    style={styles.providerLogo}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface PaginationDotProps {
  idx: number;
  scrollX: SharedValue<number>;
  itemSize: number;
  colors: ThemeColors;
  styles: any;
  onPress: () => void;
}

function PaginationDot({
  idx,
  scrollX,
  itemSize,
  colors,
  styles,
  onPress,
}: PaginationDotProps) {
  const dotStyle = useAnimatedStyle(() => {
    // Interpolate width: active dot is 14 wide, inactive is 6 wide
    const width = interpolate(
      scrollX.value,
      [
        (idx - 1) * itemSize,
        idx * itemSize,
        (idx + 1) * itemSize,
      ],
      [6, 14, 6],
      Extrapolation.CLAMP
    );

    // Interpolate opacity: active is 1.0, inactive is 0.3
    const opacity = interpolate(
      scrollX.value,
      [
        (idx - 1) * itemSize,
        idx * itemSize,
        (idx + 1) * itemSize,
      ],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    // Interpolate backgroundColor: active is colors.primary, inactive is colors.textMuted
    const backgroundColor = interpolateColor(
      scrollX.value,
      [
        (idx - 1) * itemSize,
        idx * itemSize,
        (idx + 1) * itemSize,
      ],
      [colors.textMuted, colors.primary, colors.textMuted]
    );

    return {
      width,
      opacity,
      backgroundColor,
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.pageDotTouch}
    >
      <Animated.View style={[styles.pageIndicator, dotStyle]} />
    </TouchableOpacity>
  );
}

export default function TodaysPicks({ userId, onPressMovie }: TodaysPicksProps) {
  const [picks, setPicks] = useState<TMDBMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollX = useSharedValue(0);
  const activeIndex = useSharedValue(0);
  const flatListRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  useEffect(() => {
    let active = true;
    async function loadPicks() {
      try {
        const data = await personalLibraryService.getTodaysPicks(userId);
        if (active) {
          setPicks(data);
        }
      } catch (err) {
        console.error('Failed to load picks on mount', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPicks();
    return () => { active = false; };
  }, [userId]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      // Calculate active index based on scroll position
      const index = Math.round(event.contentOffset.x / (CARD_WIDTH + SPACING));
      activeIndex.value = index;
    },
  });

  const handlePageSelect = (index: number) => {
    if (flatListRef.current) {
      const scrollNode = flatListRef.current.scrollToOffset 
        ? flatListRef.current 
        : flatListRef.current.getNode?.();
        
      scrollNode?.scrollToOffset({
        offset: index * (CARD_WIDTH + SPACING),
        animated: true,
      });
    }
  };

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_WIDTH + SPACING,
      offset: index * (CARD_WIDTH + SPACING),
      index,
    }),
    []
  );

  const startAutoPlay = () => {
    stopAutoPlay();
    if (picks.length <= 1) return;
    
    timerRef.current = setInterval(() => {
      const currentIndex = activeIndex.value;
      const nextIndex = (currentIndex + 1) % picks.length;
      handlePageSelect(nextIndex);
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [picks.length]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Curating your daily picks...</Text>
      </View>
    );
  }

  if (picks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DAILY CURATED MIX</Text>
        <Text style={styles.sectionTitle}>Today's Picks</Text>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={picks}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        snapToAlignment="start"
        disableIntervalMomentum={true}
        getItemLayout={getItemLayout}
        contentContainerStyle={{ paddingHorizontal: SPACER - SPACING / 2, paddingBottom: 20 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        onMomentumScrollEnd={startAutoPlay}
        renderItem={({ item, index }) => (
          <PickCard
            movie={item}
            userId={userId}
            index={index}
            scrollX={scrollX}
            onPress={() => onPressMovie(item)}
          />
        )}
      />

      {/* Animated Pagination Indicators */}
      <View style={styles.paginationWrapper}>
        <View style={styles.paginationContainer}>
          {picks.map((_, idx) => {
            const ITEM_SIZE = CARD_WIDTH + SPACING;
            return (
              <PaginationDot
                key={`pageDot-${idx}`}
                idx={idx}
                scrollX={scrollX}
                itemSize={ITEM_SIZE}
                colors={colors}
                styles={styles}
                onPress={() => handlePageSelect(idx)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    marginTop: 28,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: SPACING / 2,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: isDark ? 0.4 : 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 74,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
    backgroundColor: isDark ? 'rgba(15, 15, 20, 0.8)' : 'rgba(255, 255, 255, 0.85)',
  },
  actionPillBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeWatchBtn: {
    backgroundColor: colors.primarySoft,
  },
  activeLikeBtn: {
    backgroundColor: colors.successSoft,
  },
  actionPillSeparator: {
    width: 20,
    height: 1,
    backgroundColor: colors.border,
  },
  infoWidget: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    padding: 12,
    backgroundColor: isDark ? 'rgba(15, 15, 20, 0.8)' : 'rgba(255, 255, 255, 0.85)',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.12)' : 'rgba(250, 204, 21, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '800',
  },
  yearText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  durationText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  providersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  providerLogo: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  paginationWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicator: {
    height: 6,
    borderRadius: 3,
  },
  pageDotTouch: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
