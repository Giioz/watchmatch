import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileHeader from './ProfileHeader';
import ProfileSignOutButton from './ProfileSignOutButton';
import ProfileStats from './ProfileStats';
import ProfileTasteDNA from './ProfileTasteDNA';
import ProfileBadges from './ProfileBadges';
import ProfilePartnerInsights from './ProfilePartnerInsights';
import ProfileSettings from './ProfileSettings';
import { TAB_BAR_HEIGHT } from '@/components/BottomTabBar';
import { useProfile } from '../hooks/useProfile';

export default function ProfileScreenContent() {
  const { user, loading, stats, signOut } = useProfile();

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHeader user={user} />
        <ProfileStats
          matches={stats.matches}
          rooms={stats.rooms}
          streakDays={stats.streakDays}
          loading={stats.loading}
        />
        <ProfileTasteDNA breakdown={stats.genreBreakdown} />
        <ProfileBadges matches={stats.matches} streakDays={stats.streakDays} rooms={stats.rooms} />
        <ProfilePartnerInsights partner={stats.favoritePartner} />
        <ProfileSettings />
        <ProfileSignOutButton onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#71717a',
    marginTop: 12,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: TAB_BAR_HEIGHT + 40,
  },
  orbTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#7c3aed',
    opacity: 0.13,
    top: -90,
    right: -90,
  },
  orbBottom: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#4f46e5',
    opacity: 0.1,
    bottom: -70,
    left: -80,
  },
});
