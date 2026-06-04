import { Profile, Room, RoomUser } from "@/types/database";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

interface RoomParticipantsCardProps {
  room: Room | null;
  members: RoomUser[];
  profilesById: Record<string, Profile>;
  participantCount: number;
  readyCount: number;
}

function ReadyBadge({ status }: { status: RoomUser["status"] }) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  const isReady = status === "ready";
  const left = status === "left";

  useEffect(() => {
    if (isReady || left) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isReady, left, pulse]);

  if (left) {
    return (
      <View style={[styles.badge, styles.badgeLeft]}>
        <Text style={[styles.badgeText, { color: "#fb7185" }]}>Left</Text>
      </View>
    );
  }
  if (isReady) {
    return (
      <View style={[styles.badge, styles.badgeReady]}>
        <Text style={[styles.badgeText, { color: "#4ade80" }]}>Ready ✓</Text>
      </View>
    );
  }
  return (
    <Animated.View style={[styles.badge, styles.badgeIdle, { opacity: pulse }]}>
      <Text style={[styles.badgeText, { color: "#a1a1aa" }]}>Waiting…</Text>
    </Animated.View>
  );
}

export default function RoomParticipantsCard({
  room,
  members,
  profilesById,
  participantCount,
  readyCount,
}: RoomParticipantsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Participants</Text>
        <Text style={styles.counts}>
          {readyCount}/{Math.max(participantCount, 2)} ready
        </Text>
      </View>

      <View style={styles.memberList}>
        {members.map((member) => {
          const profile = profilesById[member.user_id];
          const displayName = profile?.display_name ?? `User ${member.user_id.slice(0, 4)}`;
          const isHost = room?.host_id === member.user_id;
          const initial = displayName.trim().charAt(0).toUpperCase() || "U";
          const ready = member.status === "ready";
          return (
            <View key={member.id} style={styles.memberRow}>
              <View style={[styles.avatar, ready ? styles.avatarReady : styles.avatarIdle]}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.nameWrap}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {displayName}
                </Text>
                {isHost && (
                  <View style={styles.hostPill}>
                    <Text style={styles.hostPillText}>HOST</Text>
                  </View>
                )}
              </View>
              <ReadyBadge status={member.status} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#111115",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { color: "#a1a1aa", fontSize: 12, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  counts: { color: "#a78bfa", fontSize: 13, fontWeight: "700" },
  memberList: { gap: 10 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  avatarIdle: { backgroundColor: "rgba(124,58,237,0.18)", borderColor: "rgba(167,139,250,0.45)" },
  avatarReady: { backgroundColor: "rgba(34,197,94,0.18)", borderColor: "#22c55e" },
  avatarText: { color: "#f4f4f5", fontSize: 16, fontWeight: "800" },
  nameWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 },
  memberName: { color: "#f4f4f5", fontSize: 14, fontWeight: "600", flexShrink: 1 },
  hostPill: {
    borderRadius: 999,
    backgroundColor: "rgba(124,92,240,0.18)",
    borderWidth: 1,
    borderColor: "rgba(124,92,240,0.4)",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  hostPillText: { color: "#c4b5fd", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  badgeReady: { backgroundColor: "rgba(34,197,94,0.14)", borderColor: "rgba(34,197,94,0.4)" },
  badgeIdle: { backgroundColor: "rgba(161,161,170,0.1)", borderColor: "#3f3f46" },
  badgeLeft: { backgroundColor: "rgba(244,63,94,0.14)", borderColor: "rgba(244,63,94,0.4)" },
  badgeText: { fontSize: 11, fontWeight: "700" },
});
