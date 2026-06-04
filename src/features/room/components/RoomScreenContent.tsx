import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, SafeAreaView, Share, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { Profile, Room, RoomUser } from "@/types/database";
import { roomService } from "@/services/roomService";
import { GENRES } from "../constants/createRoom";
import RoomTopBar from "./RoomTopBar";
import RoomParticipantsCard from "./RoomParticipantsCard";
import RoomActionsPanel from "./RoomActionsPanel";
import RoomOrbit, { OrbitAvatar } from "./RoomOrbit";

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

  const orbitAvatars: OrbitAvatar[] = members
    .filter((m) => m.status !== "left")
    .map((m) => {
      const name = profilesById[m.user_id]?.display_name ?? `User ${m.user_id.slice(0, 4)}`;
      return {
        initial: name.trim().charAt(0).toUpperCase() || "U",
        ready: m.status === "ready",
        isHost: room?.host_id === m.user_id,
      };
    });

  const settingsSummary = room
    ? `${room.content_type === "tv" ? "📺 TV Shows" : "🎬 Movies"}  ·  ${
        (room.genre_ids ?? [])
          .map((id) => GENRES.find((g) => g.id === id)?.name)
          .filter(Boolean)
          .slice(0, 3)
          .join(" · ") || "Any genre"
      }  ·  ${room.session_limit} films`
    : "";

  const handleShareInvite = async () => {
    try {
      await Share.share({ message: `Join my WatchMatch room — code: ${roomCode}` });
    } catch {
      // dismissed
    }
  };

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
      Vibration.vibrate(15);
      await roomService.setRoomUserStatus(room.id, user.id, isCurrentReady ? "joined" : "ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ready state.");
    } finally {
      setTogglingReady(false);
    }
  };

  const handleLeaveRoom = () => {
    if (!room || !user) return router.back();
    if (room.status !== "swiping") {
      roomService.setRoomUserStatus(room.id, user.id, "left").catch(() => {});
      return router.back();
    }

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

          <RoomOrbit avatars={orbitAvatars} />

          <TouchableOpacity activeOpacity={0.7} onPress={handleShareInvite} style={styles.codeWrap}>
            <Text style={styles.code}>{roomCode}</Text>
            <Ionicons name="copy-outline" size={18} color="#71717a" />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={handleShareInvite} style={styles.inviteButton}>
            <Ionicons name="share-social-outline" size={16} color="#c4b5fd" />
            <Text style={styles.inviteText}>Copy invite link</Text>
          </TouchableOpacity>

          {settingsSummary ? (
            <View style={styles.settingsTag}>
              <Text style={styles.settingsText}>{settingsSummary}</Text>
            </View>
          ) : null}

          <RoomParticipantsCard room={room} members={members} profilesById={profilesById} participantCount={participantCount} readyCount={readyCount} />
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 18 },
  eyebrow: { color: "#7c3aed", fontSize: 11, fontWeight: "600", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 18, textAlign: "center" },
  codeWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 22 },
  code: { color: "#f4f4f5", fontSize: 42, fontWeight: "800", letterSpacing: 6, fontFamily: "SpaceMono" },
  inviteButton: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 14,
  },
  inviteText: { color: "#c4b5fd", fontSize: 13, fontWeight: "600" },
  settingsTag: {
    alignSelf: "center",
    backgroundColor: "#15151c",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 18,
    marginBottom: 22,
  },
  settingsText: { color: "#d4d4d8", fontSize: 12.5, fontWeight: "500" },
});
