import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  user: User;
  onBack?: () => void;
}

function getProfileLabel(user: User) {
  return user.user_metadata?.display_name
    ?? user.email
    ?? 'WatchMatch user';
}

function getInitial(user: User) {
  return getProfileLabel(user).trim().charAt(0).toUpperCase() || 'W';
}

export default function ProfileHeader({ user, onBack }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} activeOpacity={0.75} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#f1f0f8" />
        </TouchableOpacity>
      )}

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(user)}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Profile</Text>
          <Text numberOfLines={1} style={styles.name}>{getProfileLabel(user)}</Text>
          <Text numberOfLines={1} style={styles.meta}>{user.email ?? 'Account ready'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#f4f4f5',
    fontSize: 28,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  name: {
    color: '#f1f0f8',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  meta: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 4,
  },
});
