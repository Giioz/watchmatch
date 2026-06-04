import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TMDBMediaItem } from "@/types/movie";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10765: "Sci-Fi & Fantasy",
};

interface MovieDetailsModalProps {
  visible: boolean;
  movie: TMDBMediaItem | null;
  onClose: () => void;
  onLike?: () => void;
  onPass?: () => void;
}

function whyYoudLoveIt(movie: TMDBMediaItem, topGenre?: string): string {
  const rating = movie.vote_average ?? 0;
  const genrePart = topGenre ? `${topGenre.toLowerCase()} ` : "";
  if (rating >= 8.5) {
    return `A near-perfect ${genrePart}pick — the kind of film you'll both still be quoting next week.`;
  }
  if (rating >= 7.5) {
    return `Critically loved and easy to agree on. A strong, no-regrets ${genrePart}night in.`;
  }
  if (rating >= 6.5) {
    return `A solid, well-liked ${genrePart}watch that rarely disappoints a duo.`;
  }
  return `A bit of a wildcard — this ${genrePart}one could be the surprise hit of the night.`;
}

export default function MovieDetailsModal({
  visible,
  movie,
  onClose,
  onLike,
  onPass,
}: MovieDetailsModalProps) {
  if (!movie) return null;

  const genres = (movie.genre_ids ?? [])
    .map((id) => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 4);
  const showActions = Boolean(onLike && onPass);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Film Passport</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: showActions ? 120 : 60 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalHero}>
            <Image
              source={{ uri: `${IMAGE_BASE_URL}${movie.poster_path}` }}
              style={styles.modalPoster}
              resizeMode="cover"
            />
            <View style={styles.modalScrim} />
            <View style={styles.modalMetaHero}>
              <Text style={styles.modalTitle}>{movie.title ?? movie.name}</Text>
              <View style={styles.heroMetaRow}>
                <View style={styles.modalRatingBadge}>
                  <Text style={styles.modalRatingText}>⭐ {movie.vote_average.toFixed(1)}</Text>
                </View>
                <Text style={styles.modalYear}>
                  {(movie.release_date ?? movie.first_air_date ?? "").slice(0, 4)}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            {genres.length > 0 && (
              <View style={styles.tagRow}>
                {genres.map((tag) => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.whyCard}>
              <Text style={styles.whyLabel}>Why you'd love it</Text>
              <Text style={styles.whyText}>{whyYoudLoveIt(movie, genres[0])}</Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Storyline</Text>
            <Text style={styles.overviewText}>{movie.overview || "No description available."}</Text>
          </View>
        </ScrollView>

        {showActions && (
          <View style={styles.actionsBar}>
            <TouchableOpacity activeOpacity={0.85} onPress={onPass} style={[styles.actionBtn, styles.passBtn]}>
              <Ionicons name="close" size={22} color="#f87171" />
              <Text style={[styles.actionText, { color: "#f87171" }]}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} onPress={onLike} style={[styles.actionBtn, styles.likeBtn]}>
              <Ionicons name="heart" size={22} color="#fff" />
              <Text style={[styles.actionText, { color: "#fff" }]}>Like</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#0a0a0f" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#1f1f29",
    backgroundColor: "#0e0e13",
  },
  modalHeaderTitle: {
    color: "#7c3aed",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  closeButton: {
    backgroundColor: "#27272a",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHero: { width: "100%", height: 380, position: "relative" },
  modalPoster: { width: "100%", height: "100%" },
  modalScrim: { position: "absolute", inset: 0, backgroundColor: "rgba(10,10,15,0.65)" },
  modalMetaHero: { position: "absolute", bottom: 20, left: 24, right: 24 },
  modalTitle: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  heroMetaRow: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8 },
  modalRatingBadge: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalRatingText: { color: "#000", fontSize: 12, fontWeight: "700" },
  modalYear: { color: "#71717a", fontSize: 14, fontWeight: "500" },
  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 18 },
  tagBadge: {
    backgroundColor: "#111115",
    borderWidth: 1,
    borderColor: "#2d2d3d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: { color: "#e4e4e7", fontSize: 12, fontWeight: "500" },
  whyCard: {
    backgroundColor: "rgba(124,92,240,0.1)",
    borderWidth: 1,
    borderColor: "rgba(124,92,240,0.3)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  whyLabel: {
    color: "#a78bfa",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  whyText: { color: "#e4e4e7", fontSize: 14, lineHeight: 21, fontWeight: "400" },
  sectionTitle: {
    color: "#7c3aed",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  overviewText: {
    color: "#a1a1aa",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 8,
    fontWeight: "300",
  },
  actionsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 30,
    backgroundColor: "rgba(10,10,15,0.96)",
    borderTopWidth: 1,
    borderColor: "#1f1f29",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  passBtn: { backgroundColor: "#15151c", borderColor: "#3f3f46" },
  likeBtn: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  actionText: { fontSize: 15, fontWeight: "700" },
});
