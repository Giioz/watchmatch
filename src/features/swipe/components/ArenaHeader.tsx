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

export default function ArenaHeader({ onBack, swipedCount, likedCount, currentIndex, totalCount, opponentSwipes }: ArenaHeaderProps) {
  const progress = totalCount && totalCount > 0 && currentIndex !== undefined ? (currentIndex / totalCount) * 100 : 0;
  const opponentProgress = totalCount && totalCount > 0 && opponentSwipes !== undefined ? (opponentSwipes / totalCount) * 100 : 0;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color="#71717a" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Shuffle Mode</Text>
          <Text style={styles.subtitle}>
            {swipedCount} swiped · {likedCount} liked
          </Text>
        </View>

        <View style={{ width: 24 }} />
      </View>
      {totalCount !== undefined && currentIndex !== undefined && (
        <View style={styles.progressWrapper}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>You</Text>
            <View style={styles.progressBarBg}>
               <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressValue}>{currentIndex}/{totalCount}</Text>
          </View>
          
          {opponentSwipes !== undefined && (
            <View style={[styles.progressRow, { marginTop: 6 }]}>
              <Text style={styles.progressLabelFriend}>Friend</Text>
              <View style={styles.progressBarBg}>
                 <View style={[styles.progressBarFriendFill, { width: `${opponentProgress}%` }]} />
              </View>
              <Text style={styles.progressValue}>{opponentSwipes}/{totalCount}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#7c3aed', fontWeight: '500' },
  subtitle: { color: '#3f3f46', fontSize: 11, marginTop: 2 },
  progressWrapper: {
    paddingHorizontal: 24,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '600',
    width: 38,
  },
  progressLabelFriend: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
    width: 38,
  },
  progressValue: {
    color: '#71717a',
    fontSize: 9,
    fontWeight: '500',
    width: 28,
    textAlign: 'right',
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#27272a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  progressBarFriendFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
});