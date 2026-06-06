import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TMDBMediaItem } from '@/types/movie';
import { personalLibraryService } from '@/services/personalLibraryService';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface TodaysPicksProps {
  userId: string;
  onPressMovie: (movie: TMDBMediaItem) => void;
}

function PickCard({
  movie,
  onPress,
  userId,
}: {
  movie: TMDBMediaItem;
  onPress: () => void;
  userId: string;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  const likeScale = useRef(new Animated.Value(1)).current;
  const watchScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    async function checkStatus() {
      const liked = await personalLibraryService.isLiked(movie.id);
      const watchlisted = await personalLibraryService.isInWatchlist(movie.id);
      if (active) {
        setIsLiked(liked);
        setIsWatchlisted(watchlisted);
      }
    }
    checkStatus();
    return () => { active = false; };
  }, [movie.id]);

  const triggerSpring = (animatedValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animatedValue, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(animatedValue, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleLike = async (e: any) => {
    e.stopPropagation();
    triggerSpring(likeScale);
    if (isLiked) {
      await personalLibraryService.removeLike(movie.id);
      setIsLiked(false);
    } else {
      await personalLibraryService.addLike(movie);
      setIsLiked(true);
    }
  };

  const handleWatchlist = async (e: any) => {
    e.stopPropagation();
    triggerSpring(watchScale);
    if (isWatchlisted) {
      await personalLibraryService.removeFromWatchlist(movie.id);
      setIsWatchlisted(false);
    } else {
      await personalLibraryService.addToWatchlist(movie);
      setIsWatchlisted(true);
    }
  };

  const posterUri = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Poster */}
      {posterUri ? (
        <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={styles.posterFallback}>
          <Ionicons name="film-outline" size={24} color={colors.textMuted} />
        </View>
      )}

      {/* Floating Action Buttons */}
      <View style={styles.floatingActions}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleWatchlist}
          style={[styles.floatingBtn, isWatchlisted && styles.activeWatchBtn]}
        >
          <Animated.View style={{ transform: [{ scale: watchScale }] }}>
            <Ionicons
              name={isWatchlisted ? 'bookmark' : 'bookmark-outline'}
              size={15}
              color={isWatchlisted ? colors.text : colors.primary}
            />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLike}
          style={[styles.floatingBtn, isLiked && styles.activeLikeBtn]}
        >
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={15}
              color={isLiked ? colors.pureWhite : colors.success}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Movie info overlay */}
      <View style={styles.infoOverlay}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title ?? movie.name ?? 'Untitled'}
        </Text>
        {movie.vote_average ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color="#facc15" />
            <Text style={styles.ratingText}>
              {movie.vote_average.toFixed(1)}
              {movie.release_date || movie.first_air_date ? ` • ${(movie.release_date ?? movie.first_air_date ?? '').slice(0, 4)}` : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}



export default function TodaysPicks({ userId, onPressMovie }: TodaysPicksProps) {
  const [picks, setPicks] = useState<TMDBMediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  useEffect(() => {
    let active = true;
    async function loadPicks() {
      try {
        const data = await personalLibraryService.getTodaysPicks(userId);
        if (active) {
          setPicks(data);
        }
      } catch (err) {
        console.error('Failed to load picks on mount', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPicks();
    return () => { active = false; };
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Curating your daily picks...</Text>
      </View>
    );
  }

  if (picks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DAILY CURATED MIX</Text>
        <Text style={styles.sectionTitle}>Today's Picks</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {picks.map((movie) => (
          <PickCard
            key={movie.id}
            movie={movie}
            userId={userId}
            onPress={() => onPressMovie(movie)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    marginTop: 28,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  card: {
    width: 140,
    height: 220,
    borderRadius: 18,
    marginRight: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    gap: 6,
  },
  floatingBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  activeLikeBtn: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  activeWatchBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primarySoft,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isDark ? 'rgba(10, 10, 15, 0.85)' : 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  ratingText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '700',
  },
});
