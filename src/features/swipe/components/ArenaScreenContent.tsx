import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import ArenaControls from "./ArenaControls";
import ArenaHeader from "./ArenaHeader";
import MovieDetailsModal from "./MovieDetailsModal";
import SwipeCard from "./SwipeCard";
import { useArena } from "../hooks/useArena";

const CARD_STACK_SIZE = 3;

export default function ArenaScreenContent() {
  const router = useRouter();
  const {
    movies,
    loading,
    likedCount,
    swipedCount,
    currentIndex,
    selectedMovie,
    isModalVisible,
    topCardX,
    handleSwipeLeft,
    handleSwipeRight,
    handleRefresh,
    openDetails,
    closeDetails,
  } = useArena();

  const visibleMovies = movies.slice(
    currentIndex,
    currentIndex + CARD_STACK_SIZE,
  );
  const isDone = !loading && currentIndex >= movies.length && movies.length > 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Curating random films…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      <ArenaHeader
        onBack={() => router.back()}
        swipedCount={swipedCount}
        likedCount={likedCount}
      />

      <View style={styles.stackContainer}>
        {isDone ? (
          <View style={styles.doneContainer}>
            <Text style={{ fontSize: 40 }}>🎲</Text>
            <Text style={styles.doneText}>End of this stack!</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Go Again 🔄
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          [...visibleMovies].reverse().map((movie, reversedIdx) => {
            const stackIndex = visibleMovies.length - 1 - reversedIdx;
            const isTop = stackIndex === 0;
            return (
              <SwipeCard
                key={movie.id}
                movie={movie}
                isTop={isTop}
                index={stackIndex}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onDetailsOpen={openDetails}
                topCardX={isTop ? undefined : topCardX}
              />
            );
          })
        )}
      </View>

      {!isDone && (
        <ArenaControls
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onRefresh={handleRefresh}
        />
      )}

      <MovieDetailsModal
        visible={isModalVisible}
        movie={selectedMovie}
        onClose={closeDetails}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0a0a0f",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#52525b",
    marginTop: 12,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  stackContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 108,
  },
  doneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  doneText: {
    color: "#f4f4f5",
    fontSize: 22,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});