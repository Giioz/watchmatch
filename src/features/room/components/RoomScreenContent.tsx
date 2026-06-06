import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, SafeAreaView, Text, View, TouchableOpacity, Share, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { Profile, Room, RoomUser } from "@/types/database";
import { roomService } from "@/services/roomService";
import RoomTopBar from "./RoomTopBar";
import RoomParticipantsCard from "./RoomParticipantsCard";
import RoomActionsPanel from "./RoomActionsPanel";
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

export default function RoomScreenContent() {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

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
      {/* Ambient Orbs */}
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />
      
      <RoomTopBar onBack={handleLeaveRoom} />

      {loading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Joining room {roomCode || "----"}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerBlock}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Header Title */}
          <View style={styles.headerSection}>
            <Text style={styles.eyebrow}>
              WAITING ROOM
            </Text>
            <Text style={styles.title}>
              Co-Watch Match
            </Text>
          </View>

          {/* Movie Ticket Room Code Card */}
          <View style={styles.ticketCard}>
            {/* Top half: Ticket Details */}
            <View style={styles.ticketTop}>
              <View style={styles.ticketHeaderRow}>
                <Text style={styles.ticketLabel}>
                  SESSION TICKET
                </Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusBadgeDot} />
                  <Text style={styles.statusBadgeText}>
                    {room?.status === "waiting" ? "Waiting" : "Swiping"}
                  </Text>
                </View>
              </View>

              <View style={styles.ticketBody}>
                <View>
                  <Text style={styles.codeLabel}>
                    ROOM CODE
                  </Text>
                  <Text style={styles.codeText}>
                    {roomCode}
                  </Text>
                </View>
                
                {/* Share Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Share.share({
                      message: `Join my WatchMatch co-watching session! Code: ${roomCode}`,
                    }).catch(() => {});
                  }}
                  style={styles.shareButton}
                >
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Ticket Dashed Separator with Left/Right cutouts */}
            <View style={styles.ticketDivider}>
              <View style={styles.leftCutout} />
              <View style={styles.dashedLine} />
              <View style={styles.rightCutout} />
            </View>

            {/* Bottom half: Session Info */}
            <View style={styles.ticketBottom}>
              <View style={styles.ticketBottomInfo}>
                <Ionicons name="film-outline" size={15} color={colors.textSubtle} style={{ marginRight: 6 }} />
                <Text style={styles.ticketBottomInfoText}>
                  {room?.content_type === "movie" ? "Movies Pool" : "TV Shows Pool"}
                </Text>
              </View>
              
              <Text style={styles.ticketBottomSharePrompt}>
                SHARE WITH PARTNER
              </Text>
            </View>
          </View>

          {/* Connected Participants Side-by-side Grid */}
          <RoomParticipantsCard 
            room={room} 
            members={members} 
            profilesById={profilesById} 
            participantCount={participantCount} 
            readyCount={readyCount} 
          />

          {/* Ended Session Warning */}
          {(room?.status === "finished" || hasLeftMember) && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                Session ended because one player left. Create a new room.
              </Text>
            </View>
          )}

          {/* Action Buttons Panel */}
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

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orbTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primary,
    opacity: 0.1,
    top: -90,
    right: -80,
  },
  orbBottom: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryHover,
    opacity: 0.08,
    bottom: -70,
    left: -60,
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  loadingText: {
    marginTop: 14,
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  eyebrow: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: colors.pureBlack,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  ticketTop: {
    padding: 24,
  },
  ticketHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketLabel: {
    fontSize: 10,
    color: colors.textSubtle,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.primaryHover,
  },
  statusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primarySoft,
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ticketBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 40,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 6,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  ticketDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 24,
    overflow: "hidden",
  },
  leftCutout: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginLeft: -12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rightCutout: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginRight: -12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dashedLine: {
    flex: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 4,
    height: 0,
  },
  ticketBottom: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketBottomInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketBottomInfoText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  ticketBottomSharePrompt: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  warningCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  warningText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    fontWeight: "500",
  },
});
