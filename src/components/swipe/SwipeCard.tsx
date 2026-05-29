import React from 'react';
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SWIPE_THRESHOLD  = SCREEN_WIDTH * 0.32;
const ROTATION_FACTOR  = 14;
const IMAGE_BASE_URL   = 'https://image.tmdb.org/t/p/w780';

const SNAP_BACK = { damping: 20, stiffness: 180, mass: 0.6 };
const FLY_OUT   = { damping: 22, stiffness: 200, mass: 0.5 };

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

interface SwipeCardProps {
  movie: Movie;
  onSwipeLeft:  (movie: Movie) => void;
  onSwipeRight: (movie: Movie) => void;
  isTop:  boolean;
  index:  number;
  // top card passes its translateX down so back cards can react
  topCardX?: SharedValue<number>;
}

export default function SwipeCard({
  movie,
  onSwipeLeft,
  onSwipeRight,
  isTop,
  index,
  topCardX,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const title     = movie.title ?? movie.name ?? 'Unknown';
  const year      = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);
  const rating    = movie.vote_average.toFixed(1);
  const posterUri = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null;

  const pan = Gesture.Pan()
    .minDistance(2)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      const pastThreshold = Math.abs(e.translationX) > SWIPE_THRESHOLD;
      const fastFlick     = Math.abs(e.velocityX) > 800;
      const goRight = (pastThreshold || fastFlick) && e.translationX > 0;
      const goLeft  = (pastThreshold || fastFlick) && e.translationX < 0;

      if (goRight) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { ...FLY_OUT, velocity: e.velocityX });
        translateY.value = withSpring(e.translationY * 1.5, { ...FLY_OUT, velocity: e.velocityY });
        runOnJS(onSwipeRight)(movie);
      } else if (goLeft) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { ...FLY_OUT, velocity: e.velocityX });
        translateY.value = withSpring(e.translationY * 1.5, { ...FLY_OUT, velocity: e.velocityY });
        runOnJS(onSwipeLeft)(movie);
      } else {
        translateX.value = withSpring(0, { ...SNAP_BACK, velocity: e.velocityX });
        translateY.value = withSpring(0, { ...SNAP_BACK, velocity: e.velocityY });
      }
    });

  // The X source that drives back-card animation:
  // top card uses its own translateX, back cards use topCardX prop
  const drivingX = isTop ? translateX : (topCardX ?? translateX);

  // Progress 0→1 as top card is dragged to threshold
  const swipeProgress = useDerivedValue(() =>
    interpolate(
      Math.abs(drivingX.value),
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    )
  );

  const animatedCardStyle = useAnimatedStyle(() => {
    const progress = swipeProgress.value;

    // Back cards: scale up and rise as top card is dragged
    const baseScale    = interpolate(index, [0, 1, 2], [1,    0.94,  0.88],  Extrapolate.CLAMP);
    const targetScale  = interpolate(index, [0, 1, 2], [1,    0.97,  0.94],  Extrapolate.CLAMP);
    const scale        = isTop ? 1 : baseScale + (targetScale - baseScale) * progress;

    const baseOffsetY  = interpolate(index, [0, 1, 2], [0,    18,    34],    Extrapolate.CLAMP);
    const targetOffsetY= interpolate(index, [0, 1, 2], [0,    8,     18],    Extrapolate.CLAMP);
    const offsetY      = isTop ? 0 : baseOffsetY - (baseOffsetY - targetOffsetY) * progress;

    const rotate = isTop
      ? interpolate(
          translateX.value,
          [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
          [-ROTATION_FACTOR, 0, ROTATION_FACTOR],
          Extrapolate.CLAMP
        )
      : 0;

    return {
      transform: [
        { translateX: isTop ? translateX.value : 0 },
        { translateY: isTop ? translateY.value + offsetY : offsetY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD * 0.4, SWIPE_THRESHOLD], [0, 0.7, 1], Extrapolate.CLAMP),
    transform: [
      { rotate: '-22deg' },
      { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.75, 1], Extrapolate.CLAMP) },
    ],
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.4, 0], [1, 0.7, 0], Extrapolate.CLAMP),
    transform: [
      { rotate: '22deg' },
      { scale: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0.75], Extrapolate.CLAMP) },
    ],
  }));

  const cardContent = (
    <Animated.View style={[styles.card, animatedCardStyle]}>

      {/* Full-bleed poster */}
      {posterUri ? (
        <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={styles.posterFallback}>
          <Text style={{ fontSize: 56 }}>🎬</Text>
        </View>
      )}

      {/* Dark gradient scrim over bottom of poster */}
      <View style={styles.scrim} pointerEvents="none" />

      {/* Info pill — iOS lock-screen style, sits over the bottom of the image */}
      <View style={styles.infoContainer}>
        {/* Rating badge */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {rating}</Text>
        </View>

        <Text numberOfLines={1} style={styles.title}>{title}</Text>

        {year ? (
          <Text style={styles.year}>{year}</Text>
        ) : null}

        <Text numberOfLines={2} style={styles.overview}>
          {movie.overview || 'No description available.'}
        </Text>
      </View>

      {/* LIKE */}
      <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampLeft, likeStyle]}>
        <Text style={[styles.stampText, { color: '#4ade80' }]}>LIKE</Text>
      </Animated.View>

      {/* NOPE */}
      <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampRight, nopeStyle]}>
        <Text style={[styles.stampText, { color: '#f87171' }]}>NOPE</Text>
      </Animated.View>

    </Animated.View>
  );

  if (isTop) {
    return <GestureDetector gesture={pan}>{cardContent}</GestureDetector>;
  }
  return cardContent;
}

// expose translateX so arena.tsx can pass it to back cards
export function useSwipeCardX() {
  return useSharedValue(0);
}

const CARD_HEIGHT = SCREEN_HEIGHT * 0.72;

const styles = StyleSheet.create({
  card: {
    position:        'absolute',
    width:           '100%',
    height:          '100%',
    borderRadius:    28,
    backgroundColor: '#111114',
    overflow:        'hidden',
    // iOS-style shadow
    shadowColor:     '#000',
    shadowOpacity:   0.45,
    shadowRadius:    24,
    shadowOffset:    { width: 0, height: 10 },
    elevation:       12,
  },
  poster: {
    width:  '100%',
    height: '100%',
    position: 'absolute',
  },
  posterFallback: {
    width:           '100%',
    height:          '100%',
    backgroundColor: '#1c1c1e',
    alignItems:      'center',
    justifyContent:  'center',
  },
  // multi-stop scrim: transparent → dark, covers bottom 55%
  scrim: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          '60%',
    // React Native doesn't support multi-stop gradients without expo-linear-gradient,
    // so we layer two Views to fake the effect
    backgroundColor: 'transparent',
  },
  infoContainer: {
    position:       'absolute',
    bottom:         0,
    left:           0,
    right:          0,
    paddingHorizontal: 22,
    paddingBottom:  28,
    paddingTop:     80,
    // frosted dark panel
    backgroundColor: 'rgba(10,10,15,0.72)',
  },
  ratingBadge: {
    alignSelf:       'flex-start',
    backgroundColor: 'rgba(167,139,250,0.18)',
    borderWidth:     1,
    borderColor:     'rgba(167,139,250,0.35)',
    borderRadius:    20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom:    10,
  },
  ratingText: {
    color:       '#c4b5fd',
    fontSize:    12,
    fontWeight:  '600',
    letterSpacing: 0.5,
  },
  title: {
    color:        '#ffffff',
    fontSize:     26,
    fontWeight:   '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  year: {
    color:        'rgba(255,255,255,0.45)',
    fontSize:     13,
    fontWeight:   '400',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  overview: {
    color:      'rgba(255,255,255,0.55)',
    fontSize:   13,
    lineHeight: 19,
    fontWeight: '300',
  },
  stamp: {
    position:      'absolute',
    top:           54,
    borderWidth:   2.5,
    borderRadius:  10,
    paddingHorizontal: 14,
    paddingVertical:   5,
  },
  stampLeft: {
    left:        22,
    borderColor: '#4ade80',
  },
  stampRight: {
    right:       22,
    borderColor: '#f87171',
  },
  stampText: {
    fontSize:    24,
    fontWeight:  '800',
    letterSpacing: 2,
  },
});