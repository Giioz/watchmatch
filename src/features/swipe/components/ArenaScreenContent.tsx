import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { roomService } from "@/services/roomService";
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

import ArenaControls from "./ArenaControls";
import ArenaHeader from "./ArenaHeader";
import MovieDetailsModal from "./MovieDetailsModal";
import SwipeCard from "./SwipeCard";
import ArenaNoMatchState from "./ArenaNoMatchState";
import ArenaSessionModals from "./ArenaSessionModals";
import MatchCelebrationOverlay from "./MatchCelebrationOverlay";
import { useArena } from "../hooks/useArena";

const CARD_STACK_SIZE = 3;

export default function ArenaScreenContent() {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();
  
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { user } = useAuthSession();
  const [roundLoading, setRoundLoading] = React.useState<null | "rerun" | "liked">(null);
  const [roundError, setRoundError] = React.useState<string | null>(null);
  const [isSessionEndedModalVisible, setIsSessionEndedModalVisible] = React.useState(false);
  const [isLeaveConfirmVisible, setIsLeaveConfirmVisible] = React.useState(false);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const hasHandledSessionEndRef = React.useRef(false);
  const {
    movies,
    loading,
    likedCount,
    swipedCount,
    opponentSwipes,
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
    if (matchedMovie) return; // Don't interrupt match celebration
    hasHandledSessionEndRef.current = true;
    setIsSessionEndedModalVisible(true);
  }, [matchedMovie]);

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
    
    setShowCelebration(true);
    
    const timeout = setTimeout(() => {
      setShowCelebration(false);
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
    }, 3000);
    
    return () => clearTimeout(timeout);
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

  // Removed premature setRoomStatus("finished") on isNoMatch
  // to prevent kicking the slower swiper out of the session.

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Curating random films…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ArenaHeader
        onBack={handleArenaBack}
        swipedCount={swipedCount}
        likedCount={likedCount}
        currentIndex={currentIndex}
        totalCount={movies.length}
        opponentSwipes={opponentSwipes}
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
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.doneText}>End of this stack!</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={[styles.refreshButton, { flexDirection: "row", alignItems: "center", gap: 6 }]}
            >
              <Text style={{ color: colors.pureWhite, fontWeight: "600" }}>Go Again</Text>
              <Ionicons name="refresh" size={14} color={colors.pureWhite} />
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

      <MatchCelebrationOverlay
        visible={showCelebration}
        movie={matchedMovie}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textMuted,
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
    color: colors.text,
    fontSize: 22,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
