import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

const features: Array<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  status: string;
}> = [
  {
    icon: 'time-outline',
    title: 'Watch history',
    description: 'A private log of rooms, matches, and movies you both agreed on.',
    status: 'Planned',
  },
  {
    icon: 'heart-outline',
    title: 'Saved matches',
    description: 'Keep matched movies around so the decision does not disappear.',
    status: 'Next',
  },
  {
    icon: 'people-outline',
    title: 'Friends',
    description: 'Invite frequent partners faster without sharing a room code every time.',
    status: 'Future',
  },
  {
    icon: 'options-outline',
    title: 'Taste profile',
    description: 'Remember preferred genres, content type, and session limits.',
    status: 'Future',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Account safety',
    description: 'Email, sign-in methods, and privacy settings will live here.',
    status: 'Future',
  },
];

export default function ProfileFeatureList() {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Coming Features</Text>

      {features.map((feature) => (
        <View key={feature.title} style={styles.item}>
          <View style={styles.iconWrap}>
            <Ionicons name={feature.icon} size={20} color={colors.primary} />
          </View>

          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{feature.title}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{feature.status}</Text>
              </View>
            </View>
            <Text style={styles.description}>{feature.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 10,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  item: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    backgroundColor: colors.surfaceElevated,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  description: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
});
