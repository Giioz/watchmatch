import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WaitingRoomScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  
  // Pulse animation for the waiting ring
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(bodyAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(actionsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5500, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5500, useNativeDriver: true }),
      ])
    ).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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

  const pulseStyle = {
    transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }],
    opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0f]">
      {/* Ambient orbs */}
      <Animated.View
        style={[
          {
            position: 'absolute', width: 260, height: 260,
            borderRadius: 130, backgroundColor: '#7c3aed',
            opacity: 0.15, top: -80, left: -80,
          },
          orb1Style,
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          {
            position: 'absolute', width: 180, height: 180,
            borderRadius: 90, backgroundColor: '#4f46e5',
            opacity: 0.12, bottom: 60, right: -50,
          },
          orb2Style,
        ]}
        pointerEvents="none"
      />

      <View className="px-6 pt-4 h-14 justify-center">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] justify-center items-center"
        >
          <Ionicons name="chevron-back" size={24} color="#f1f0f8" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center px-8 pb-20">
        <Animated.View style={[{ alignItems: 'center', marginBottom: 40 }, fadeUp(headerAnim)]}>
          <Text className="text-[11px] tracking-[3.5px] uppercase text-[#7c3aed] font-medium mb-2.5">
            Room Created
          </Text>
          <Text className="text-3xl font-light text-[#f1f0f8] text-center leading-[40px] tracking-tight">
            Waiting for your <Text className="text-[#a78bfa] font-semibold">partner</Text>...
          </Text>
        </Animated.View>

        <Animated.View style={[{ alignItems: 'center' }, fadeUp(bodyAnim)]}>
          <View className="items-center justify-center w-full aspect-square max-w-[280px]">
            {/* Pulse rings */}
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', borderRadius: 140, borderWidth: 2, borderColor: '#7c3aed' }, pulseStyle]} />
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', borderRadius: 140, backgroundColor: 'rgba(124,58,237,0.1)' }]} />
            
            <View className="bg-[#111115] border border-[rgba(124,58,237,0.4)] rounded-2xl py-8 px-6 items-center w-[85%]">
              <Text className="text-[10px] tracking-[2px] uppercase text-[#71717a] font-medium mb-4">
                Your Room Code
              </Text>
              <View className="flex-row gap-2">
                {code?.split('').map((char, i) => (
                  <View
                    key={i}
                    className="w-12 h-14 rounded-xl bg-[#18181b] border border-[#2d2d3d] justify-center items-center"
                  >
                    <Text className="text-2xl font-bold text-[#f1f0f8] tracking-[2px]">
                      {char}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center gap-2 mt-8">
            <View className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
            <Text className="text-[14px] text-[#a1a1aa] font-light">
              Share this code with your partner
            </Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[{ paddingHorizontal: 32, paddingBottom: 32, gap: 12 }, fadeUp(actionsAnim)]}>
        <TouchableOpacity
          onPress={() => router.replace('/swipe')}
          activeOpacity={0.8}
          className="bg-[#7c3aed] h-14 rounded-[14px] items-center justify-center flex-row gap-2"
        >
          <Ionicons name="play-outline" size={18} color="rgba(255,255,255,0.9)" />
          <Text className="text-white text-[15px] font-medium tracking-wide">
            Start Swiping
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
          className="bg-transparent border border-[#27272a] h-14 rounded-[14px] items-center justify-center flex-row gap-2"
        >
          <Text className="text-[#a1a1aa] text-[15px] font-normal">
            Cancel
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
