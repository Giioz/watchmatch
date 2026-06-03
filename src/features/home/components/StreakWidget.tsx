import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

// TMDB genre ID → display label + emoji
const GENRE_MAP: Record<number, { label: string; emoji: string; color: string }> = {
  28:    { label: 'Action Junkie',    emoji: '💥', color: '#f97316' },
  12:    { label: 'Adventure Seeker', emoji: '🗺️', color: '#22c55e' },
  16:    { label: 'Anime Soul',        emoji: '✨', color: '#a78bfa' },
  35:    { label: 'Comedy King',       emoji: '😂', color: '#facc15' },
  80:    { label: 'Crime Boss',        emoji: '🕵️', color: '#94a3b8' },
  99:    { label: 'Doc Lover',         emoji: '🎙️', color: '#38bdf8' },
  18:    { label: 'Drama Soul',        emoji: '🎭', color: '#f43f5e' },
  10751: { label: 'Family Vibes',     emoji: '🏠', color: '#fb923c' },
  14:    { label: 'Fantasy Dreamer',  emoji: '🔮', color: '#818cf8' },
  36:    { label: 'History Buff',      emoji: '🏛️', color: '#a16207' },
  27:    { label: 'Horror Fiend',      emoji: '👻', color: '#7f1d1d' },
  10402: { label: 'Music Lover',      emoji: '🎵', color: '#ec4899' },
  9648:  { label: 'Mystery Addict',   emoji: '🔍', color: '#6366f1' },
  10749: { label: 'Romantic at Heart',emoji: '💕', color: '#fb7185' },
  878:   { label: 'Sci-Fi Explorer',  emoji: '🚀', color: '#06b6d4' },
  10770: { label: 'TV Buff',          emoji: '📺', color: '#84cc16' },
  53:    { label: 'Thriller Chaser',  emoji: '⚡', color: '#fbbf24' },
  10752: { label: 'War Historian',    emoji: '🎖️', color: '#78716c' },
  37:    { label: 'Western Fan',      emoji: '🤠', color: '#d97706' },
};

const FALLBACK_GENRE = { label: 'Wildcard', emoji: '🎲', color: '#a78bfa' };

interface StreakWidgetProps {
  streakDays: number;
  topGenreId: number | null;
  matchCount: number;
}

function FlameIcon({ size = 28, lit }: { size?: number; lit: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!lit) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.92, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lit]);

  return (
    <Animated.Text style={{ fontSize: size, transform: [{ scale: pulse }] }}>
      {lit ? '🔥' : '🩶'}
    </Animated.Text>
  );
}

export default function StreakWidget({ streakDays, topGenreId, matchCount }: StreakWidgetProps) {
  const genre = topGenreId !== null ? (GENRE_MAP[topGenreId] ?? FALLBACK_GENRE) : null;

  // Entry animation
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // Build flame dots row (max 7 visible)
  const dots = Array.from({ length: 7 }, (_, i) => i < streakDays);

  return (
    <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
      {/* Streak section */}
      <View style={styles.streakRow}>
        <View style={styles.streakLeft}>
          <FlameIcon size={40} lit={streakDays > 0} />
          <View style={styles.streakText}>
            <Text style={styles.streakCount}>
              {streakDays > 0 ? `${streakDays} day${streakDays !== 1 ? 's' : ''}` : 'Start your streak!'}
            </Text>
            <Text style={styles.streakLabel}>
              {streakDays > 0 ? 'Watch streak 🔥' : 'Open a room today to begin'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Matches pill */}
        <View style={styles.matchesPill}>
          <Text style={styles.matchesCount}>{matchCount}</Text>
          <Text style={styles.matchesLabel}>Matches</Text>
        </View>
      </View>

      {/* Flame dots bar */}
      <View style={styles.dotsRow}>
        {dots.map((lit, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              lit
                ? { backgroundColor: '#f97316', shadowColor: '#f97316', shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }
                : { backgroundColor: '#27272a' },
            ]}
          />
        ))}
        {streakDays > 7 && (
          <Text style={styles.dotsMore}>+{streakDays - 7}</Text>
        )}
      </View>

      {/* Taste DNA section */}
      {genre && (
        <View style={[styles.tasteBadge, { borderColor: genre.color + '55', backgroundColor: genre.color + '1a' }]}>
          <Text style={styles.tasteEmoji}>{genre.emoji}</Text>
          <View>
            <Text style={styles.tasteDnaLabel}>Your Taste DNA</Text>
            <Text style={[styles.tasteDnaValue, { color: genre.color }]}>{genre.label}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: '#131318',
    borderWidth: 1,
    borderColor: '#27272a',
    overflow: 'hidden',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#7c3aed',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  streakText: {
    flexDirection: 'column',
  },
  streakCount: {
    color: '#f4f4f5',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  streakLabel: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#27272a',
    marginHorizontal: 16,
  },
  matchesPill: {
    alignItems: 'center',
  },
  matchesCount: {
    color: '#a78bfa',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  matchesLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotsMore: {
    color: '#52525b',
    fontSize: 11,
    marginLeft: 4,
  },
  tasteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tasteEmoji: {
    fontSize: 22,
  },
  tasteDnaLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tasteDnaValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
});
