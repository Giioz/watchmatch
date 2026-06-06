import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface ProfileHeaderProps {
  user: User;
  onBack: () => void;
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
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} activeOpacity={0.75} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>

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

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
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
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  meta: {
    color: colors.textSubtle,
    fontSize: 12,
    marginTop: 4,
  },
});
