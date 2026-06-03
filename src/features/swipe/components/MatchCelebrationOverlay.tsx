import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { TMDBMediaItem } from '@/types/movie';

const { width, height } = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

interface MatchCelebrationOverlayProps {
  movie: TMDBMediaItem | null;
  visible: boolean;
}

export default function MatchCelebrationOverlay({ movie, visible }: MatchCelebrationOverlayProps) {
  const overlayOpacity = useSharedValue(0);
  const posterScale = useSharedValue(0.5);
  const textScale = useSharedValue(0);
  const textGlow = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      // Fade in background
      overlayOpacity.value = withTiming(1, { duration: 400 });

      // Spring up poster
      posterScale.value = withDelay(
        200,
        withSpring(1, { damping: 12, stiffness: 90 })
      );

      // Spring up text
      textScale.value = withDelay(
        500,
        withSpring(1, { damping: 10, stiffness: 100 })
      );

      // Pulse text glow
      textGlow.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      overlayOpacity.value = 0;
      posterScale.value = 0.5;
      textScale.value = 0;
    }
  }, [visible, overlayOpacity, posterScale, textScale, textGlow]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedPosterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: posterScale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
    textShadowRadius: textGlow.value * 20,
  }));

  if (!visible || !movie) return null;

  const posterUri = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null;

  return (
    <Animated.View style={[styles.container, animatedOverlayStyle]}>
      <Animated.View style={[styles.posterContainer, animatedPosterStyle]}>
        {posterUri ? (
          <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterFallback}>
            <Text style={{ fontSize: 64 }}>🎬</Text>
          </View>
        )}
        <View style={styles.overlay} />
      </Animated.View>

      <Animated.Text style={[styles.matchText, animatedTextStyle]}>
        IT'S A MATCH!
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterContainer: {
    width: width * 0.8,
    height: height * 0.55,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  matchText: {
    position: 'absolute',
    bottom: height * 0.15,
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: '#a78bfa',
    textShadowOffset: { width: 0, height: 0 },
    letterSpacing: 2,
  },
});
