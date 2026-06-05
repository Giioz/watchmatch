import { Profile, Room, RoomUser } from "@/types/database";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  // Find host and guest slots
  const hostMember = members.find(m => room?.host_id === m.user_id);
  const guestMember = members.find(m => room?.host_id !== m.user_id);

  const renderSlot = (title: string, member: RoomUser | undefined, isSlotHost: boolean) => {
    if (!member) {
      return (
        <View style={styles.emptySlotCard}>
          <View style={[styles.avatarCircle, styles.avatarCircleEmpty]}>
            <Ionicons name="person-add-outline" size={16} color="#52525b" />
          </View>
          <Text style={styles.statusTextEmptyTitle}>
            Waiting...
          </Text>
          <Text style={styles.statusTextEmptyDesc}>
            Partner Slot
          </Text>
        </View>
      );
    }

    const profile = profilesById[member.user_id];
    const displayName = profile?.display_name ?? `User ${member.user_id.slice(0, 4)}`;
    const isReady = member.status === "ready";
    const hasLeft = member.status === "left";

    // Dynamic avatar ring styles
    const avatarRingStyle = hasLeft 
      ? styles.avatarCircleLeft 
      : isReady 
        ? styles.avatarCircleReady 
        : styles.avatarCircleDefault;

    // Dynamic status pill styles
    const statusPillStyle = hasLeft 
      ? styles.statusPillLeft 
      : isReady 
        ? styles.statusPillReady 
        : styles.statusPillDefault;

    const statusPillLabelStyle = hasLeft 
      ? styles.statusPillLabelLeft 
      : isReady 
        ? styles.statusPillLabelReady 
        : styles.statusPillLabelDefault;

    return (
      <View style={styles.slotCard}>
        {/* Avatar Ring */}
        <View style={[styles.avatarCircle, avatarRingStyle]}>
          <Ionicons 
            name={hasLeft ? "close-outline" : isReady ? "checkmark" : "person-outline"} 
            size={16} 
            color={hasLeft ? "#fca5a5" : isReady ? "#4ade80" : "#a78bfa"} 
          />
        </View>

        {/* Display Name */}
        <Text style={styles.displayName} numberOfLines={1}>
          {displayName}
        </Text>

        {/* Role Badge */}
        <Text style={styles.roleText}>
          {isSlotHost ? "HOST" : "GUEST"}
        </Text>

        {/* Status Pill */}
        <View style={[styles.statusPill, statusPillStyle]}>
          <Text style={[styles.statusPillLabel, statusPillLabelStyle]}>
            {hasLeft ? "Left" : isReady ? "Ready" : "Joining"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.titleLabel}>
          CO-WATCH PARTNERS
        </Text>
        <Text style={styles.readyCountText}>
          {readyCount}/2 ready
        </Text>
      </View>

      <View style={styles.slotsRow}>
        {renderSlot("Host Slot", hostMember, true)}
        {renderSlot("Partner Slot", guestMember, false)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  titleLabel: {
    fontSize: 10,
    color: "#71717a",
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  readyCountText: {
    fontSize: 11,
    color: "#a78bfa",
    fontWeight: "600",
  },
  slotsRow: {
    flexDirection: "row",
    gap: 16,
  },
  slotCard: {
    flex: 1,
    backgroundColor: "#13131c",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  emptySlotCard: {
    flex: 1,
    backgroundColor: "rgba(19, 19, 28, 0.45)",
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  avatarCircleDefault: {
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    borderColor: "rgba(167, 139, 250, 0.2)",
  },
  avatarCircleReady: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderColor: "rgba(74, 222, 128, 0.4)",
  },
  avatarCircleLeft: {
    backgroundColor: "rgba(252, 165, 165, 0.1)",
    borderColor: "rgba(252, 165, 165, 0.3)",
  },
  avatarCircleEmpty: {
    backgroundColor: "rgba(24, 24, 34, 0.6)",
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  displayName: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  roleText: {
    fontSize: 9,
    color: "#71717a",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  statusTextEmptyTitle: {
    fontSize: 13,
    color: "#52525b",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  statusTextEmptyDesc: {
    fontSize: 10,
    color: "#3f3f46",
    textAlign: "center",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  statusPillDefault: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  statusPillReady: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderColor: "rgba(74, 222, 128, 0.25)",
  },
  statusPillLeft: {
    backgroundColor: "rgba(252, 165, 165, 0.1)",
    borderColor: "rgba(252, 165, 165, 0.25)",
  },
  statusPillLabel: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusPillLabelDefault: {
    color: "#71717a",
  },
  statusPillLabelReady: {
    color: "#4ade80",
  },
  statusPillLabelLeft: {
    color: "#fca5a5",
  },
});
