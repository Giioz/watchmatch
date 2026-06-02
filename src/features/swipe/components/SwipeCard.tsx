import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { TMDBMediaItem } from '@/types/movie';
import { useSwipe } from '../hooks/useSwipe';

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
const getRatingTheme = (rating: number) => {
  if (rating >= 7.5) {
    return {
      bg: 'rgba(139, 92, 246, 0.15)',      // პრემიუმ იასამნისფერი
      border: 'rgba(139, 92, 246, 0.35)',
      text: '#c4b5fd',
    };
  } else if (rating >= 6.5) {
    return {
      bg: 'rgba(34, 197, 94, 0.12)',       // ნაის მწვანე
      border: 'rgba(34, 197, 94, 0.3)',
      text: '#4ade80',
    };
  } else if (rating >= 5.0) {
    return {
      bg: 'rgba(245, 158, 11, 0.12)',      // თბილი ნარინჯისფერი
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fbbf24',
    };
  } else {
    return {
      bg: 'rgba(239, 68, 68, 0.12)',       // კრიტიკული წითელი
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#f87171',
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
  const title = movie.title ?? movie.name ?? 'Unknown';
  const year = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);
  const rating = movie.vote_average.toFixed(1);
  const posterUri = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null;
  const ratingTheme = getRatingTheme(movie.vote_average);
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
    <Animated.View style={[styles.card, animatedCardStyle]}>
      {posterUri ? (
        <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={styles.posterFallback}>
          <Text style={{ fontSize: 56 }}>🎬</Text>
        </View>
      )}

      <View style={styles.scrim} pointerEvents="none" />

      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => isTop && onDetailsOpen(movie)}
        style={styles.infoContainer}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          {/* დინამიკური სტილები პირდაპირ ჰელპერიდან ჯდება */}
          <View style={[
            styles.ratingBadge, 
            { backgroundColor: ratingTheme.bg, borderColor: ratingTheme.border }
          ]}>
            <Text style={[styles.ratingText, { color: ratingTheme.text }]}>★ {rating}</Text>
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
        <Text style={[styles.stampText, { color: '#4ade80' }]}>LIKE</Text>
      </Animated.View>

      {/* NOPE */}
      <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampRight, nopeStyle]}>
        <Text style={[styles.stampText, { color: '#f87171' }]}>NOPE</Text>
      </Animated.View>
    </Animated.View>
  );

  if (isTop) {
    return <GestureDetector gesture={gesture}>{cardContent}</GestureDetector>;
  }
  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    position:        'absolute',
    width:           '100%',
    height:          '100%',
    borderRadius:    28,
    backgroundColor: '#111114',
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOpacity:   0.45,
    shadowRadius:    24,
    shadowOffset:    { width: 0, height: 10 },
    elevation:       12,
  },
  poster: {
    width:  '100%',
    height: '100%',
    position: 'absolute',
  },
  posterFallback: {
    width:           '100%',
    height:          '100%',
    backgroundColor: '#1c1c1e',
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
    backgroundColor: 'rgba(10,10,15,0.82)',
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
  title: {
    color:        '#ffffff',
    fontSize:     26,
    fontWeight:   '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  year: {
    color:        'rgba(255,255,255,0.45)',
    fontSize:     13,
    fontWeight:   '400',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  overview: {
    color:      'rgba(255,255,255,0.55)',
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
    borderColor: '#4ade80',
  },
  stampRight: {
    right:       22,
    borderColor: '#f87171',
  },
  stampText: {
    fontSize:    24,
    fontWeight:  '800',
    letterSpacing: 2,
  },
});
