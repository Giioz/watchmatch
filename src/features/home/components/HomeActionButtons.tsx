import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeActionButtonsProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onSignIn: () => void;
}

export default function HomeActionButtons({ onCreateRoom, onJoinRoom, onSignIn }: HomeActionButtonsProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const joinAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <View style={{ paddingHorizontal: 32, paddingTop: 28 }}>
      {!isJoining ? (
        <View style={{ gap: 12 }}>
          <TouchableOpacity activeOpacity={0.8} onPress={onCreateRoom} style={{ backgroundColor: '#7c3aed', paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
            <Ionicons name="enter-outline" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>Create a Room</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={openJoin} style={{ borderWidth: 1, borderColor: '#27272a', paddingVertical: 15, borderRadius: 14, alignItems: 'center' }}>
            <Text style={{ color: '#a1a1aa', fontSize: 15 }}>Join Existing Room</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={onSignIn} style={{ alignItems: 'center', paddingVertical: 8, marginTop: 4 }}>
            <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '500' }}>Sign In or Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View style={{ gap: 12, opacity: joinAnim, transform: [{ translateY: joinAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
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
              style={{ flex: 1, height: 58, backgroundColor: '#18181b', borderWidth: 1, borderColor: roomCode.length > 0 ? '#7c3aed' : '#3f3f46', color: '#f4f4f5', fontSize: 22, fontWeight: '500', textAlign: 'center', letterSpacing: 10, borderRadius: 14 }}
            />
            <TouchableOpacity disabled={roomCode.length !== 4} onPress={() => onJoinRoom(roomCode)} activeOpacity={0.8} style={{ width: 58, height: 58, borderRadius: 14, backgroundColor: roomCode.length === 4 ? '#7c3aed' : '#27272a', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-forward" size={22} color={roomCode.length === 4 ? '#fff' : '#52525b'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={closeJoin} activeOpacity={0.6} style={{ alignItems: 'center', paddingVertical: 4 }}>
            <Text style={{ color: '#52525b', fontSize: 11, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase' }}>Nevermind, go back</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}