import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileFeatureList from './ProfileFeatureList';
import ProfileHeader from './ProfileHeader';
import ProfileSignOutButton from './ProfileSignOutButton';
import ProfileStats from './ProfileStats';
import { useProfile } from '../hooks/useProfile';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

export default function ProfileScreenContent() {
  const { router, user, loading, loadingStats, stats, signOut } = useProfile();
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
        <ProfileHeader user={user} onBack={() => router.back()} />
        <ProfileStats
          matchCount={stats?.matchCount}
          roomCount={stats?.roomCount}
          loading={loadingStats}
        />
        <ProfileFeatureList />
        <ProfileSignOutButton onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 12,
  },
  orbTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primary,
    opacity: 0.13,
    top: -90,
    right: -90,
  },
  orbBottom: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: colors.primarySoft,
    opacity: 0.1,
    bottom: -70,
    left: -80,
  },
});
