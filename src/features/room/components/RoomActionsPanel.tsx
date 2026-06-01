import { Room } from "@/types/database";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RoomActionsPanelProps {
  room: Room | null;
  hasLeftMember: boolean;
  isCurrentReady: boolean;
  togglingReady: boolean;
  isHost: boolean;
  canStart: boolean;
  startingMatch: boolean;
  onToggleReady: () => void;
  onStartMatch: () => void;
}

export default function RoomActionsPanel({
  room,
  hasLeftMember,
  isCurrentReady,
  togglingReady,
  isHost,
  canStart,
  startingMatch,
  onToggleReady,
  onStartMatch,
}: RoomActionsPanelProps) {
  return (
    <>
      <TouchableOpacity
        disabled={togglingReady || !room || room.status === "finished" || hasLeftMember}
        onPress={onToggleReady}
        style={[styles.readyButton, isCurrentReady && styles.readyButtonActive]}
      >
        <Text style={styles.readyButtonText}>
          {togglingReady ? "Updating..." : isCurrentReady ? "Set Not Ready" : "Set Ready"}
        </Text>
      </TouchableOpacity>

      {isHost ? (
        <TouchableOpacity
          disabled={!canStart || startingMatch || room?.status === "finished" || hasLeftMember}
          onPress={onStartMatch}
          style={[styles.startButton, (!canStart || startingMatch) && styles.startButtonDisabled]}
        >
          <Text style={styles.startButtonText}>{startingMatch ? "Starting..." : "Start Match"}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.hint}>Host will start once both users are ready.</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: "#52525b",
    fontSize: 12,
    lineHeight: 18,
  },
  readyButton: {
    marginTop: 8,
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  readyButtonActive: {
    backgroundColor: "#14532d",
    borderColor: "#22c55e",
  },
  readyButtonText: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 14,
  },
  startButton: {
    marginTop: 10,
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  startButtonDisabled: {
    opacity: 0.45,
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
