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
import { useLocalSearchParams } from "expo-router";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { roomService } from "@/services/roomService";

import ArenaControls from "./ArenaControls";
import ArenaHeader from "./ArenaHeader";
import MovieDetailsModal from "./MovieDetailsModal";
import SwipeCard from "./SwipeCard";
import ArenaNoMatchState from "./ArenaNoMatchState";
import ArenaSessionModals from "./ArenaSessionModals";
import { useArena } from "../hooks/useArena";

const CARD_STACK_SIZE = 3;

export default function ArenaScreenContent() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { user } = useAuthSession();
  const [roundLoading, setRoundLoading] = React.useState<null | "rerun" | "liked">(null);
  const [roundError, setRoundError] = React.useState<string | null>(null);
  const [isSessionEndedModalVisible, setIsSessionEndedModalVisible] = React.useState(false);
  const [isLeaveConfirmVisible, setIsLeaveConfirmVisible] = React.useState(false);
  const hasHandledSessionEndRef = React.useRef(false);
  const {
    movies,
    loading,
    likedCount,
    swipedCount,
    currentIndex,
    selectedMovie,
    isModalVisible,
    matchedMovie,
    roomCode,
    roomId,
    isRoomMode,
    topCardX,
    handleSwipeLeft,
    handleSwipeRight,
    handleRefresh,
    openDetails,
    closeDetails,
  } = useArena({ roomCode: code?.toUpperCase() });

  const visibleMovies = movies.slice(
    currentIndex,
    currentIndex + CARD_STACK_SIZE,
  );
  const isDone = !loading && currentIndex >= movies.length && movies.length > 0;
  const isNoMatch = isRoomMode && isDone && !matchedMovie;
  const handleSessionEnded = React.useCallback(() => {
    if (hasHandledSessionEndRef.current) return;
    hasHandledSessionEndRef.current = true;
    setIsSessionEndedModalVisible(true);
  }, []);

  const handleArenaBack = React.useCallback(() => {
    if (!isRoomMode || !roomId || !user) {
      router.back();
      return;
    }
    setIsLeaveConfirmVisible(true);
  }, [isRoomMode, roomId, router, user]);

  const confirmLeave = React.useCallback(async () => {
    if (!roomId || !user) return;
    try {
      await roomService.setRoomUserStatus(roomId, user.id, "left");
      await roomService.setRoomStatus(roomId, "finished");
      setIsLeaveConfirmVisible(false);
      router.replace("/");
    } catch (error) {
      setIsLeaveConfirmVisible(false);
      setRoundError(error instanceof Error ? error.message : "Failed to leave room.");
    }
  }, [roomId, router, user]);

  const handleRunAgain = React.useCallback(async () => {
    if (!user || !roomCode || roundLoading) return;
    try {
      setRoundError(null);
      setRoundLoading("rerun");
      const room = await roomService.getRoomByCode(roomCode);
      if (!room) throw new Error("Room not found.");
      const next = await roomService.createRoomFromFilters({
        hostId: user.id,
        contentType: room.content_type,
        genreIds: room.genre_ids,
        sessionLimit: 10,
      });
      router.replace(`/room/${next.room.code}`);
    } catch (error) {
      setRoundError(error instanceof Error ? error.message : "Failed to start next round.");
    } finally {
      setRoundLoading(null);
    }
  }, [roomCode, roundLoading, router, user]);

  const handleSecondRoundLiked = React.useCallback(async () => {
    if (!user || !roomCode || !roomId || roundLoading) return;
    try {
      setRoundError(null);
      setRoundLoading("liked");
      const room = await roomService.getRoomByCode(roomCode);
      if (!room) throw new Error("Room not found.");
      const likedIds = await roomService.getLikedRoomMovieIds(roomId);
      if (likedIds.length < 2) {
        throw new Error("Not enough liked movies for round 2 yet.");
      }
      const next = await roomService.createRoomFromExistingQueue({
        hostId: user.id,
        sourceRoom: room,
        roomMovieIds: likedIds.slice(0, 10),
      });
      router.replace(`/room/${next.room.code}`);
    } catch (error) {
      setRoundError(error instanceof Error ? error.message : "Failed to start second round.");
    } finally {
      setRoundLoading(null);
    }
  }, [roomCode, roomId, roundLoading, router, user]);

  React.useEffect(() => {
    if (!matchedMovie) return;
    if (roomId) {
      roomService.setRoomStatus(roomId, "finished").catch(() => {});
    }
    router.replace({
      pathname: "/match",
      params: {
        title: matchedMovie.title ?? matchedMovie.name ?? "Matched",
        poster: matchedMovie.poster_path ?? "",
        rating: String(matchedMovie.vote_average ?? ""),
        year: (matchedMovie.release_date ?? matchedMovie.first_air_date ?? "").slice(0, 4),
        overview: matchedMovie.overview ?? "",
      },
    });
  }, [matchedMovie, roomId, router]);

  React.useEffect(() => {
    if (!isRoomMode || !roomId) return;
    const roomChannel = roomService.subscribeToRoom(roomId, (payload) => {
      if (!payload.new) return;
      if (payload.new.status === "finished") {
        handleSessionEnded();
      }
    });
    const usersChannel = roomService.subscribeToRoomUsers(roomId, (payload) => {
      if (!payload.new) return;
      if (payload.new.status === "left") {
        handleSessionEnded();
      }
    });
    return () => {
      roomChannel.unsubscribe();
      usersChannel.unsubscribe();
    };
  }, [handleSessionEnded, isRoomMode, roomId]);

  React.useEffect(() => {
    if (!isRoomMode || !roomId || !user) return;
    let active = true;
    const interval = setInterval(async () => {
      try {
        const [roomState, users] = await Promise.all([
          roomService.getRoomByCode(roomCode ?? ""),
          roomService.getRoomUsers(roomId),
        ]);
        if (!active) return;
        const someoneLeft = users.some((m) => m.status === "left" && m.user_id !== user.id);
        if (roomState?.status === "finished" || someoneLeft) {
          clearInterval(interval);
          handleSessionEnded();
        }
      } catch {
        // Ignore transient checks.
      }
    }, 1200);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [handleSessionEnded, isRoomMode, roomCode, roomId, user]);

  React.useEffect(() => {
    if (!isNoMatch || !roomId) return;
    roomService.setRoomStatus(roomId, "finished").catch(() => {});
  }, [isNoMatch, roomId]);

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
        onBack={handleArenaBack}
        swipedCount={swipedCount}
        likedCount={likedCount}
      />

      <View style={styles.stackContainer}>
        {isNoMatch ? (
          <ArenaNoMatchState
            roundLoading={roundLoading}
            roundError={roundError}
            onRunAgain={handleRunAgain}
            onSecondRoundLiked={handleSecondRoundLiked}
          />
        ) : isDone ? (
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
                topCardX={topCardX}
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

      <ArenaSessionModals
        isSessionEndedModalVisible={isSessionEndedModalVisible}
        isLeaveConfirmVisible={isLeaveConfirmVisible}
        onCloseSessionEnded={() => {
          setIsSessionEndedModalVisible(false);
          router.replace("/");
        }}
        onCancelLeave={() => setIsLeaveConfirmVisible(false)}
        onConfirmLeave={confirmLeave}
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
