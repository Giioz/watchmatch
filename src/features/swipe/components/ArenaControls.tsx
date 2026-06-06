import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface ArenaControlsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onRefresh: () => void;
}

export default function ArenaControls({ onSwipeLeft, onSwipeRight, onRefresh }: ArenaControlsProps) {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSwipeLeft} activeOpacity={0.8} style={styles.actionButton}>
        <Ionicons name="close" size={26} color={colors.danger} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwipeRight} activeOpacity={0.8} style={styles.likeButton}>
        <Ionicons name="heart" size={28} color={colors.pureWhite} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onRefresh} activeOpacity={0.7} style={styles.actionButton}>
        <Ionicons name="refresh" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
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
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});