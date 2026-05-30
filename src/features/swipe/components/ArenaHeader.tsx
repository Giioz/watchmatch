import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ArenaHeaderProps {
  onBack: () => void;
  swipedCount: number;
  likedCount: number;
}

export default function ArenaHeader({ onBack, swipedCount, likedCount }: ArenaHeaderProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#7c3aed', fontWeight: '500' },
  subtitle: { color: '#3f3f46', fontSize: 11, marginTop: 2 },
});