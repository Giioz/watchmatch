import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileBadgesProps {
  matches: number;
  streakDays: number;
  rooms: number;
}

interface Badge {
  emoji: string;
  title: string;
  unlocked: boolean;
}

export default function ProfileBadges({ matches, streakDays, rooms }: ProfileBadgesProps) {
  const badges: Badge[] = [
    { emoji: '🎬', title: 'First Match', unlocked: matches >= 1 },
    { emoji: '🔥', title: '7-Day Streak', unlocked: streakDays >= 7 },
    { emoji: '🍿', title: '5 Matches', unlocked: matches >= 5 },
    { emoji: '🚪', title: '10 Rooms', unlocked: rooms >= 10 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.row}>
        {badges.map((badge) => (
          <View
            key={badge.title}
            style={[styles.badge, badge.unlocked ? styles.unlocked : styles.locked]}
          >
            <Text style={[styles.emoji, !badge.unlocked && styles.emojiLocked]}>{badge.emoji}</Text>
            <Text style={[styles.title, badge.unlocked ? styles.titleUnlocked : styles.titleLocked]}>
              {badge.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, marginBottom: 22 },
  sectionTitle: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 10 },
  badge: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  unlocked: { backgroundColor: 'rgba(124,92,240,0.1)', borderColor: 'rgba(124,92,240,0.35)' },
  locked: { backgroundColor: '#0f0f14', borderColor: '#1f1f29' },
  emoji: { fontSize: 24 },
  emojiLocked: { opacity: 0.3 },
  title: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textAlign: 'center' },
  titleUnlocked: { color: '#c4b5fd' },
  titleLocked: { color: '#52525b' },
});
