import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Confetti from '@/components/Confetti';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

export default function MatchTakeover() {
  const router = useRouter();
  const { title, poster, rating, year, overview, partner, genres } = useLocalSearchParams<{
    title?: string;
    poster?: string;
    rating?: string;
    year?: string;
    overview?: string;
    partner?: string;
    genres?: string;
  }>();

  const rise = useRef(new Animated.Value(40)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [confettiActive, setConfettiActive] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(rise, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => setConfettiActive(false), 3200);
    return () => clearTimeout(t);
  }, [fade, rise]);

  const posterUrl = useMemo(() => (poster ? `${IMAGE_BASE_URL}${poster}` : null), [poster]);
  const safeTitle = title ?? 'You both liked this one';
  const genreTags = (genres ?? '').split(',').map((g) => g.trim()).filter(Boolean);
  const partnerName = partner?.trim() || 'your partner';

  const handleShare = async () => {
    try {
      await Share.share({ message: `🎬 WatchMatch — we matched on "${safeTitle}"! Movie night sorted.` });
    } catch {
      // dismissed
    }
  };

  const handleWatchlist = async () => {
    try {
      await WebBrowser.openBrowserAsync(
        `https://letterboxd.com/search/${encodeURIComponent(safeTitle)}/`,
      );
    } catch {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgGlowTop} pointerEvents="none" />
      <View style={styles.bgGlowBottom} pointerEvents="none" />
      <Confetti active={confettiActive} />

      <Animated.View style={[styles.scene, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sceneContent}>
          <Text style={styles.eyebrow}>It&apos;s a Match</Text>
          <Text numberOfLines={2} style={styles.title}>
            {safeTitle}
          </Text>

          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={styles.posterFallback}>
              <Text style={{ fontSize: 56 }}>🎬</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            {rating ? <Text style={styles.metaBadge}>⭐ {Number(rating).toFixed(1)}</Text> : null}
            {year ? <Text style={styles.metaText}>{year}</Text> : null}
            {genreTags.map((tag) => (
              <View key={tag} style={styles.genreChip}>
                <Text style={styles.genreChipText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.partnerRow}>
            <Ionicons name="heart" size={15} color="#fb7185" />
            <Text style={styles.partnerText}>You &amp; {partnerName} both loved this</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Why it matched</Text>
            <Text style={styles.overviewText}>
              {overview?.trim() || 'You both swiped right — the rare cinematic consensus. Press play.'}
            </Text>
          </View>

          <TouchableOpacity style={styles.watchlistButton} activeOpacity={0.85} onPress={handleWatchlist}>
            <Ionicons name="bookmark-outline" size={18} color="#fff" />
            <Text style={styles.watchlistText}>Add to Watchlist</Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={16} color="#c4b5fd" />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/')}>
              <Ionicons name="home-outline" size={16} color="#c4b5fd" />
              <Text style={styles.secondaryButtonText}>Back Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bgGlowTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#7c3aed',
    top: -80,
    right: -70,
    opacity: 0.22,
  },
  bgGlowBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#4f46e5',
    bottom: -70,
    left: -70,
    opacity: 0.16,
  },
  scene: { width: '100%', maxHeight: '92%' },
  sceneContent: { paddingBottom: 8, alignItems: 'stretch' },
  eyebrow: {
    color: '#c4b5fd',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  title: {
    color: '#f4f4f5',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  poster: {
    width: '100%',
    height: 360,
    borderRadius: 18,
    marginBottom: 14,
  },
  posterFallback: {
    width: '100%',
    height: 360,
    borderRadius: 18,
    backgroundColor: '#1b1b24',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metaBadge: {
    color: '#111827',
    backgroundColor: '#facc15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  metaText: { color: '#a1a1aa', fontSize: 14, fontWeight: '600' },
  genreChip: {
    borderWidth: 1,
    borderColor: '#2d2d3d',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  genreChipText: { color: '#d4d4d8', fontSize: 11, fontWeight: '500' },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  partnerText: { color: '#e4e4e7', fontSize: 13, fontWeight: '600' },
  section: {
    backgroundColor: '#15151c',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#a78bfa',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
    fontWeight: '700',
  },
  overviewText: { color: '#d4d4d8', fontSize: 14, lineHeight: 21 },
  watchlistButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 12,
  },
  watchlistText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#15151c',
    paddingVertical: 14,
  },
  secondaryButtonText: { color: '#c4b5fd', fontWeight: '700', fontSize: 14 },
});
