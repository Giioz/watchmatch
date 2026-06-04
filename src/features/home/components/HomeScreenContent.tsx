import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { roomService } from '@/services/roomService';

import { Ionicons } from '@expo/vector-icons';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { useHomeAnimations } from '../hooks/useHomeAnimations';
import { useActiveRooms } from '@/features/room/hooks/useActiveRooms';
import { TAB_BAR_HEIGHT } from '@/components/BottomTabBar';
import StreakWidget from './StreakWidget';
import RecentMatchesScroll from './RecentMatchesScroll';
import HomeMovieBottomSheet from './HomeMovieBottomSheet';
import HomeProfileButton from './HomeProfileButton';
import { TMDBMediaItem } from '@/types/movie';

function formatDevError(error: unknown) {
  if (error instanceof Error) return error.message;

  if (error && typeof error === 'object') {
    const maybeDbError = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };

    const parts = [
      maybeDbError.message,
      maybeDbError.code ? `code: ${maybeDbError.code}` : null,
      maybeDbError.details,
      maybeDbError.hint ? `hint: ${maybeDbError.hint}` : null,
    ].filter(Boolean);

    if (parts.length) {
      return parts.join(' | ');
    }
  }

  return 'Failed to create dev room.';
}

export default function HomeScreenContent() {
  const router = useRouter();
  const { matchCount, recentMatches, streakDays, topGenreId, statsLoading } = useHomeDashboard();
  const { user, loading: loadingAuth } = useAuthSession();
  const { rooms: activeRooms } = useActiveRooms();
  const activeRoom = activeRooms[0] ?? null;

  const [selectedMovie, setSelectedMovie] = useState<TMDBMediaItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreatingDevRoom, setIsCreatingDevRoom] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);

  const { headerAnim, cardsAnim, actionsAnim, orb1Style, orb2Style } = useHomeAnimations();

  const handleDevRoomSimulation = async () => {
    if (!user || isCreatingDevRoom) return;

    setIsCreatingDevRoom(true);
    setDevError(null);

    try {
      const { room } = await roomService.createRoomFromFilters({
        hostId: user.id,
        contentType: 'movie',
        genreIds: [28, 35],
        sessionLimit: 10,
      });

      router.push(`/room/${room.code}`);
    } catch (error) {
      setDevError(formatDevError(error));
    } finally {
      setIsCreatingDevRoom(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      {/* Ambient Orbs */}
      <Animated.View style={[styles.orb1, orb1Style]} pointerEvents="none" />
      <Animated.View style={[styles.orb2, orb2Style]} pointerEvents="none" />

      {/* Dev Buttons */}
      {__DEV__ && (
        <TouchableOpacity onPress={() => router.push('/arena')} style={styles.devBadge}>
          <Text style={{ color: '#71717a', fontSize: 11, letterSpacing: 1 }}>DEV: Arena</Text>
        </TouchableOpacity>
      )}
      {__DEV__ && user && (
        <TouchableOpacity
          onPress={handleDevRoomSimulation}
          disabled={isCreatingDevRoom}
          activeOpacity={0.8}
          style={styles.devRoomBadge}
        >
          {isCreatingDevRoom ? (
            <ActivityIndicator size="small" color="#f4f4f5" />
          ) : (
            <Text style={styles.devRoomBadgeText}>DEV: Simulate Room</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 32 }}
          >
            {/* Header row: Title + Profile */}
            <Animated.View style={[styles.headerRow, { opacity: headerAnim }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.topTagline}>Your next watch, decided</Text>
                <Text style={styles.mainTitle}>
                  Watch<Text style={{ color: '#a78bfa', fontWeight: '600' }}>Match</Text>
                </Text>
                <Text style={styles.subTagline}>Swipe. Match. Watch together.</Text>
              </View>
              {user && (
                <HomeProfileButton
                  user={user}
                  onPress={() => router.push('/profile')}
                />
              )}
            </Animated.View>

            {/* Streak + Taste DNA widget */}
            {user && (
              <Animated.View style={{ opacity: cardsAnim }}>
                <StreakWidget
                  streakDays={streakDays}
                  topGenreId={topGenreId}
                  matchCount={matchCount}
                />
              </Animated.View>
            )}

            {/* Active room banner */}
            {user && activeRoom && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/room/${activeRoom.code}`)}
                style={styles.activeBanner}
              >
                <View style={styles.activeBannerDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeBannerLabel}>Active room</Text>
                  <Text style={styles.activeBannerText}>
                    You have a live room · {activeRoom.code}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#c4b5fd" />
              </TouchableOpacity>
            )}

            {/* Recent Matches section */}
            {user && (
              <Animated.View style={[{ marginTop: 28 }, { opacity: cardsAnim }]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Matches</Text>
                  <TouchableOpacity onPress={() => router.push('/matches')} activeOpacity={0.7}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                {devError && (
                  <View style={styles.devErrorWrap}>
                    <Text style={styles.devErrorText}>{devError}</Text>
                  </View>
                )}
                <RecentMatchesScroll recentMatches={recentMatches} loading={statsLoading} />
              </Animated.View>
            )}

            {/* Primary CTA → Rooms tab (the action center) */}
            <Animated.View style={[{ marginTop: 28, paddingHorizontal: 24 }, { opacity: actionsAnim }]}>
              {user ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/rooms')}
                  style={styles.pickButton}
                >
                  <Ionicons name="play-circle-outline" size={20} color="#fff" />
                  <Text style={styles.pickButtonText}>Pick tonight&apos;s film</Text>
                </TouchableOpacity>
              ) : (
                !loadingAuth && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push('/auth')}
                    style={styles.pickButton}
                  >
                    <Text style={styles.pickButtonText}>Sign in to unlock</Text>
                  </TouchableOpacity>
                )
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <HomeMovieBottomSheet
        visible={isModalVisible}
        movie={selectedMovie}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  orb1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#7c3aed', opacity: 0.15, top: -80, left: -80 },
  orb2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#4f46e5', opacity: 0.12, bottom: 60, right: -50 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 4,
  },
  topTagline: { fontSize: 11, letterSpacing: 3.5, textTransform: 'uppercase', color: '#7c3aed', fontWeight: '500', marginBottom: 8 },
  mainTitle: { fontSize: 44, fontWeight: '300', color: '#f1f0f8', lineHeight: 46, letterSpacing: -1 },
  subTagline: { marginTop: 8, fontSize: 13, color: '#52525b', fontWeight: '300', letterSpacing: 0.4 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  seeAll: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(123,92,240,0.4)',
    backgroundColor: 'rgba(123,92,240,0.12)',
  },
  activeBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a78bfa',
    shadowColor: '#a78bfa',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  activeBannerLabel: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activeBannerText: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 14,
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  devBadge: { position: 'absolute', top: 56, right: 24, backgroundColor: '#27272a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, zIndex: 20 },
  devRoomBadge: {
    position: 'absolute',
    top: 94,
    right: 24,
    minWidth: 124,
    height: 32,
    backgroundColor: '#1f1f27',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devRoomBadgeText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  devErrorWrap: {
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.35)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  devErrorText: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
