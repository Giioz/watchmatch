import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export interface OrbitAvatar {
  initial: string;
  ready: boolean;
  isHost: boolean;
}

interface RoomOrbitProps {
  avatars: OrbitAvatar[];
}

/**
 * Two avatars rotating around a center point. While a participant isn't ready
 * their avatar gently "breathes" (pulses). The whole ring slowly orbits.
 */
export default function RoomOrbit({ avatars }: RoomOrbitProps) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const counterRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

  // Always render two slots (placeholder for the empty seat).
  const slots: (OrbitAvatar | null)[] = [avatars[0] ?? null, avatars[1] ?? null];

  return (
    <View style={styles.wrap}>
      <View style={styles.centerGlow} pointerEvents="none" />
      <View style={styles.centerDot} />
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]}>
        <View style={[styles.slot, styles.slotTop]}>
          <Avatar avatar={slots[0]} counterRotate={counterRotate} />
        </View>
        <View style={[styles.slot, styles.slotBottom]}>
          <Avatar avatar={slots[1]} counterRotate={counterRotate} />
        </View>
      </Animated.View>
    </View>
  );
}

function Avatar({
  avatar,
  counterRotate,
}: {
  avatar: OrbitAvatar | null;
  // Animated rotate interpolation ('0deg' → '-360deg'). Typed as any to sidestep
  // RN's invariant AnimatedInterpolation generic across versions.
  counterRotate: any;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const breathing = avatar ? !avatar.ready : true;

  useEffect(() => {
    if (!breathing) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.94, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathing, pulse]);

  if (!avatar) {
    return (
      <Animated.View
        style={[styles.avatar, styles.avatarEmpty, { transform: [{ rotate: counterRotate }, { scale: pulse }] }]}
      >
        <Text style={styles.avatarEmptyText}>?</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.avatar,
        avatar.ready ? styles.avatarReady : styles.avatarIdle,
        { transform: [{ rotate: counterRotate }, { scale: pulse }] },
      ]}
    >
      <Text style={styles.avatarText}>{avatar.initial}</Text>
      {avatar.ready && (
        <View style={styles.readyTick}>
          <Text style={styles.readyTickText}>✓</Text>
        </View>
      )}
    </Animated.View>
  );
}

const RING = 180;
const AVATAR = 58;

const styles = StyleSheet.create({
  wrap: { width: RING, height: RING, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  centerGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(124,58,237,0.18)',
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#a78bfa',
    shadowColor: '#a78bfa',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  ring: { position: 'absolute', width: RING, height: RING },
  slot: { position: 'absolute', left: RING / 2 - AVATAR / 2, width: AVATAR, height: AVATAR },
  slotTop: { top: 0 },
  slotBottom: { bottom: 0 },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarIdle: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: 'rgba(167,139,250,0.5)' },
  avatarReady: { backgroundColor: 'rgba(34,197,94,0.2)', borderColor: '#22c55e' },
  avatarEmpty: { backgroundColor: '#15151c', borderColor: '#27272a', borderStyle: 'dashed' },
  avatarText: { color: '#f4f4f5', fontSize: 22, fontWeight: '800' },
  avatarEmptyText: { color: '#52525b', fontSize: 22, fontWeight: '800' },
  readyTick: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0f',
  },
  readyTickText: { color: '#fff', fontSize: 10, fontWeight: '900' },
});
