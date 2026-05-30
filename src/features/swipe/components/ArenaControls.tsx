import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ArenaControlsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onRefresh: () => void;
}

export default function ArenaControls({ onSwipeLeft, onSwipeRight, onRefresh }: ArenaControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSwipeLeft} activeOpacity={0.8} style={styles.actionButton}>
        <Ionicons name="close" size={26} color="#f87171" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwipeRight} activeOpacity={0.8} style={styles.likeButton}>
        <Ionicons name="heart" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onRefresh} activeOpacity={0.7} style={styles.actionButton}>
        <Ionicons name="refresh" size={22} color="#a78bfa" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});