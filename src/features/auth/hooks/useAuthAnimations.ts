import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useAuthAnimations(isSignUp: boolean) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const submitAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const confirmHeightAnim = useRef(new Animated.Value(0)).current;
  const confirmOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(formAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(submitAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5500, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5500, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (isSignUp) {
      Animated.sequence([
        Animated.timing(confirmHeightAnim, {
          toValue: 80,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(confirmOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
      return;
    }

    Animated.sequence([
      Animated.timing(confirmOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(confirmHeightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [confirmHeightAnim, confirmOpacityAnim, isSignUp]);

  const fadeUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  const orb1Style = {
    transform: [
      { translateX: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) },
      { translateY: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }) },
    ],
  };

  const orb2Style = {
    transform: [
      { translateX: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
      { translateY: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
    ],
  };

  return {
    headerAnim,
    formAnim,
    submitAnim,
    confirmHeightAnim,
    confirmOpacityAnim,
    fadeUp,
    orb1Style,
    orb2Style,
  };
}
