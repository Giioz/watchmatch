import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function JoinRoomScreen() {
  const router = useRouter();
  
  const [code, setCode] = useState('');
  
  const inputRef = useRef<TextInput>(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

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
    
    // Auto-focus input on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
  }, []);

  const handleJoin = () => {
    if (code.length !== 4) return;
    Keyboard.dismiss();
    router.push(`/room-joined?code=${code}`);
  };

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

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1"
        >
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
            <Animated.View style={[{ marginBottom: 40 }, fadeUp(headerAnim)]}>
              <Text className="text-[11px] tracking-[3.5px] uppercase text-[#7c3aed] font-medium mb-2.5">
                Join Session
              </Text>
              <Text className="text-5xl font-light text-[#f1f0f8] leading-[52px] tracking-tight">
                Join a{' '}
                <Text className="text-[#a78bfa] font-semibold">Room</Text>
              </Text>
              <Text className="mt-3 text-[13px] text-[#52525b] font-light tracking-wide leading-[18px]">
                Enter the 4-letter code from your partner to sync your watches.
              </Text>
            </Animated.View>

            <Animated.View style={fadeUp(bodyAnim)}>
              {/* Single plain TextInput */}
              <View className="items-center justify-center mb-8">
                <TextInput
                  ref={inputRef}
                  value={code}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                    setCode(cleanText.substring(0, 4));
                  }}
                  maxLength={4}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  keyboardType="default"
                  selectionColor="#a78bfa"
                  placeholder="CODE"
                  placeholderTextColor="#2d2d3d"
                  className="w-[200px] h-[80px] text-center text-5xl font-bold text-[#f1f0f8] tracking-[8px] bg-[#18181b] rounded-2xl border border-[#27272a]"
                />
              </View>
            </Animated.View>
          </View>

          <Animated.View style={[{ paddingHorizontal: 32, paddingBottom: 24 }, fadeUp(actionsAnim)]}>
            <TouchableOpacity
              onPress={handleJoin}
              activeOpacity={0.8}
              disabled={code.length !== 4}
              className={`h-14 rounded-[14px] items-center justify-center flex-row gap-2 ${code.length === 4 ? 'bg-[#7c3aed]' : 'bg-[#27272a]'}`}
            >
              <Ionicons name="enter-outline" size={18} color={code.length === 4 ? "rgba(255,255,255,0.9)" : "#71717a"} />
              <Text className={`text-[15px] font-medium tracking-wide ${code.length === 4 ? 'text-white' : 'text-[#71717a]'}`}>
                Join Room
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
