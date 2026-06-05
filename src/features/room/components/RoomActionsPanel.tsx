import { Room } from "@/types/database";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    <View style={styles.container}>
      {/* Ready Button */}
      <TouchableOpacity
        disabled={togglingReady || !room || room.status === "finished" || hasLeftMember}
        onPress={onToggleReady}
        activeOpacity={0.8}
        style={[styles.readyButton, isCurrentReady && styles.readyButtonActive]}
      >
        {togglingReady ? (
          <ActivityIndicator size="small" color="#a78bfa" />
        ) : (
          <>
            <Ionicons 
              name={isCurrentReady ? "checkmark-circle-outline" : "ellipse-outline"} 
              size={18} 
              color={isCurrentReady ? "#34d399" : "#71717a"} 
              style={{ marginRight: 8 }} 
            />
            <Text style={[styles.readyButtonText, isCurrentReady && styles.readyButtonTextActive]}>
              {isCurrentReady ? "Ready to Match" : "Mark as Ready"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Start Button (Visible only to Host) */}
      {isHost ? (
        <View style={styles.startSection}>
          <TouchableOpacity
            disabled={!canStart || startingMatch || room?.status === "finished" || hasLeftMember}
            onPress={onStartMatch}
            activeOpacity={0.8}
            style={[styles.startButton, (!canStart || startingMatch) && styles.startButtonDisabled]}
          >
            {startingMatch ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={[styles.startButtonText, (!canStart || startingMatch) && styles.startButtonTextDisabled]}>
                  Start Match Session
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color={canStart ? "#ffffff" : "#52525b"} 
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>
          
          {!canStart && !hasLeftMember && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                Waiting for both participants to mark themselves as Ready.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            The Host will start the session once both players are ready.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  readyButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    backgroundColor: "#13131c",
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  readyButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  readyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#ffffff",
  },
  readyButtonTextActive: {
    color: "#34d399",
  },
  startSection: {
    marginTop: 16,
  },
  startButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    backgroundColor: "#7c3aed",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  startButtonDisabled: {
    backgroundColor: "rgba(24, 24, 34, 0.6)",
    borderColor: "rgba(255, 255, 255, 0.03)",
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#ffffff",
  },
  startButtonTextDisabled: {
    color: "#52525b",
  },
  hintContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  hintText: {
    fontSize: 12,
    color: "#52525b",
    textAlign: "center",
    lineHeight: 18,
  },
});
