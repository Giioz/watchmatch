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

const FILM_CARDS = [
  { genre: 'SCI-FI', emoji: '🎬', color: '#22c55e' },
  { genre: 'DRAMA', emoji: '🎭', color: '#a78bfa', isMatch: true },
  { genre: 'COMEDY', emoji: '🎪', color: '#f59e0b' },
];

export default function IndexScreen() {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const joinAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(actionsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
    ]).start();

    // Orb drift animations
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
  }, []);

  const openJoin = () => {
    setIsJoining(true);
    Animated.spring(joinAnim, { toValue: 1, useNativeDriver: true, tension: 70, friction: 12 }).start();
  };

  const closeJoin = () => {
    Animated.spring(joinAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }).start(() => {
      setIsJoining(false);
      setRoomCode('');
    });
  };

  const handleJoin = () => {
    if (roomCode.length === 4) {
      router.push(`/room/${roomCode.toUpperCase()}`);
    }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      {/* Ambient orbs */}
      <Animated.View
        style={[{
          position: 'absolute', width: 260, height: 260,
          borderRadius: 130, backgroundColor: '#7c3aed',
          opacity: 0.15, top: -80, left: -80,
        }, orb1Style]}
        pointerEvents="none"
      />
      <Animated.View
        style={[{
          position: 'absolute', width: 180, height: 180,
          borderRadius: 90, backgroundColor: '#4f46e5',
          opacity: 0.12, bottom: 60, right: -50,
        }, orb2Style]}
        pointerEvents="none"
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'space-between' }}
        >
          {/* Header */}
          <Animated.View style={[{ paddingHorizontal: 32, paddingTop: 52 }, fadeUp(headerAnim)]}>
            <Text style={{
              fontSize: 11, letterSpacing: 3.5, textTransform: 'uppercase',
              color: '#7c3aed', fontWeight: '500', marginBottom: 14,
            }}>
              Your next watch, decided
            </Text>
            <Text style={{
              fontSize: 52, fontWeight: '300', color: '#f1f0f8',
              lineHeight: 52, letterSpacing: -1,
            }}>
              Watch<Text style={{ color: '#a78bfa', fontWeight: '600' }}>Match</Text>
            </Text>
            <Text style={{
              marginTop: 12, fontSize: 13, color: '#52525b',
              fontWeight: '300', letterSpacing: 0.4,
            }}>
              Swipe. Match. Watch together.
            </Text>
          </Animated.View>

          {/* Film strip */}
          <Animated.View style={[{
            flexDirection: 'row', gap: 10,
            paddingHorizontal: 32, marginTop: 36,
          }, fadeUp(cardsAnim)]}>
            {FILM_CARDS.map((card) => (
              <View
                key={card.genre}
                style={{
                  flex: 1, height: 100, borderRadius: 10,
                  backgroundColor: '#18181b',
                  borderWidth: 1, borderColor: '#27272a',
                  overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
                }}
              >
                {/* Top-right dot */}
                <View style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: card.color,
                }} />

                <Text style={{ fontSize: 22, opacity: 0.3 }}>{card.emoji}</Text>

                {/* Match badge on center card */}
                {card.isMatch && (
                  <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(124,58,237,0.15)',
                    borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)',
                    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
                  }}>
                    <Text style={{ fontSize: 9, color: '#a78bfa', fontWeight: '500', letterSpacing: 1.2 }}>
                      ✦ match
                    </Text>
                  </View>
                )}

                {/* Genre label */}
                <Text style={{
                  position: 'absolute', bottom: 7, left: 9,
                  fontSize: 9, color: '#71717a', fontWeight: '500', letterSpacing: 1,
                }}>
                  {card.genre}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Actions */}
          <Animated.View style={[{ paddingHorizontal: 32, paddingTop: 28 }, fadeUp(actionsAnim)]}>
            {!isJoining ? (
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push('/create-room')}
                  style={{
                    backgroundColor: '#7c3aed',
                    paddingVertical: 16, borderRadius: 14,
                    alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'row', gap: 8,
                  }}
                >
                  <Ionicons name="enter-outline" size={18} color="rgba(255,255,255,0.8)" />
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500', letterSpacing: 0.2 }}>
                    Create a Room
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={openJoin}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 1, borderColor: '#27272a',
                    paddingVertical: 15, borderRadius: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#a1a1aa', fontSize: 15, fontWeight: '400' }}>
                    Join Existing Room
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/auth' as any)}
                  style={{
                    alignItems: 'center',
                    paddingVertical: 8,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '500', letterSpacing: 0.2 }}>
                    Sign In or Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Animated.View style={{
                gap: 12,
                opacity: joinAnim,
                transform: [{ translateY: joinAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <TextInput
                    value={roomCode}
                    onChangeText={(t) => setRoomCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="CODE"
                    placeholderTextColor="#3f3f46"
                    maxLength={4}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoFocus
                    style={{
                      flex: 1, height: 58,
                      backgroundColor: '#18181b',
                      borderWidth: 1,
                      borderColor: roomCode.length > 0 ? '#7c3aed' : '#3f3f46',
                      color: '#f4f4f5', fontSize: 22, fontWeight: '500',
                      textAlign: 'center', letterSpacing: 10,
                      borderRadius: 14,
                    }}
                  />
                  <TouchableOpacity
                    disabled={roomCode.length !== 4}
                    onPress={handleJoin}
                    activeOpacity={0.8}
                    style={{
                      width: 58, height: 58, borderRadius: 14,
                      backgroundColor: roomCode.length === 4 ? '#7c3aed' : '#27272a',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={22}
                      color={roomCode.length === 4 ? '#fff' : '#52525b'}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={closeJoin} activeOpacity={0.6} style={{ alignItems: 'center', paddingVertical: 4 }}>
                  <Text style={{
                    color: '#52525b', fontSize: 11, fontWeight: '500',
                    letterSpacing: 1.5, textTransform: 'uppercase',
                  }}>
                    Nevermind, go back
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>

          {/* Footer */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 32, paddingBottom: 28, paddingTop: 20, gap: 12,
          }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#1c1c22' }} />
            <Text style={{ fontSize: 10, color: '#3f3f46', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              No account needed
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#1c1c22' }} />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}