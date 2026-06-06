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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { roomService } from '@/services/roomService';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

import { useHomeAnimations } from '../hooks/useHomeAnimations';
import HomeActionButtons from './HomeActionButtons';
import HomeProfileButton from './HomeProfileButton';
import TodaysPicks from './TodaysPicks';
import RecentMatchesScroll from './RecentMatchesScroll';
import HomeMovieBottomSheet from './HomeMovieBottomSheet';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { RoomMovie } from '@/types/database';
import { TMDBMediaItem } from '@/types/movie';

export default function HomeScreenContent() {
  const router = useRouter();
  const { user, loading: loadingAuth } = useAuthSession();
  const { recentMatches, statsLoading } = useHomeDashboard();

  const [selectedMovie, setSelectedMovie] = useState<TMDBMediaItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { colors, isDark, toggleTheme } = useAppTheme();
  const styles = useAppStyles(createStyles);

  const { headerAnim, cardsAnim, actionsAnim, orb1Style, orb2Style } = useHomeAnimations();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
              
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.themeToggle}
                  onPress={toggleTheme}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isDark ? 'sunny' : 'moon'}
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
                {user && (
                  <HomeProfileButton
                    user={user}
                    onPress={() => router.push('/profile')}
                  />
                )}
              </View>
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

            {/* Recent Matches section */}
            {user && recentMatches.length > 0 && (
              <Animated.View style={{ opacity: cardsAnim, marginTop: 28 }}>
                <Text style={styles.sectionTitle}>Recent Matches</Text>
                <RecentMatchesScroll
                  recentMatches={recentMatches}
                  loading={statsLoading}
                  onPressMovie={(movie) => {
                    setSelectedMovie({
                      id: movie.tmdb_id,
                      title: movie.title,
                      poster_path: movie.poster_path,
                      backdrop_path: movie.backdrop_path,
                      overview: movie.overview ?? '',
                      vote_average: movie.vote_average ?? 0,
                      release_date: movie.release_date ?? '',
                      popularity: 0,
                      genre_ids: movie.genre_ids ?? [],
                    });
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

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  orb1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: colors.primary, opacity: 0.15, top: -60, left: -40 },
  orb2: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#4f46e5', opacity: 0.1, bottom: 20, right: -60 },
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStack: {
    marginBottom: 10,
  },
  watchText: {
    fontSize: 40,
    fontWeight: '300',
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  matchText: {
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    color: colors.primary,
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
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 4,
  },
  welcomePrompt: {
    fontSize: 22,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    fontWeight: '400',
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    paddingHorizontal: 24,
  },

});
