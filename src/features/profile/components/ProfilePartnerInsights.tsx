import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Partner {
  name: string;
  matchCount: number;
  sessions: number;
  overlap: number;
}

interface ProfilePartnerInsightsProps {
  partner: Partner | null;
}

export default function ProfilePartnerInsights({ partner }: ProfilePartnerInsightsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Partner Insights</Text>
      {partner ? (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{partner.name.trim().charAt(0).toUpperCase() || 'P'}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.label}>Most frequent partner</Text>
            <Text style={styles.name} numberOfLines={1}>
              {partner.name}
            </Text>
            <Text style={styles.meta}>
              {partner.matchCount} matches · {partner.sessions} sessions
            </Text>
          </View>
          <View style={styles.overlapWrap}>
            <Text style={styles.overlapValue}>{partner.overlap}%</Text>
            <Text style={styles.overlapLabel}>overlap</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Match with someone to unlock partner insights.</Text>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#111115',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#f4f4f5', fontSize: 20, fontWeight: '800' },
  label: { color: '#71717a', fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  name: { color: '#f4f4f5', fontSize: 16, fontWeight: '700', marginTop: 2 },
  meta: { color: '#71717a', fontSize: 12, marginTop: 2 },
  overlapWrap: { alignItems: 'center' },
  overlapValue: { color: '#a78bfa', fontSize: 22, fontWeight: '800' },
  overlapLabel: { color: '#71717a', fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f29',
    backgroundColor: '#0f0f14',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyText: { color: '#71717a', fontSize: 13, textAlign: 'center' },
});
