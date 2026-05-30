import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ProfileSignOutButtonProps {
  onPress: () => void;
}

export default function ProfileSignOutButton({ onPress }: ProfileSignOutButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.button}>
      <Ionicons name="log-out-outline" size={18} color="#fca5a5" />
      <Text style={styles.label}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 24,
    marginTop: 18,
    marginBottom: 36,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.28)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '700',
  },
});
