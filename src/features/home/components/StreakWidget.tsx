import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FALLBACK_WIDTH = SCREEN_WIDTH - 48;

// TMDB genre ID → display label + icon + description + color
const GENRE_MAP: Record<number, { label: string; icon: string; desc: string; color: string }> = {
  28:    { label: 'Action Junkie',    icon: 'flash-outline', desc: 'Explosions, high stakes, and relentless energy fuel your watch history.', color: '#f97316' },
  12:    { label: 'Adventure Seeker', icon: 'map-outline', desc: 'You seek epic quests, expansive worlds, and new horizons.', color: '#22c55e' },
  16:    { label: 'Anime Soul',        icon: 'sparkles-outline', desc: 'Vibrant worlds, creative artwork, and imaginative storytelling.', color: '#a78bfa' },
  35:    { label: 'Comedy King',       icon: 'happy-outline', desc: 'Laughter is your metric. You match on lighthearted, hilarious vibes.', color: '#facc15' },
  80:    { label: 'Crime Boss',        icon: 'shield-outline', desc: 'Noir atmospheres, crime syndicates, and suspenseful operations.', color: '#94a3b8' },
  99:    { label: 'Doc Lover',         icon: 'mic-outline', desc: 'Real-world stories, educational subjects, and deep-dive chronicles.', color: '#38bdf8' },
  18:    { label: 'Drama Soul',        icon: 'film-outline', desc: 'Character-driven narratives and intense emotional conflicts.', color: '#f43f5e' },
  10751: { label: 'Family Vibes',     icon: 'home-outline', desc: 'Heartwarming stories and lighthearted films fit for everyone to watch.', color: '#fb923c' },
  14:    { label: 'Fantasy Dreamer',  icon: 'moon-outline', desc: 'Magic, folklore, and mythical escapes from everyday reality.', color: '#818cf8' },
  36:    { label: 'History Buff',      icon: 'library-outline', desc: 'Period pieces, biopics, and detailed lookbacks at our historical past.', color: '#a16207' },
  27:    { label: 'Horror Fiend',      icon: 'eye-off-outline', desc: 'Fright, jump scares, and supernatural chills fuel your matches.', color: '#ef4444' },
  10402: { label: 'Music Lover',      icon: 'musical-notes-outline', desc: 'Symphonic storytelling, musicals, and rhythm-based narratives.', color: '#ec4899' },
  9648:  { label: 'Mystery Addict',   icon: 'search-outline', desc: 'Puzzle solving, cryptic clues, and unexpected plot twists.', color: '#6366f1' },
  10749: { label: 'Romantic at Heart',icon: 'heart-outline', desc: 'Warm connections, heartfelt stories, and deep emotional resonance.', color: '#fb7185' },
  878:   { label: 'Sci-Fi Explorer',  icon: 'planet-outline', desc: 'Futuristic technology, space exploration, and mind-bending ideas.', color: '#06b6d4' },
  10770: { label: 'TV Buff',          icon: 'tv-outline', desc: 'Long-form narratives, episodic dramas, and addictive series.', color: '#84cc16' },
  53:    { label: 'Thriller Chaser',  icon: 'alert-circle-outline', desc: 'Adrenaline-fueled suspense, psychological tension, and sheer danger.', color: '#fbbf24' },
  10752: { label: 'War Historian',    icon: 'flag-outline', desc: 'Historical conflicts, combat dramas, and strategic military operations.', color: '#78716c' },
  37:    { label: 'Western Fan',      icon: 'compass-outline', desc: 'Saloon standoffs, dusty desert landscapes, and lone rider narratives.', color: '#d97706' },
};

const FALLBACK_GENRE = {
  label: 'Movie Explorer',
  icon: 'film-outline',
  desc: 'A rich, diverse catalog of movies and TV shows across all categories.',
  color: '#a78bfa',
};

interface StreakWidgetProps {
  streakDays: number;
  topGenreId: number | null;
  matchCount: number;
  roomCount: number;
}

function FlameIcon({ size = 34, lit }: { size?: number; lit: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!lit) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.90, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lit]);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Ionicons name="flame" size={size} color={lit ? '#f97316' : '#3f3f46'} />
    </Animated.View>
  );
}

export default function StreakWidget({ streakDays, topGenreId, matchCount, roomCount }: StreakWidgetProps) {
  const genre = topGenreId !== null ? (GENRE_MAP[topGenreId] ?? FALLBACK_GENRE) : FALLBACK_GENRE;

  const scrollViewRef = useRef<any>(null);
  const [containerWidth, setContainerWidth] = useState(FALLBACK_WIDTH);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / containerWidth);
    if (index !== activeIndex && index >= 0 && index < 3) {
      setActiveIndex(index);
    }
  };

  const handlePageSelect = (index: number) => {
    if (containerWidth > 0 && scrollViewRef.current) {
      const scrollNode = scrollViewRef.current.scrollTo 
        ? scrollViewRef.current 
        : scrollViewRef.current.getNode?.();
        
      scrollNode?.scrollTo({
        x: index * containerWidth,
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  const onContainerLayout = (e: any) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0 && Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
    }
  };

  // Build flame dots (max 7)
  const dots = Array.from({ length: 7 }, (_, i) => i < streakDays);

  // Math sync calculations
  const syncPercentage = matchCount > 0 ? Math.min(65 + matchCount * 4, 98) : 0;

  return (
    <Animated.View
      style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
    >
      {/* Visual Ambient Depth Glows */}
      <View style={styles.glowOverlayRed} pointerEvents="none" />
      <View style={styles.glowOverlayPurple} pointerEvents="none" />

      <AnimatedScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        onLayout={onContainerLayout}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        style={styles.scrollView}
      >
        {/* SLIDE 1: STREAK */}
        <View style={[styles.slide, { width: containerWidth }]}>
          <View style={styles.slideLeft}>
            <Text style={styles.slideEyebrow}>DAILY STREAK</Text>
            <Text style={styles.slideTitle}>
              {streakDays > 0 ? `${streakDays} Day${streakDays !== 1 ? 's' : ''} Active` : 'Start your streak'}
            </Text>
            <Text style={styles.slideDesc}>
              {streakDays > 0
                ? "You're keeping the matches rolling! Open a room daily to maintain your fire."
                : 'Connect with a partner today to begin your daily movie matching streak.'}
            </Text>
            <View style={styles.dotsRow}>
              {dots.map((lit, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    lit
                      ? { backgroundColor: '#f97316', shadowColor: '#f97316', shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }
                      : { backgroundColor: '#24242b' },
                  ]}
                />
              ))}
              {streakDays > 7 && (
                <Text style={styles.dotsMore}>+{streakDays - 7}</Text>
              )}
            </View>
          </View>
          <View style={styles.slideRight}>
            <View style={styles.iconCircle}>
              <FlameIcon size={34} lit={streakDays > 0} />
            </View>
          </View>
        </View>

        {/* SLIDE 2: TASTE DNA */}
        <View style={[styles.slide, { width: containerWidth }]}>
          <View style={styles.slideLeft}>
            <Text style={[styles.slideEyebrow, { color: genre.color }]}>TASTE DNA</Text>
            <Text style={styles.slideTitle}>{genre.label}</Text>
            <Text style={styles.slideDesc}>{genre.desc}</Text>
          </View>
          <View style={styles.slideRight}>
            <View style={[styles.iconCircle, { borderColor: `${genre.color}35`, backgroundColor: `${genre.color}15` }]}>
              <Ionicons name={genre.icon as any} size={30} color={genre.color} />
            </View>
          </View>
        </View>

        {/* SLIDE 3: CHEMISTRY & STATS */}
        <View style={[styles.slide, { width: containerWidth }]}>
          <View style={styles.slideLeft}>
            <Text style={[styles.slideEyebrow, { color: '#a78bfa' }]}>CO-WATCH CHEMISTRY</Text>
            <Text style={styles.slideTitle}>
              {matchCount > 0 ? `${syncPercentage}% Movie Sync` : '0% Synergy'}
            </Text>
            
            {/* Custom Premium Chemistry Progress Bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${syncPercentage}%` }]} />
            </View>

            <View style={styles.statsMetricsRow}>
              <View style={styles.statMiniCard}>
                <Text style={styles.statNumber}>{matchCount}</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={styles.statNumber}>{roomCount}</Text>
                <Text style={styles.statLabel}>Rooms</Text>
              </View>
            </View>
          </View>
          <View style={styles.slideRight}>
            <View style={[styles.iconCircle, { borderColor: 'rgba(167, 139, 250, 0.3)', backgroundColor: 'rgba(167, 139, 250, 0.1)' }]}>
              <Ionicons name="flask-outline" size={28} color="#a78bfa" />
            </View>
          </View>
        </View>
      </AnimatedScrollView>

      {/* Pagination Page Dots */}
      <View style={styles.paginationRow}>
        {[0, 1, 2].map((idx) => {
          const safeWidth = containerWidth > 0 ? containerWidth : FALLBACK_WIDTH;
          const inputRange = [
            (idx - 1) * safeWidth,
            idx * safeWidth,
            (idx + 1) * safeWidth,
          ];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [6, 14, 6],
            extrapolate: 'clamp',
          });
          
          const dotColor = scrollX.interpolate({
            inputRange,
            outputRange: ['#3f3f46', '#a78bfa', '#3f3f46'],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => handlePageSelect(idx)}
              style={styles.pageDotTouch}
            >
              <Animated.View
                style={[
                  styles.pageIndicator,
                  { width: dotWidth, backgroundColor: dotColor },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 22,
    backgroundColor: 'rgba(21, 21, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    position: 'relative',
  },
  glowOverlayRed: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#7c3aed',
    opacity: 0.06,
    top: -40,
    left: -40,
  },
  glowOverlayPurple: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ec4899',
    opacity: 0.05,
    bottom: -50,
    right: -40,
  },
  loaderContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
  },
  slide: {
    flexDirection: 'row',
    paddingTop: 22,
    paddingBottom: 26,
    paddingHorizontal: 22,
  },
  slideLeft: {
    flex: 1.35,
    justifyContent: 'center',
  },
  slideRight: {
    flex: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideEyebrow: {
    color: '#fb7185',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  slideTitle: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  slideDesc: {
    color: '#8e8e9f',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    fontWeight: '400',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotsMore: {
    color: '#52525b',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#24242f',
    width: '100%',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#a78bfa',
  },
  statsMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '500',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
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
