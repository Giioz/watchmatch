import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface ArenaNoMatchStateProps {
  roundLoading: null | "rerun" | "liked";
  roundError: string | null;
  onRunAgain: () => void;
  onSecondRoundLiked: () => void;
}

export default function ArenaNoMatchState({
  roundLoading,
  roundError,
  onRunAgain,
  onSecondRoundLiked,
}: ArenaNoMatchStateProps) {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

  return (
    <View style={styles.doneContainer}>
      <Ionicons name="heart-dislike-outline" size={48} color={colors.danger} style={{ marginBottom: 12 }} />
      <Text style={styles.doneText}>No match this round</Text>
      <TouchableOpacity
        onPress={onRunAgain}
        style={styles.refreshButton}
        disabled={roundLoading !== null}
      >
        <Text style={{ color: colors.pureWhite, fontWeight: "600" }}>
          {roundLoading === "rerun" ? "Starting..." : "Run Again (10 New Picks)"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSecondRoundLiked}
        style={styles.secondaryButton}
        disabled={roundLoading !== null}
      >
        <Text style={{ color: colors.primary, fontWeight: "600" }}>
          {roundLoading === "liked" ? "Building..." : "Second Round From Likes"}
        </Text>
      </TouchableOpacity>
      {roundError ? <Text style={styles.errorText}>{roundError}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
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
  secondaryButton: {
    marginTop: 10,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  errorText: {
    marginTop: 12,
    color: colors.danger,
    fontSize: 12,
    textAlign: "center",
  },
});
