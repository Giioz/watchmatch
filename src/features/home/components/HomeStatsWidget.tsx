import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HomeStatsWidgetProps {
  matchCount: number;
}

export default function HomeStatsWidget({ matchCount }: HomeStatsWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Matches Found</Text>
      <Text style={styles.count}>{matchCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2a',
    marginHorizontal: 32,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  count: {
    color: '#f4f4f5',
    fontSize: 24,
    fontWeight: '700',
  },
});
