import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { TAB_BAR_HEIGHT } from '@/components/BottomTabBar';
import { GENRES } from '@/features/room/constants/createRoom';
import { useMatches, MatchWithMovie } from '../hooks/useMatches';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

function genreName(id: number | null): string {
  if (id === null) return '—';
  return GENRES.find((g) => g.id === id)?.name ?? 'Mixed';
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MatchCard({ match, onPress }: { match: MatchWithMovie; onPress: () => void }) {
  const posterUri = match.movie?.poster_path ? `${POSTER_BASE}${match.movie.poster_path}` : null;
  const year = (match.movie?.release_date ?? '').slice(0, 4);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.matchCard}>
      <View style={styles.posterWrap}>
        {posterUri ? (
          <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterFallback}>
            <Text style={{ fontSize: 40 }}>🎬</Text>
          </View>
        )}
      </View>
      <Text style={styles.matchTitle} numberOfLines={1}>
        {match.movie?.title ?? 'Untitled'}
      </Text>
      {year ? <Text style={styles.matchYear}>{year}</Text> : null}
    </TouchableOpacity>
  );
}

type SortKey = 'newest' | 'rating';

export default function MatchesScreenContent() {
  const router = useRouter();
  const { matches, matchCount, topGenreId, streakDays, favoritePartner, loading, error, user } =
    useMatches();

  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [sort, setSort] = useState<SortKey>('newest');

  // Genres that actually appear in this user's matches, for the filter bar.
  const availableGenres = useMemo(() => {
    const ids = new Set<number>();
    matches.forEach((m) => (m.movie?.genre_ids ?? []).forEach((id) => ids.add(id)));
    return GENRES.filter((g) => ids.has(g.id));
  }, [matches]);

  const displayedMatches = useMemo(() => {
    let list = matches;
    if (selectedGenres.length > 0) {
      list = list.filter((m) =>
        (m.movie?.genre_ids ?? []).some((id) => selectedGenres.includes(id)),
      );
    }
    const sorted = [...list];
    if (sort === 'rating') {
      sorted.sort((a, b) => (b.movie?.vote_average ?? 0) - (a.movie?.vote_average ?? 0));
    } else {
      sorted.sort(
        (a, b) => new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime(),
      );
    }
    return sorted;
  }, [matches, selectedGenres, sort]);

  const toggleGenre = (id: number) =>
    setSelectedGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const openMatch = (match: MatchWithMovie) => {
    router.push({
      pathname: '/match',
      params: {
        title: match.movie?.title ?? 'Matched',
        poster: match.movie?.poster_path ?? '',
        rating: String(match.movie?.vote_average ?? ''),
        year: (match.movie?.release_date ?? '').slice(0, 4),
        overview: match.movie?.overview ?? '',
      },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.orbTop} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 48 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your Matches</Text>
          <Text style={styles.title}>
            {matchCount} {matchCount === 1 ? 'Film' : 'Films'} Found Together
          </Text>
        </View>

        {!user ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>Sign in to see your matches</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.ctaText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color="#7c3aed" />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {/* Stats bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
            >
              <StatCard label="Total Matches" value={String(matchCount)} />
              <StatCard label="Top Genre" value={genreName(topGenreId)} />
              <StatCard
                label="Longest Streak"
                value={streakDays > 0 ? `${streakDays}d` : '—'}
              />
              <StatCard label="Favorite Partner" value={favoritePartner ?? '—'} />
            </ScrollView>

            {/* Filter bar */}
            {matches.length > 0 && (
              <View style={styles.filterBar}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterPills}
                >
                  {availableGenres.map((genre) => {
                    const active = selectedGenres.includes(genre.id);
                    return (
                      <TouchableOpacity
                        key={genre.id}
                        activeOpacity={0.8}
                        onPress={() => toggleGenre(genre.id)}
                        style={[styles.filterPill, active ? styles.filterPillActive : styles.filterPillIdle]}
                      >
                        <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                          {genre.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSort((s) => (s === 'newest' ? 'rating' : 'newest'))}
                  style={styles.sortToggle}
                >
                  <Ionicons
                    name={sort === 'rating' ? 'star' : 'time-outline'}
                    size={13}
                    color="#c4b5fd"
                  />
                  <Text style={styles.sortText}>{sort === 'rating' ? 'Rating' : 'Newest'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Grid or empty */}
            {matches.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍿</Text>
                <Text style={styles.emptyTitle}>Your perfect film is out there.</Text>
                <Text style={styles.emptySub}>Go find it.</Text>
                <TouchableOpacity
                  style={styles.ctaButton}
                  activeOpacity={0.85}
                  onPress={() => router.push('/rooms')}
                >
                  <Text style={styles.ctaText}>Start a Room</Text>
                </TouchableOpacity>
              </View>
            ) : displayedMatches.length === 0 ? (
              <Text style={styles.noFilterText}>No matches in that genre yet.</Text>
            ) : (
              <View style={styles.grid}>
                {displayedMatches.map((match) => (
                  <MatchCard key={match.id} match={match} onPress={() => openMatch(match)} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  orbTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#7c3aed',
    opacity: 0.12,
    top: -110,
    left: -90,
  },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 4 },
  eyebrow: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: { color: '#f1f0f8', fontSize: 30, fontWeight: '700', letterSpacing: -0.6, lineHeight: 36 },
  statsRow: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 4, gap: 10 },
  statCard: {
    minWidth: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#111115',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statValue: { color: '#f4f4f5', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  statLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    paddingTop: 22,
    gap: 8,
  },
  filterPills: { gap: 8, paddingRight: 8 },
  filterPill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterPillActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  filterPillIdle: { backgroundColor: '#15151c', borderColor: '#27272a' },
  filterPillText: { color: '#9ca3af', fontSize: 12, fontWeight: '600' },
  filterPillTextActive: { color: '#fff' },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 24,
  },
  sortText: { color: '#c4b5fd', fontSize: 12, fontWeight: '600' },
  noFilterText: { color: '#71717a', fontSize: 13, textAlign: 'center', paddingTop: 30 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    rowGap: 22,
  },
  matchCard: { width: '47%' },
  posterWrap: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  poster: { width: '100%', height: '100%' },
  posterFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  matchTitle: { color: '#f4f4f5', fontSize: 14, fontWeight: '600', marginTop: 8 },
  matchYear: { color: '#71717a', fontSize: 12, marginTop: 2 },
  loadingBlock: { paddingTop: 80, alignItems: 'center' },
  errorText: { color: '#fca5a5', fontSize: 13, paddingHorizontal: 24, paddingTop: 24 },
  emptyState: { alignItems: 'center', paddingTop: 70, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#f4f4f5', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySub: { color: '#71717a', fontSize: 14, marginTop: 4 },
  ctaButton: {
    marginTop: 22,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 14,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
