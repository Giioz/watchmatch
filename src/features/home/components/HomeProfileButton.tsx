import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface HomeProfileButtonProps {
  user: User;
  onPress: () => void;
}

function getInitial(user: User) {
  const label = user.user_metadata?.display_name ?? user.email ?? 'W';
  return label.trim().charAt(0).toUpperCase() || 'W';
}

export default function HomeProfileButton({ user, onPress }: HomeProfileButtonProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={styles.button}
    >
      <Text style={styles.initial}>{getInitial(user)}</Text>
      <Ionicons name="person-outline" size={13} color={colors.primary} style={styles.badge} />
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.text,
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
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.textMuted,
    paddingTop: 2,
  },
});
