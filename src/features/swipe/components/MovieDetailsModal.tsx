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
  if (!movie) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Film Passport</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
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
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <View style={styles.modalRatingBadge}>
                  <Text style={styles.modalRatingText}>
                    ⭐ {movie.vote_average.toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.modalYear}>
                  {(movie.release_date ?? movie.first_air_date ?? "").slice(
                    0,
                    4,
                  )}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Storyline</Text>
            <Text style={styles.overviewText}>
              {movie.overview || "No description available."}
            </Text>

            <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
              Atmosphere
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {["🍿 Blockbuster", "✨ Highly Rated", "🎭 Drama / Action"].map(
                (tag, i) => (
                  <View key={i} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ),
              )}
            </View>
          </View>
        </ScrollView>
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
  modalScrim: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(10,10,15,0.65)",
  },
  modalMetaHero: { position: "absolute", bottom: 20, left: 24, right: 24 },
  modalTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  modalRatingBadge: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalRatingText: { color: "#000", fontSize: 12, fontWeight: "700" },
  modalYear: { color: "#71717a", fontSize: 14, fontWeight: "500" },
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
  tagBadge: {
    backgroundColor: "#111115",
    borderWidth: 1,
    borderColor: "#2d2d3d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: { color: "#e4e4e7", fontSize: 12, fontWeight: "400" },
});
