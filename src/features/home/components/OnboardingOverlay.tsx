import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GENRES } from '@/features/room/constants/createRoom';
import { movieService } from '@/services/tmdbApi';
import { TMDBMediaItem } from '@/types/movie';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

interface OnboardingOverlayProps {
  onComplete: (genreIds: number[]) => void;
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  // Step 2 sample films to rate.
  const [films, setFilms] = useState<TMDBMediaItem[]>([]);
  const [filmIndex, setFilmIndex] = useState(0);
  const [loadingFilms, setLoadingFilms] = useState(true);

  useEffect(() => {
    let active = true;
    const page = Math.floor(Math.random() * 10) + 1;
    movieService
      .discoverMedia('movie', [], page, { minVoteAverage: 7 })
      .then((res) => {
        if (!active) return;
        setFilms((res?.results ?? []).filter((m) => m.poster_path).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => active && setLoadingFilms(false));
    return () => {
      active = false;
    };
  }, []);

  const toggleGenre = (id: number) =>
    setSelectedGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const rateFilm = (liked: boolean) => {
    const film = films[filmIndex];
    if (liked && film?.genre_ids) {
      setSelectedGenres((prev) => Array.from(new Set([...prev, ...film.genre_ids!])));
    }
    if (filmIndex < films.length - 1) {
      setFilmIndex((i) => i + 1);
    } else {
      setStep(3);
    }
  };

  const finish = () => onComplete(selectedGenres);

  const currentFilm = films[filmIndex];

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.header}>
        <View style={styles.dots}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.dot, s <= step ? styles.dotActive : styles.dotIdle]} />
          ))}
        </View>
        <TouchableOpacity onPress={finish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {step === 1 && (
        <View style={styles.body}>
          <Text style={styles.eyebrow}>Welcome</Text>
          <Text style={styles.title}>What do you love to watch?</Text>
          <Text style={styles.subtitle}>Pick at least 3 — we&apos;ll seed your Taste DNA.</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
            <View style={styles.genreGrid}>
              {GENRES.map((genre) => {
                const selected = selectedGenres.includes(genre.id);
                return (
                  <TouchableOpacity
                    key={genre.id}
                    activeOpacity={0.8}
                    onPress={() => toggleGenre(genre.id)}
                    style={[styles.genreBadge, selected ? styles.genreSelected : styles.genreIdle]}
                  >
                    <Text style={[styles.genreText, selected && styles.genreTextSelected]}>
                      {genre.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          <TouchableOpacity
            disabled={selectedGenres.length < 3}
            onPress={() => setStep(2)}
            activeOpacity={0.85}
            style={[styles.primaryBtn, selectedGenres.length < 3 && styles.primaryDisabled]}
          >
            <Text style={styles.primaryText}>Continue ({selectedGenres.length}/3)</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.body}>
          <Text style={styles.eyebrow}>Quick taste check</Text>
          <Text style={styles.title}>Rate a few</Text>
          {loadingFilms ? (
            <View style={styles.center}>
              <ActivityIndicator color="#7c3aed" />
            </View>
          ) : currentFilm ? (
            <View style={styles.center}>
              <Image
                source={{ uri: `${POSTER_BASE}${currentFilm.poster_path}` }}
                style={styles.ratePoster}
                resizeMode="cover"
              />
              <Text style={styles.rateTitle} numberOfLines={1}>
                {currentFilm.title ?? currentFilm.name}
              </Text>
              <Text style={styles.rateCount}>
                {filmIndex + 1} of {films.length}
              </Text>
              <View style={styles.rateRow}>
                <TouchableOpacity onPress={() => rateFilm(false)} style={[styles.rateBtn, styles.passBtn]}>
                  <Ionicons name="close" size={26} color="#f87171" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => rateFilm(true)} style={[styles.rateBtn, styles.likeBtn]}>
                  <Ionicons name="heart" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.subtitle}>Couldn&apos;t load samples — that&apos;s okay.</Text>
              <TouchableOpacity onPress={() => setStep(3)} activeOpacity={0.85} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {step === 3 && (
        <View style={[styles.body, styles.center]}>
          <Text style={styles.bigEmoji}>🧬</Text>
          <Text style={styles.title}>Your Taste DNA is ready</Text>
          <Text style={styles.subtitle}>
            We&apos;ll fine-tune it after every match you make.
          </Text>
          <TouchableOpacity onPress={finish} activeOpacity={0.85} style={[styles.primaryBtn, { marginTop: 28 }]}>
            <Text style={styles.primaryText}>Start watching together</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0a0a0f', zIndex: 100 },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(124,58,237,0.16)',
    top: -60,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 24, height: 4, borderRadius: 2 },
  dotActive: { backgroundColor: '#7c3aed' },
  dotIdle: { backgroundColor: '#27272a' },
  skip: { color: '#71717a', fontSize: 14, fontWeight: '600' },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  eyebrow: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: { color: '#f1f0f8', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { color: '#71717a', fontSize: 14, marginTop: 8, textAlign: 'center' },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  genreBadge: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1 },
  genreSelected: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  genreIdle: { backgroundColor: '#15151c', borderColor: '#27272a' },
  genreText: { color: '#d4d4d8', fontSize: 14, fontWeight: '600' },
  genreTextSelected: { color: '#fff' },
  primaryBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ratePoster: { width: 200, height: 300, borderRadius: 18, marginBottom: 16 },
  rateTitle: { color: '#f4f4f5', fontSize: 18, fontWeight: '700', maxWidth: 260 },
  rateCount: { color: '#71717a', fontSize: 12, marginTop: 6 },
  rateRow: { flexDirection: 'row', gap: 24, marginTop: 26 },
  rateBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  passBtn: { backgroundColor: '#15151c', borderColor: '#3f3f46' },
  likeBtn: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  bigEmoji: { fontSize: 64, marginBottom: 12 },
});
