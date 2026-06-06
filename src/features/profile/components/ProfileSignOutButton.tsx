import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface ProfileSignOutButtonProps {
  onPress: () => void;
}

export default function ProfileSignOutButton({ onPress }: ProfileSignOutButtonProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.button}>
      <Ionicons name="log-out-outline" size={18} color={colors.danger} />
      <Text style={styles.label}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  button: {
    marginHorizontal: 24,
    marginTop: 18,
    marginBottom: 36,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
