import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Alert,
  Image,
  ScrollView,
  Share,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

export default function MatchTakeover() {
  const router = useRouter();
  const { title, poster, rating, year, overview } = useLocalSearchParams<{
    title?: string;
    poster?: string;
    rating?: string;
    year?: string;
    overview?: string;
  }>();

  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);

  const pulse = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(30)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(rise, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [fade, pulse, rise]);

  const posterUrl = useMemo(() => {
    if (!poster) return null;
    return `${IMAGE_BASE_URL}${poster}`;
  }, [poster]);

  const safeTitle = title ?? 'You both liked this one';

  const handleCopyTitle = () => {
    Alert.alert('Movie Title', safeTitle);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `We matched on: ${safeTitle}` });
    } catch {
      // no-op
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgGlowTop} pointerEvents="none" />
      <View style={styles.bgGlowBottom} pointerEvents="none" />
      <Animated.View style={[styles.celebrateHalo, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]} />

      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>
        <Text style={styles.eyebrow}>It&apos;s a Match</Text>
        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={styles.title}>{safeTitle}</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleCopyTitle}>
            <Ionicons name="copy-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterFallback}>
            <Ionicons name="film-outline" size={52} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.metaRow}>
          {rating ? (
            <View style={[styles.metaBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <Ionicons name="star" size={11} color="#facc15" />
              <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '700' }}>
                {Number(rating).toFixed(1)}
              </Text>
            </View>
          ) : null}
          {year ? <Text style={styles.metaText}>{year}</Text> : null}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Why it matched</Text>
          <Text style={styles.overviewText}>
            {overview?.trim() || 'No overview available for this title yet.'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={16} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Back Home</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bgGlowTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primary,
    top: -80,
    right: -70,
    opacity: 0.2,
  },
  bgGlowBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#4f46e5',
    bottom: -70,
    left: -70,
    opacity: 0.15,
  },
  celebrateHalo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.06)',
  },
  card: {
    width: '100%',
    maxHeight: '88%',
    borderRadius: 20,
    backgroundColor: isDark ? '#121218' : '#ffffff',
    borderColor: isDark ? '#2a2a35' : '#e5e5e5',
    borderWidth: 1,
    padding: 18,
  },
  cardContent: {
    paddingBottom: 4,
  },
  eyebrow: {
    color: colors.primary,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: isDark ? '#30303a' : '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  poster: {
    width: '100%',
    height: 330,
    borderRadius: 14,
    marginBottom: 12,
  },
  posterFallback: {
    width: '100%',
    height: 330,
    borderRadius: 14,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  metaBadge: {
    color: '#111827',
    backgroundColor: '#facc15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: isDark ? '#2a2a35' : '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  sectionLabel: {
    color: colors.primary,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
    fontWeight: '700',
  },
  overviewText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textMuted,
    backgroundColor: colors.surface,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
