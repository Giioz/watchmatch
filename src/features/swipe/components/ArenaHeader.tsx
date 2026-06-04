import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ArenaHeaderProps {
  onBack: () => void;
  swipedCount: number;
  likedCount: number;
  currentIndex?: number;
  totalCount?: number;
  opponentSwipes?: number;
}

export default function ArenaHeader({
  onBack,
  likedCount,
  currentIndex,
  totalCount,
  opponentSwipes,
}: ArenaHeaderProps) {
  const isRoomMode = opponentSwipes !== undefined;
  const deckLeft =
    totalCount !== undefined && currentIndex !== undefined
      ? Math.max(0, totalCount - currentIndex)
      : undefined;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="chevron-back" size={24} color="#71717a" />
      </TouchableOpacity>

      <View style={styles.center}>
        <View style={styles.vsRow}>
          <View style={[styles.avatar, styles.youAvatar]}>
            <Text style={styles.avatarText}>You</Text>
          </View>
          {isRoomMode && (
            <>
              <Text style={styles.vs}>vs</Text>
              <View style={[styles.avatar, styles.themAvatar]}>
                <Ionicons name="person" size={16} color="#a1a1aa" />
              </View>
            </>
          )}
        </View>
        <Text style={styles.stats}>
          You {likedCount}
          {isRoomMode ? `  ·  Them ${opponentSwipes}` : ''} <Text style={styles.statsLabel}>likes</Text>
        </Text>
      </View>

      {deckLeft !== undefined ? (
        <View style={styles.deckPill}>
          <Text style={styles.deckText}>{deckLeft} left</Text>
        </View>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  center: { alignItems: 'center' },
  vsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  youAvatar: { backgroundColor: 'rgba(124,58,237,0.22)', borderColor: 'rgba(167,139,250,0.6)' },
  themAvatar: { backgroundColor: '#18181b', borderColor: '#3f3f46', width: 34 },
  avatarText: { color: '#f4f4f5', fontSize: 12, fontWeight: '700' },
  vs: { color: '#52525b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  stats: { color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginTop: 6 },
  statsLabel: { color: '#52525b', fontSize: 11, fontWeight: '500' },
  deckPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,92,240,0.4)',
    backgroundColor: 'rgba(124,92,240,0.12)',
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  deckText: { color: '#c4b5fd', fontSize: 12, fontWeight: '700' },
});
