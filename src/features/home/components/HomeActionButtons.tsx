import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeActionButtonsProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onSignIn: () => void;
  showAuthPrompt: boolean;
}

export default function HomeActionButtons({
  onCreateRoom,
  onJoinRoom,
  onSignIn,
  showAuthPrompt,
}: HomeActionButtonsProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleJoinMode = (showInput: boolean) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setIsJoining(showInput);
      setRoomCode('');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      {/* Action Tiles Grid */}
      <View style={styles.grid}>
        {/* Host Session Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onCreateRoom}
          style={styles.hostCard}
        >
          <View style={styles.glowOverlay} />
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleHost}>
              <Ionicons name="play" size={20} color="#ffffff" />
            </View>
            <Text style={styles.cardTagHost}>HOST SESSION</Text>
          </View>
          <Text style={styles.cardTitle}>Host a Match</Text>
          <Text style={styles.cardDesc}>
            Pick genres, invite your partner, and swipe to match.
          </Text>
        </TouchableOpacity>
        
        {/* OR Separator */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Join Session Card */}
        <View style={styles.joinCard}>
          <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
            {!isJoining ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggleJoinMode(true)}
                style={styles.joinCardButton}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircleJoin}>
                    <Ionicons name="keypad" size={20} color="#a78bfa" />
                  </View>
                  <Text style={styles.cardTagJoin}>JOIN SESSION</Text>
                </View>
                <Text style={styles.cardTitle}>Join a Friend</Text>
                <Text style={styles.cardDesc}>
                  Got a 4-digit code? Connect to their room instantly.
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.inputTitle}>ENTER ROOM CODE</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={roomCode}
                    onChangeText={(t) => setRoomCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="CODE"
                    placeholderTextColor="#3f3f46"
                    maxLength={4}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoFocus
                    style={styles.textInput}
                  />
                  <TouchableOpacity
                    disabled={roomCode.length !== 4}
                    onPress={() => onJoinRoom(roomCode)}
                    activeOpacity={0.8}
                    style={[
                      styles.submitBtn,
                      roomCode.length === 4 ? styles.submitBtnActive : styles.submitBtnDisabled
                    ]}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={roomCode.length === 4 ? '#ffffff' : '#52525b'}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => toggleJoinMode(false)}
                  activeOpacity={0.7}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </View>

      {/* Auth Prompt Link */}
      {showAuthPrompt && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSignIn}
          style={styles.authPrompt}
        >
          <Text style={styles.authPromptText}>
            Want to save your taste DNA? <Text style={styles.authLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 18,
  },
  grid: {
    flexDirection: 'column',
    gap: 16,
  },
  hostCard: {
    flex: 1,
    minHeight: 160,
    backgroundColor: '#7c3aed',
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.45)',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glowOverlay: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    opacity: 0.8,
  },
  joinCard: {
    flex: 1,
    minHeight: 160,
    backgroundColor: 'rgba(21, 21, 28, 0.8)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  joinCardButton: {
    flex: 1,
    padding: 22,
  },
  animatedContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  iconCircleHost: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleJoin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  cardTagHost: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTagJoin: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  cardDesc: {
    color: 'rgba(244, 244, 245, 0.7)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  inputContainer: {
    padding: 22,
    alignItems: 'center',
  },
  inputTitle: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(10, 10, 15, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    color: '#f4f4f5',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
    borderRadius: 12,
    paddingLeft: 8, // balance out letter spacing offset
  },
  submitBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnActive: {
    backgroundColor: '#7c3aed',
  },
  submitBtnDisabled: {
    backgroundColor: '#27272a',
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 4,
  },
  cancelText: {
    color: '#52525b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  authPrompt: {
    alignItems: 'center',
    marginTop: 22,
    paddingVertical: 8,
  },
  authPromptText: {
    color: '#52525b',
    fontSize: 12,
    fontWeight: '500',
  },
  authLink: {
    color: '#a78bfa',
    fontWeight: '700',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  orText: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginHorizontal: 16,
  },
});
