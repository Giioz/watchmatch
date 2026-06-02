import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ArenaHeaderProps {
  onBack: () => void;
  swipedCount: number;
  likedCount: number;
  currentIndex?: number;
  totalCount?: number;
}

export default function ArenaHeader({ onBack, swipedCount, likedCount, currentIndex, totalCount }: ArenaHeaderProps) {
  const progress = totalCount && totalCount > 0 && currentIndex !== undefined ? (currentIndex / totalCount) * 100 : 0;

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
          <Text style={styles.progressText}>{currentIndex} / {totalCount} movies</Text>
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
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
  progressText: {
    color: '#71717a',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#27272a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
  },
});