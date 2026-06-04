import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLORS = ['#a78bfa', '#7c3aed', '#facc15', '#fbbf24', '#c4b5fd', '#f0abfc'];

interface ConfettiProps {
  /** Number of pieces. */
  count?: number;
  /** Whether the burst is active. */
  active?: boolean;
}

/**
 * Lightweight, dependency-free confetti burst built on the Animated API.
 * Each piece falls from the top with horizontal drift and rotation.
 */
export default function Confetti({ count = 80, active = true }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        startX: Math.random() * SCREEN_WIDTH,
        drift: (Math.random() - 0.5) * 120,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 600,
        duration: 2200 + Math.random() * 1500,
        rotateTo: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
      })),
    [count],
  );

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.key} {...piece} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  startX,
  drift,
  size,
  color,
  delay,
  duration,
  rotateTo,
}: {
  startX: number;
  drift: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotateTo: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_HEIGHT + 40],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, drift],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${rotateTo}deg`],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: 0,
        width: size,
        height: size * 1.4,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}
