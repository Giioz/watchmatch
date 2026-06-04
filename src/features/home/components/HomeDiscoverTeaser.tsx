import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { movieService } from '@/services/tmdbApi';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

interface HomeDiscoverTeaserProps {
  onPress: () => void;
}

/**
 * Editorial "your next match might be…" hook. Posters are intentionally
 * obscured with a blur — a teaser that nudges the user toward the Rooms tab.
 */
export default function HomeDiscoverTeaser({ onPress }: HomeDiscoverTeaserProps) {
  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const page = Math.floor(Math.random() * 20) + 1;
    movieService
      .discoverMedia('movie', [], page, { minVoteAverage: 7 })
      .then((res) => {
        if (!active || !res?.results) return;
        const picked = res.results
          .map((m) => m.poster_path)
          .filter((p): p is string => Boolean(p))
          .slice(0, 3);
        setPosters(picked);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
      <Text style={styles.eyebrow}>Discover</Text>
      <View style={styles.card}>
        <View style={styles.posterRow}>
          {(posters.length ? posters : [null, null, null]).map((poster, i) => (
            <View key={i} style={styles.posterWrap}>
              {poster ? (
                <Image source={{ uri: `${POSTER_BASE}${poster}` }} style={styles.poster} resizeMode="cover" />
              ) : (
                <View style={[styles.poster, styles.posterPlaceholder]} />
              )}
              <BlurView intensity={38} tint="dark" style={StyleSheet.absoluteFill} />
            </View>
          ))}
        </View>
        <View style={styles.overlayText}>
          <Text style={styles.teaserTitle}>Your next perfect match might be…</Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Open a room to reveal</Text>
            <Ionicons name="arrow-forward" size={14} color="#c4b5fd" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 28, paddingHorizontal: 24 },
  eyebrow: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#111115',
  },
  posterRow: { flexDirection: 'row', height: 150 },
  posterWrap: { flex: 1, position: 'relative' },
  poster: { width: '100%', height: '100%' },
  posterPlaceholder: { backgroundColor: '#18181b' },
  overlayText: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  teaserTitle: {
    color: '#f4f4f5',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  ctaText: { color: '#c4b5fd', fontSize: 12, fontWeight: '600' },
});
