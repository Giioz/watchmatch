import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useHomeAnimations() {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // შემოსვლის ეფექტები (Stagger)
    Animated.stagger(120, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(actionsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
    ]).start();

    // უსასრულო ლუპის ჰელპერი ბურთულებისთვის
    const createLoop = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      );
    };

    createLoop(orb1Anim, 4000).start();
    createLoop(orb2Anim, 5500).start();
  }, []);

  // ინტერპოლაციის სტილის გენერატორი
  const getOrbStyle = (anim: Animated.Value, xMax: number, yMax: number) => ({
    transform: [
      { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, xMax] }) },
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, yMax] }) },
    ],
  });

  return {
    headerAnim,
    cardsAnim,
    actionsAnim,
    orb1Style: getOrbStyle(orb1Anim, 20, 28),
    orb2Style: getOrbStyle(orb2Anim, -14, -18),
  };
}