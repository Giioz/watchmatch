import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { Profile, Room, RoomUser } from "@/types/database";
import { roomService } from "@/services/roomService";
import RoomTopBar from "./RoomTopBar";
import RoomParticipantsCard from "./RoomParticipantsCard";
import RoomActionsPanel from "./RoomActionsPanel";

export default function RoomScreenContent() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const roomCode = useMemo(() => (code ?? "").toUpperCase(), [code]);
  const { user, loading: loadingAuth } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startingMatch, setStartingMatch] = useState(false);
  const [togglingReady, setTogglingReady] = useState(false);
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      router.replace("/auth");
      return;
    }

    let isMounted = true;
    let roomUsersChannel: ReturnType<typeof roomService.subscribeToRoomUsers> | null = null;
    let roomChannel: ReturnType<typeof roomService.subscribeToRoom> | null = null;

    const bootstrap = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!roomCode) throw new Error("Missing room code.");

        const joinResult = await roomService.joinRoomByCode(roomCode, user.id);
        if (!isMounted) return;
        setRoom(joinResult.room);

        const roomMembers = await roomService.getRoomUsers(joinResult.room.id);
        if (!isMounted) return;
        setMembers(roomMembers);
        const profiles = await roomService.getProfilesByUserIds(roomMembers.map((m) => m.user_id));
        if (isMounted) setProfilesById(Object.fromEntries(profiles.map((p) => [p.id, p])));

        roomUsersChannel = roomService.subscribeToRoomUsers(joinResult.room.id, async () => {
          try {
            const nextMembers = await roomService.getRoomUsers(joinResult.room.id);
            if (isMounted) {
              setMembers(nextMembers);
              const nextProfiles = await roomService.getProfilesByUserIds(nextMembers.map((m) => m.user_id));
              setProfilesById(Object.fromEntries(nextProfiles.map((p) => [p.id, p])));
            }
          } catch {}
        });

        roomChannel = roomService.subscribeToRoom(joinResult.room.id, (payload) => {
          if (!isMounted || !payload.new) return;
          setRoom(payload.new);
          if (payload.new.status === "swiping") {
            router.replace(`/arena?code=${roomCode}`);
          }
        });
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to join room.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
      roomUsersChannel?.unsubscribe();
      roomChannel?.unsubscribe();
    };
  }, [loadingAuth, roomCode, router, user]);

  const participantCount = members.length;
  const isHost = Boolean(user && room && room.host_id === user.id);
  const readyCount = members.filter((m) => m.status === "ready").length;
  const hasLeftMember = members.some((m) => m.status === "left");
  const canStart = Boolean(isHost && room && room.status === "waiting" && participantCount === 2 && readyCount === 2 && !hasLeftMember);
  const currentMember = members.find((m) => m.user_id === user?.id);
  const isCurrentReady = currentMember?.status === "ready";

  const handleStartMatch = async () => {
    if (!room || !canStart || startingMatch) return;
    try {
      setStartingMatch(true);
      await roomService.setRoomStatus(room.id, "swiping");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start match.");
    } finally {
      setStartingMatch(false);
    }
  };

  const handleToggleReady = async () => {
    if (!room || !user || togglingReady) return;
    try {
      setTogglingReady(true);
      await roomService.setRoomUserStatus(room.id, user.id, isCurrentReady ? "joined" : "ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ready state.");
    } finally {
      setTogglingReady(false);
    }
  };

  const handleLeaveRoom = () => {
    if (!room || !user) return router.back();
    if (room.status !== "swiping") return router.back();

    Alert.alert("Leave Match?", "If you leave now, this session will end for both players.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await roomService.setRoomUserStatus(room.id, user.id, "left");
            await roomService.setRoomStatus(room.id, "finished");
            router.replace("/");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to leave room.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />
      <RoomTopBar onBack={handleLeaveRoom} />

      {loading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Joining room {roomCode || "----"}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBlock}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.eyebrow}>Waiting Room</Text>
          <Text style={styles.code}>{roomCode}</Text>
          <Text style={styles.subtitle}>Share this code with your partner to join.</Text>
          <RoomParticipantsCard room={room} members={members} profilesById={profilesById} participantCount={participantCount} readyCount={readyCount} />
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Room status</Text>
            <Text style={styles.statusValue}>{startingMatch ? "starting" : room?.status ?? "waiting"}</Text>
          </View>
          {(room?.status === "finished" || hasLeftMember) && (
            <Text style={styles.errorText}>Session ended because one player left. Create a new room.</Text>
          )}
          <RoomActionsPanel
            room={room}
            hasLeftMember={hasLeftMember}
            isCurrentReady={Boolean(isCurrentReady)}
            togglingReady={togglingReady}
            isHost={isHost}
            canStart={canStart}
            startingMatch={startingMatch}
            onToggleReady={handleToggleReady}
            onStartMatch={handleStartMatch}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0f" },
  orbTop: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "#7c3aed", opacity: 0.12, top: -90, right: -80 },
  orbBottom: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "#4f46e5", opacity: 0.1, bottom: -70, left: -60 },
  centerBlock: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  loadingText: { marginTop: 12, color: "#71717a", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.4 },
  errorText: { color: "#fca5a5", fontSize: 13, lineHeight: 19, textAlign: "center" },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 26 },
  eyebrow: { color: "#7c3aed", fontSize: 11, fontWeight: "600", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 8 },
  code: { color: "#f4f4f5", fontSize: 44, fontWeight: "800", letterSpacing: 2 },
  subtitle: { color: "#71717a", fontSize: 13, marginTop: 8, marginBottom: 24 },
  statusCard: { borderRadius: 14, borderWidth: 1, borderColor: "#27272a", backgroundColor: "#111115", paddingHorizontal: 16, paddingVertical: 16, marginBottom: 14 },
  statusLabel: { color: "#a1a1aa", fontSize: 12, marginBottom: 6 },
  statusValue: { color: "#c4b5fd", fontSize: 16, fontWeight: "700", textTransform: "capitalize" },
});
