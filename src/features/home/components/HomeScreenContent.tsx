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

import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { useHomeAnimations } from '../hooks/useHomeAnimations';
import StreakWidget from './StreakWidget';
import RecentMatchesScroll from './RecentMatchesScroll';
import HomeActionButtons from './HomeActionButtons';
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
            contentContainerStyle={{ paddingBottom: 24 }}
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

            {/* Recent Matches section */}
            {user && (
              <Animated.View style={[{ marginTop: 28 }, { opacity: cardsAnim }]}>
                <Text style={styles.sectionTitle}>Recent Matches</Text>
                {devError && (
                  <View style={styles.devErrorWrap}>
                    <Text style={styles.devErrorText}>{devError}</Text>
                  </View>
                )}
                <RecentMatchesScroll recentMatches={recentMatches} loading={statsLoading} />
              </Animated.View>
            )}

            {/* Action Buttons */}
            <Animated.View style={[{ marginTop: 28 }, { opacity: actionsAnim }]}>
              <HomeActionButtons
                onCreateRoom={() => router.push('/create-room')}
                onSignIn={() => router.push('/auth')}
                onJoinRoom={(code) => router.push(`/room/${code}`)}
                showAuthPrompt={!loadingAuth && !user}
              />
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
  sectionTitle: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    paddingHorizontal: 24,
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
