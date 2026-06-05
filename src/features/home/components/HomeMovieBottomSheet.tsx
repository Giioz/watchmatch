import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TMDBMediaItem } from '@/types/movie';
import { BottomSheet } from '@/components/BottomSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  movie: TMDBMediaItem | null;
  onClose: () => void;
}

export default function HomeMovieBottomSheet({ visible, movie, onClose }: BottomSheetProps) {
  if (!movie) return null;

  const backdropUri = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null;

  const posterUri = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  const releaseYear = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);

  return (
    <BottomSheet 
      visible={visible} 
      onClose={onClose}
      backgroundColor="#0b0b0f"
      contentContainerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        {/* Cinematic Header: Backdrop Banner + Absolute Overlapping Poster */}
        <View style={styles.headerContainer}>
          <View style={styles.bannerContainer}>
            {backdropUri ? (
              <Image source={{ uri: backdropUri }} style={styles.bannerImage} resizeMode="cover" />
            ) : (
              <View style={styles.bannerFallback}>
                <Ionicons name="film-outline" size={32} color="#27273a" />
              </View>
            )}
          </View>
          
          {/* Overlapping vertical poster */}
          <View style={styles.posterContainer}>
            {posterUri ? (
              <Image source={{ uri: posterUri }} style={styles.posterImage} resizeMode="cover" />
            ) : (
              <View style={styles.posterFallback}>
                <Ionicons name="image-outline" size={20} color="#3f3f46" />
              </View>
            )}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title block shifted right to align with the overlapping poster */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleText} numberOfLines={2}>
              {movie.title ?? movie.name ?? 'Untitled'}
            </Text>
            
            <View style={styles.metaRow}>
              {releaseYear ? (
                <View style={styles.metaBadge}>
                  <Ionicons name="calendar-outline" size={11} color="#a78bfa" />
                  <Text style={styles.metaText}>{releaseYear}</Text>
                </View>
              ) : null}
              
              {movie.vote_average ? (
                <View style={styles.metaBadge}>
                  <Ionicons name="star" size={11} color="#facc15" />
                  <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
                </View>
              ) : null}

              {movie.popularity ? (
                <View style={styles.metaBadge}>
                  <Ionicons name="trending-up-outline" size={11} color="#38bdf8" />
                  <Text style={styles.popularityText}>{Math.round(movie.popularity)}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Storyline block */}
          <Text style={styles.sectionHeader}>STORYLINE</Text>
          <Text style={styles.overviewText}>
            {movie.overview || 'No storyline summary is currently available for this title.'}
          </Text>
          
          {/* Close Action */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={onClose} 
            style={styles.closeButton}
          >
            <Ionicons name="close-outline" size={18} color="#c4b5fd" style={{ marginRight: 6 }} />
            <Text style={styles.closeButtonText}>Close Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  container: {
    paddingBottom: 40,
    backgroundColor: '#0b0b0f',
  },
  headerContainer: {
    position: 'relative',
    height: 150,
    marginBottom: 32,
  },
  bannerContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#111116',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.55,
  },
  bannerFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterContainer: {
    position: 'absolute',
    bottom: -32,
    left: 24,
    width: 90,
    height: 135,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#0b0b0f',
    backgroundColor: '#181820',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  titleBlock: {
    paddingLeft: 104, // Offset past the absolute poster width + space
    minHeight: 103,   // Ensure title and metadata stack cleanly beside the poster height
    justifyContent: 'center',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '700',
  },
  popularityText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 18,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a78bfa',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  overviewText: {
    fontSize: 13.5,
    color: '#d1d5db',
    lineHeight: 22,
    fontWeight: '400',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 28,
  },
  closeButtonText: {
    color: '#c4b5fd',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
