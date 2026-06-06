import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TMDBMediaItem } from "@/types/movie";
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

interface MovieDetailsModalProps {
  visible: boolean;
  movie: TMDBMediaItem | null;
  onClose: () => void;
}

export default function MovieDetailsModal({
  visible,
  movie,
  onClose,
}: MovieDetailsModalProps) {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

  if (!movie) return null;

  const backdropUri = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null;

  const posterUri = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  const releaseYear = (movie.release_date ?? movie.first_air_date ?? "").slice(0, 4);

  // Map genres dynamically
  const genres = movie.genre_ids && movie.genre_ids.length > 0
    ? movie.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean)
    : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header bar */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Movie Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cinematic Header: Backdrop Banner + Overlapping Poster */}
          <View style={styles.headerContainer}>
            <View style={styles.bannerContainer}>
              {backdropUri ? (
                <Image source={{ uri: backdropUri }} style={styles.bannerImage} resizeMode="cover" />
              ) : (
                <View style={styles.bannerFallback}>
                  <Ionicons name="film-outline" size={36} color={colors.surfaceHighlight} />
                </View>
              )}
            </View>

            {/* Overlapping vertical poster */}
            <View style={styles.posterContainer}>
              {posterUri ? (
                <Image source={{ uri: posterUri }} style={styles.posterImage} resizeMode="cover" />
              ) : (
                <View style={styles.posterFallback}>
                  <Ionicons name="image-outline" size={20} color={colors.textSubtle} />
                </View>
              )}
            </View>
          </View>

          {/* Content Block */}
          <View style={styles.content}>
            {/* Title Block shifted right to clear the overlapping poster */}
            <View style={styles.titleBlock}>
              <Text style={styles.titleText} numberOfLines={2}>
                {movie.title ?? movie.name ?? 'Untitled'}
              </Text>
              
              <View style={styles.metaRow}>
                {releaseYear ? (
                  <View style={styles.metaBadge}>
                    <Ionicons name="calendar-outline" size={11} color={colors.primary} />
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

            {/* Storyline Section */}
            <Text style={styles.sectionTitle}>Storyline</Text>
            <Text style={styles.overviewText}>
              {movie.overview || "No storyline description is currently available for this title."}
            </Text>

            {/* Dynamic Genres Section */}
            {genres.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
                  Genres
                </Text>
                <View style={styles.tagsContainer}>
                  {genres.map((genre, i) => (
                    <View key={i} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  modalHeaderTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  closeButton: {
    backgroundColor: colors.surface,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerContainer: {
    position: "relative",
    height: 180,
    marginBottom: 32,
  },
  bannerContainer: {
    width: "100%",
    height: 180,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.55,
  },
  bannerFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  posterContainer: {
    position: "absolute",
    bottom: -32,
    left: 24,
    width: 90,
    height: 135,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: colors.background,
    backgroundColor: colors.surfaceElevated,
    overflow: "hidden",
    shadowColor: colors.pureBlack,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  posterFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
  },
  titleBlock: {
    paddingLeft: 104, // Offset past the absolute poster width + space
    minHeight: 103,   // Ensure title and metadata stack cleanly beside the poster height
    justifyContent: "center",
  },
  titleText: {
    color: colors.pureWhite,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  ratingText: {
    color: "#facc15",
    fontSize: 10,
    fontWeight: "700",
  },
  popularityText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  overviewText: {
    color: colors.textMuted,
    fontSize: 13.5,
    lineHeight: 22,
    fontWeight: "400",
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: { color: colors.textSubtle, fontSize: 11, fontWeight: "500" },
});
