import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { roomService } from '@/services/roomService';

import { useHomeAnimations } from '../hooks/useHomeAnimations';
import HomeActionButtons from './HomeActionButtons';
import HomeProfileButton from './HomeProfileButton';
import TodaysPicks from './TodaysPicks';
import HomeMovieBottomSheet from './HomeMovieBottomSheet';
import { TMDBMediaItem } from '@/types/movie';

export default function HomeScreenContent() {
  const router = useRouter();
  const { user, loading: loadingAuth } = useAuthSession();

  const [selectedMovie, setSelectedMovie] = useState<TMDBMediaItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { headerAnim, cardsAnim, actionsAnim, orb1Style, orb2Style } = useHomeAnimations();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      {/* Ambient Orbs */}
      <Animated.View style={[styles.orb1, orb1Style]} pointerEvents="none" />
      <Animated.View style={[styles.orb2, orb2Style]} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
            {/* Header row: Title + Profile */}
            <Animated.View style={[styles.headerRow, { opacity: headerAnim }]}>
              <View style={styles.titleColumn}>
                {/* Asymmetric Staggered Logo Stack */}
                <View style={styles.logoStack}>
                  <Text style={styles.watchText}>WATCH</Text>
                  <Text style={styles.matchText}>MATCH</Text>
                </View>
              </View>
              
              {user && (
                <HomeProfileButton
                  user={user}
                  onPress={() => router.push('/profile')}
                />
              )}
            </Animated.View>

            {/* Welcoming Header Section */}
            <Animated.View style={[styles.welcomeSection, { opacity: headerAnim }]}>
              <Text style={styles.welcomePrompt}>
                What are we watching tonight?
              </Text>
              <Text style={styles.welcomeSubtext}>
                No debates. Swipe genres, invite a partner, and agree on a movie in seconds.
              </Text>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View style={[{ marginTop: 16 }, { opacity: actionsAnim }]}>
              <HomeActionButtons
                onCreateRoom={() => router.push('/create-room')}
                onSignIn={() => router.push('/auth')}
                onJoinRoom={(code) => router.push(`/room/${code}`)}
                showAuthPrompt={!loadingAuth && !user}
              />
            </Animated.View>

            {/* Today's Picks personalized section */}
            {user && (
              <Animated.View style={{ opacity: cardsAnim }}>
                <TodaysPicks
                  userId={user.id}
                  onPressMovie={(movie) => {
                    setSelectedMovie(movie);
                    setIsModalVisible(true);
                  }}
                />
              </Animated.View>
            )}
          </ScrollView>
      </KeyboardAvoidingView>


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
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
  },
  logoStack: {
    marginBottom: 10,
  },
  watchText: {
    fontSize: 40,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  matchText: {
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#a78bfa',
    letterSpacing: -1,
    lineHeight: 42,
    marginLeft: 28,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusChipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  statusChipInactive: {
    backgroundColor: 'rgba(113, 113, 122, 0.08)',
    borderColor: 'rgba(113, 113, 122, 0.25)',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipDotActive: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  chipDotInactive: {
    backgroundColor: '#71717a',
  },
  chipText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#a1a1aa',
    letterSpacing: 0.8,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 4,
  },
  welcomePrompt: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    fontWeight: '400',
  },
  sectionTitle: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    paddingHorizontal: 24,
  },

});
