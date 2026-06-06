import { Room } from "@/types/database";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

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
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

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
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Ionicons 
              name={isCurrentReady ? "checkmark-circle-outline" : "ellipse-outline"} 
              size={18} 
              color={isCurrentReady ? colors.success : colors.textSubtle} 
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
              <ActivityIndicator size="small" color={colors.pureWhite} />
            ) : (
              <>
                <Text style={[styles.startButtonText, (!canStart || startingMatch) && styles.startButtonTextDisabled]}>
                  Start Match Session
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color={canStart ? colors.pureWhite : colors.textMuted} 
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

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  readyButtonActive: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  readyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.text,
  },
  readyButtonTextActive: {
    color: colors.success,
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
    backgroundColor: colors.primary,
    borderColor: colors.border,
  },
  startButtonDisabled: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.border,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.pureWhite,
  },
  startButtonTextDisabled: {
    color: colors.textMuted,
  },
  hintContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  hintText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
