import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface HomeProfileButtonProps {
  user: User;
  onPress: () => void;
}

function getInitial(user: User) {
  const label = user.user_metadata?.display_name ?? user.email ?? 'W';
  return label.trim().charAt(0).toUpperCase() || 'W';
}

export default function HomeProfileButton({ user, onPress }: HomeProfileButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={styles.button}
    >
      <Text style={styles.initial}>{getInitial(user)}</Text>
      <Ionicons name="person-outline" size={13} color="#c4b5fd" style={styles.badge} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(24,24,27,0.96)',
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    paddingTop: 2,
  },
});
