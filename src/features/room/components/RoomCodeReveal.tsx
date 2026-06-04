import React, { useEffect, useRef } from 'react';
import { Animated, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RoomCodeRevealProps {
  code: string;
  onEnter: () => void;
}

export default function RoomCodeReveal({ code, onEnter }: RoomCodeRevealProps) {
  const chars = code.split('');
  const scales = useRef(chars.map(() => new Animated.Value(0))).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.stagger(
      170,
      scales.map((value) =>
        Animated.spring(value, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      ),
    ).start();
  }, [fade, scales]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my WatchMatch room — code: ${code}`,
      });
    } catch {
      // user dismissed
    }
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <View style={styles.glow} pointerEvents="none" />
      <Text style={styles.eyebrow}>Room Created</Text>
      <Text style={styles.subtitle}>Share this code with your partner</Text>

      <View style={styles.codeRow}>
        {chars.map((char, index) => (
          <Animated.View
            key={index}
            style={[styles.charBox, { transform: [{ scale: scales[index] }] }]}
          >
            <Text style={styles.charText}>{char}</Text>
          </Animated.View>
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={handleShare} style={styles.shareButton}>
        <Ionicons name="share-social-outline" size={18} color="#c4b5fd" />
        <Text style={styles.shareText}>Share invite</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.85} onPress={onEnter} style={styles.enterButton}>
        <Text style={styles.enterText}>Enter Waiting Room</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 50,
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(124,58,237,0.18)',
    top: '22%',
  },
  eyebrow: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subtitle: { color: '#71717a', fontSize: 13, marginTop: 10 },
  codeRow: { flexDirection: 'row', gap: 12, marginTop: 34, marginBottom: 36 },
  charBox: {
    width: 62,
    height: 78,
    borderRadius: 16,
    backgroundColor: '#15151c',
    borderWidth: 1,
    borderColor: 'rgba(124,92,240,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  charText: { color: '#f4f4f5', fontSize: 38, fontWeight: '800', fontFamily: 'SpaceMono' },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  shareText: { color: '#c4b5fd', fontSize: 14, fontWeight: '600' },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 15,
    marginTop: 16,
  },
  enterText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
