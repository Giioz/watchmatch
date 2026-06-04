import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import HomeActionButtons from '@/features/home/components/HomeActionButtons';
import { TAB_BAR_HEIGHT } from '@/components/BottomTabBar';
import { useActiveRooms, ActiveRoom } from '../hooks/useActiveRooms';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function StatusPill({ status }: { status: ActiveRoom['status'] }) {
  const isSwiping = status === 'swiping';
  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: isSwiping ? 'rgba(34,197,94,0.14)' : 'rgba(123,92,240,0.16)',
          borderColor: isSwiping ? 'rgba(34,197,94,0.4)' : 'rgba(123,92,240,0.4)',
        },
      ]}
    >
      <View
        style={[styles.statusDot, { backgroundColor: isSwiping ? '#22c55e' : '#a78bfa' }]}
      />
      <Text style={[styles.statusText, { color: isSwiping ? '#86efac' : '#c4b5fd' }]}>
        {isSwiping ? 'Swiping' : 'Waiting'}
      </Text>
    </View>
  );
}

export default function RoomsScreenContent() {
  const router = useRouter();
  const { user, loading: loadingAuth } = useAuthSession();
  const { rooms, loading, error } = useActiveRooms();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.orbTop} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 48 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Rooms</Text>
          <Text style={styles.title}>Let&apos;s Pick Tonight</Text>
        </View>

        {/* Primary actions (reuses the working create / join logic) */}
        <HomeActionButtons
          onCreateRoom={() => router.push('/create-room')}
          onJoinRoom={(code) => router.push(`/room/${code}`)}
          onSignIn={() => router.push('/auth')}
          showAuthPrompt={!loadingAuth && !user}
        />

        {/* Active sessions */}
        {user && (
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionLabel}>Active Sessions</Text>

            {loading ? (
              <View style={styles.sessionsLoading}>
                <ActivityIndicator size="small" color="#7c3aed" />
              </View>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : rooms.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No live rooms. Create one above to get started.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {rooms.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/room/${room.code}`)}
                    style={styles.sessionCard}
                  >
                    <View style={styles.sessionLeft}>
                      <Text style={styles.sessionCode}>{room.code}</Text>
                      <View style={styles.sessionMetaRow}>
                        <Ionicons name="people-outline" size={13} color="#71717a" />
                        <Text style={styles.sessionMeta}>
                          {room.participantCount} {room.participantCount === 1 ? 'player' : 'players'}
                        </Text>
                        <Text style={styles.sessionDot}>·</Text>
                        <Text style={styles.sessionMeta}>{timeAgo(room.created_at)}</Text>
                      </View>
                    </View>
                    <View style={styles.sessionRight}>
                      <StatusPill status={room.status} />
                      <Ionicons name="chevron-forward" size={18} color="#52525b" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  orbTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#7c3aed',
    opacity: 0.13,
    top: -100,
    right: -90,
  },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 4 },
  eyebrow: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: { color: '#f1f0f8', fontSize: 34, fontWeight: '700', letterSpacing: -0.6 },
  sessionsSection: { marginTop: 28, paddingHorizontal: 24 },
  sectionLabel: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  sessionsLoading: { paddingVertical: 20, alignItems: 'center' },
  errorText: { color: '#fca5a5', fontSize: 13, lineHeight: 19 },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f29',
    backgroundColor: '#111115',
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  emptyText: { color: '#71717a', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#111115',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  sessionLeft: { flex: 1, minWidth: 0 },
  sessionCode: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    fontFamily: 'SpaceMono',
  },
  sessionMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  sessionMeta: { color: '#71717a', fontSize: 12 },
  sessionDot: { color: '#3f3f46', fontSize: 12 },
  sessionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
});
