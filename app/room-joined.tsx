import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function RoomJoinedScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  
  // Specific animations for this screen
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      // Checkmark bounce
      Animated.spring(checkScaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 5 }),
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(bodyAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(actionsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
    ]).start();

    // Orbs
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

      <View className="flex-1 justify-center px-8 pb-10">
        {/* Success Icon */}
        <Animated.View 
          style={{ 
            alignItems: 'center', 
            marginBottom: 32,
            transform: [{ scale: checkScaleAnim }] 
          }}
        >
          <View className="w-20 h-20 rounded-full bg-[#18181b] border border-[#27272a] items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <View className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.1)] items-center justify-center">
              <Ionicons name="checkmark-sharp" size={36} color="#22c55e" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[{ alignItems: 'center', marginBottom: 40 }, fadeUp(headerAnim)]}>
          <Text className="text-[11px] tracking-[3.5px] uppercase text-[#22c55e] font-medium mb-2.5">
            Success
          </Text>
          <Text className="text-4xl font-light text-[#f1f0f8] text-center leading-[48px] tracking-tight">
            You're <Text className="text-[#a78bfa] font-semibold">in!</Text>
          </Text>
          <Text className="mt-2 text-[14px] text-[#a1a1aa] font-light">
            You joined room <Text className="text-[#f1f0f8] font-semibold">{code}</Text>
          </Text>
        </Animated.View>

        <Animated.View style={[{ alignItems: 'center' }, fadeUp(bodyAnim)]}>
          <View className="items-center justify-center w-40 aspect-square mt-4">
            {/* Pulse rings */}
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', borderRadius: 100, borderWidth: 2, borderColor: '#7c3aed' }, pulseStyle]} />
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', borderRadius: 100, backgroundColor: 'rgba(124,58,237,0.1)' }]} />
            
            <Ionicons name="hourglass-outline" size={32} color="#a78bfa" />
          </View>
          
          <View className="flex-row items-center gap-2 mt-8">
            <View className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
            <Text className="text-[14px] text-[#a1a1aa] font-light">
              Waiting for the host to start...
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
            Ready to Swipe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
          className="bg-transparent border border-[#27272a] h-14 rounded-[14px] items-center justify-center flex-row gap-2"
        >
          <Text className="text-[#ef4444] text-[15px] font-normal">
            Leave Room
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
