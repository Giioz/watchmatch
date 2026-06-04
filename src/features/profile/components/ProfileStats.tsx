import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileStatsProps {
  matches: number;
  rooms: number;
  streakDays: number;
  loading?: boolean;
}

export default function ProfileStats({ matches, rooms, streakDays, loading }: ProfileStatsProps) {
  const stats = [
    { label: 'Matches', value: matches },
    { label: 'Rooms', value: rooms },
    { label: 'Streak', value: streakDays },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.stat}>
          <Text style={styles.value}>{loading ? '··' : stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 18,
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    minHeight: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#111115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: '#f4f4f5',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 5,
  },
  label: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
