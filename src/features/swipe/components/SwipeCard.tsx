import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { TMDBMediaItem } from '@/types/movie';
import { useSwipe } from '../hooks/useSwipe';
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

interface SwipeCardProps {
  movie: TMDBMediaItem;
  onSwipeLeft:  (movie: TMDBMediaItem) => void;
  onSwipeRight: (movie: TMDBMediaItem) => void;
  onDetailsOpen: (movie: TMDBMediaItem) => void;
  isTop:  boolean;
  index:  number;
  topCardX?: SharedValue<number>;
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

// ჰელპერ ფუნქცია დინამიკური რეიტინგის ვიზუალისთვის
const getRatingTheme = (rating: number, colors: ThemeColors) => {
  if (rating >= 7.5) {
    return {
      bg: colors.primarySoft,
      border: colors.primaryHover,
      text: colors.primary,
    };
  } else if (rating >= 6.5) {
    return {
      bg: colors.successSoft,
      border: colors.success,
      text: colors.success,
    };
  } else if (rating >= 5.0) {
    return {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fbbf24',
    };
  } else {
    return {
      bg: colors.dangerSoft,
      border: colors.danger,
      text: colors.danger,
    };
  }
};

export default function SwipeCard({
  movie,
  onSwipeLeft,
  onSwipeRight,
  onDetailsOpen,
  isTop,
  index,
  topCardX,
}: SwipeCardProps) {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

  const title = movie.title ?? movie.name ?? 'Unknown';
  const year = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);
  const rating = movie.vote_average.toFixed(1);
  const isMasterpiece = movie.vote_average >= 8.5;
  const posterUri = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null;
  const ratingTheme = getRatingTheme(movie.vote_average, colors);
  const genreText = movie.genre_ids && movie.genre_ids.length > 0 
    ? movie.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 2).join(' • ')
    : '';

  const { gesture, animatedCardStyle, likeStyle, nopeStyle } = useSwipe({
    movie,
    isTop,
    index,
    topCardX,
    onSwipeLeft,
    onSwipeRight,
    onDetailsOpen,
  });

  const cardContent = (
    <Animated.View style={[styles.card, isMasterpiece && styles.masterpieceCard, animatedCardStyle]}>
      {posterUri ? (
        <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={styles.posterFallback}>
          <Ionicons name="film-outline" size={56} color={colors.textSubtle} />
        </View>
      )}

      <View style={styles.scrim} pointerEvents="none" />

      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => isTop && onDetailsOpen(movie)}
        style={styles.infoContainer}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[
              styles.ratingBadge, 
              { backgroundColor: ratingTheme.bg, borderColor: ratingTheme.border, flexDirection: 'row', alignItems: 'center', gap: 4 }
            ]}>
              <Ionicons name="star" size={11} color={ratingTheme.text} />
              <Text style={[styles.ratingText, { color: ratingTheme.text }]}>{rating}</Text>
            </View>
            
            {isMasterpiece && (
              <View style={[styles.masterpieceBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <Ionicons name="ribbon-outline" size={12} color="#fbbf24" />
                <Text style={styles.masterpieceBadgeText}>Masterpiece</Text>
              </View>
            )}
          </View>
        </View>

        <Text numberOfLines={1} style={styles.title}>{title}</Text>

        {year || genreText ? (
          <Text style={styles.year}>
            {year}{year && genreText ? '  •  ' : ''}{genreText}
          </Text>
        ) : null}

        <Text numberOfLines={2} style={styles.overview}>
          {movie.overview || 'No description available.'}
        </Text>
      </TouchableOpacity>

      {/* LIKE */}
      <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampLeft, likeStyle]}>
        <Text style={[styles.stampText, { color: colors.success }]}>LIKE</Text>
      </Animated.View>

      {/* NOPE */}
      <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampRight, nopeStyle]}>
        <Text style={[styles.stampText, { color: colors.danger }]}>NOPE</Text>
      </Animated.View>
    </Animated.View>
  );

  if (isTop) {
    return <GestureDetector gesture={gesture}>{cardContent}</GestureDetector>;
  }
  return cardContent;
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  card: {
    position:        'absolute',
    width:           '100%',
    height:          '100%',
    borderRadius:    28,
    backgroundColor: colors.surface,
    overflow:        'hidden',
    shadowColor:     colors.pureBlack,
    shadowOpacity:   0.45,
    shadowRadius:    24,
    shadowOffset:    { width: 0, height: 10 },
    elevation:       12,
  },
  masterpieceCard: {
    borderColor: '#fbbf24',
    borderWidth: 2,
    shadowColor: '#fbbf24',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  poster: {
    width:  '100%',
    height: '100%',
    position: 'absolute',
  },
  posterFallback: {
    width:           '100%',
    height:          '100%',
    backgroundColor: colors.surfaceElevated,
    alignItems:      'center',
    justifyContent:  'center',
  },
  scrim: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          '60%',
    backgroundColor: 'transparent',
  },
  infoContainer: {
    position:       'absolute',
    bottom:         0,
    left:           0,
    right:          0,
    paddingHorizontal: 22,
    paddingBottom:  28,
    paddingTop:     40,
    backgroundColor: colors.overlay,
  },
  ratingBadge: {
    alignSelf:       'flex-start',
    borderWidth:     1,
    borderRadius:    20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize:    12,
    fontWeight:  '600',
    letterSpacing: 0.5,
  },
  masterpieceBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  masterpieceBadgeText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color:        colors.pureWhite,
    fontSize:     26,
    fontWeight:   '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  year: {
    color:        colors.textMuted,
    fontSize:     13,
    fontWeight:   '400',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  overview: {
    color:      colors.textMuted,
    fontSize:   13,
    lineHeight: 19,
    fontWeight: '300',
  },
  stamp: {
    position:      'absolute',
    top:           54,
    borderWidth:   2.5,
    borderRadius:  10,
    paddingHorizontal: 14,
    paddingVertical:   5,
  },
  stampLeft: {
    left:        22,
    borderColor: colors.success,
  },
  stampRight: {
    right:       22,
    borderColor: colors.danger,
  },
  stampText: {
    fontSize:    24,
    fontWeight:  '800',
    letterSpacing: 2,
  },
});
