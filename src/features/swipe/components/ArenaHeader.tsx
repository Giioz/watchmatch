import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface ArenaHeaderProps {
  onBack: () => void;
  swipedCount: number;
  likedCount: number;
  currentIndex?: number;
  totalCount?: number;
  opponentSwipes?: number;
}

export default function ArenaHeader({ onBack, swipedCount, likedCount, currentIndex, totalCount, opponentSwipes }: ArenaHeaderProps) {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

  const progress = totalCount && totalCount > 0 && currentIndex !== undefined ? (currentIndex / totalCount) * 100 : 0;
  const opponentProgress = totalCount && totalCount > 0 && opponentSwipes !== undefined ? (opponentSwipes / totalCount) * 100 : 0;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={colors.textSubtle} />
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
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>You</Text>
            <View style={styles.progressBarBg}>
               <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressValue}>{currentIndex}/{totalCount}</Text>
          </View>
          
          {opponentSwipes !== undefined && (
            <View style={[styles.progressRow, { marginTop: 6 }]}>
              <Text style={styles.progressLabelFriend}>Friend</Text>
              <View style={styles.progressBarBg}>
                 <View style={[styles.progressBarFriendFill, { width: `${opponentProgress}%` }]} />
              </View>
              <Text style={styles.progressValue}>{opponentSwipes}/{totalCount}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
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
  title: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: colors.primary, fontWeight: '500' },
  subtitle: { color: colors.textSubtle, fontSize: 11, marginTop: 2 },
  progressWrapper: {
    paddingHorizontal: 24,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    width: 38,
  },
  progressLabelFriend: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: '600',
    width: 38,
  },
  progressValue: {
    color: colors.textSubtle,
    fontSize: 9,
    fontWeight: '500',
    width: 28,
    textAlign: 'right',
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressBarFriendFill: {
    height: '100%',
    backgroundColor: colors.primaryHover, // or colors.primary depending on design
    borderRadius: 2,
  },
});