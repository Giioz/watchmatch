import { Profile, Room, RoomUser } from "@/types/database";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RoomParticipantsCardProps {
  room: Room | null;
  members: RoomUser[];
  profilesById: Record<string, Profile>;
  participantCount: number;
  readyCount: number;
}

export default function RoomParticipantsCard({
  room,
  members,
  profilesById,
  participantCount,
  readyCount,
}: RoomParticipantsCardProps) {
  return (
    <View style={styles.participantsCard}>
      <Text style={styles.participantsTitle}>Participants</Text>
      <Text style={styles.participantsValue}>{participantCount}/2 connected</Text>
      <Text style={styles.readyValue}>{readyCount}/2 ready</Text>
      <View style={styles.memberList}>
        {members.map((member) => {
          const profile = profilesById[member.user_id];
          const displayName = profile?.display_name ?? `User ${member.user_id.slice(0, 4)}`;
          const ready = member.status === "ready";
          return (
            <View key={member.id} style={styles.memberRow}>
              <Text style={styles.memberName}>
                {displayName} {room?.host_id === member.user_id ? "(Host)" : ""}
              </Text>
              <Text style={[styles.memberStatus, ready ? styles.memberReady : styles.memberNotReady]}>
                {member.status === "left" ? "Left" : ready ? "Ready" : "Not Ready"}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  participantsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#111115",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  participantsTitle: {
    color: "#a1a1aa",
    fontSize: 12,
    marginBottom: 6,
  },
  participantsValue: {
    color: "#f4f4f5",
    fontSize: 20,
    fontWeight: "700",
  },
  readyValue: {
    color: "#a78bfa",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
    fontWeight: "600",
  },
  memberList: { gap: 8 },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#0f0f14",
  },
  memberName: {
    color: "#f4f4f5",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  memberStatus: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  memberReady: {
    backgroundColor: "rgba(34,197,94,0.16)",
    color: "#4ade80",
  },
  memberNotReady: {
    backgroundColor: "rgba(244,63,94,0.16)",
    color: "#fb7185",
  },
});
