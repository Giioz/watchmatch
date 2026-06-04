import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TasteDNARadar, { RadarAxis } from './TasteDNARadar';

interface ProfileTasteDNAProps {
  breakdown: Record<number, number>;
}

const AXES: { id: number; label: string; personality: string }[] = [
  { id: 28, label: 'Action', personality: 'Action Junkie' },
  { id: 878, label: 'Sci-Fi', personality: 'Sci-Fi Explorer' },
  { id: 10749, label: 'Romance', personality: 'Hopeless Romantic' },
  { id: 27, label: 'Horror', personality: 'Horror Fiend' },
  { id: 35, label: 'Comedy', personality: 'Comfort Watcher' },
  { id: 18, label: 'Drama', personality: 'Slow-Burn Dramatist' },
];

function derivePersonality(values: number[]): string {
  const total = values.reduce((a, b) => a + b, 0);
  if (total < 3) return 'Fresh Taste';
  const maxVal = Math.max(...values);
  if (maxVal / total < 0.32) return 'Genre Omnivore';
  const topIndex = values.indexOf(maxVal);
  return AXES[topIndex].personality;
}

export default function ProfileTasteDNA({ breakdown }: ProfileTasteDNAProps) {
  const data: RadarAxis[] = AXES.map((axis) => ({ label: axis.label, value: breakdown[axis.id] ?? 0 }));
  const personality = derivePersonality(data.map((d) => d.value));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Taste DNA</Text>
      <View style={styles.card}>
        <TasteDNARadar data={data} />
        <View style={styles.personalityPill}>
          <Text style={styles.personalityText}>{personality}</Text>
        </View>
        <Text style={styles.caption}>Updates after every match</Text>
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
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#111115',
    paddingVertical: 22,
    alignItems: 'center',
  },
  personalityPill: {
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(124,92,240,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,240,0.4)',
  },
  personalityText: { color: '#c4b5fd', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  caption: { color: '#52525b', fontSize: 11, marginTop: 10 },
});
