import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ArenaNoMatchStateProps {
  roundLoading: null | "rerun" | "liked";
  roundError: string | null;
  sharedLikes?: string[];
  onRunAgain: () => void;
  onSecondRoundLiked: () => void;
}

export default function ArenaNoMatchState({
  roundLoading,
  roundError,
  sharedLikes,
  onRunAgain,
  onSecondRoundLiked,
}: ArenaNoMatchStateProps) {
  return (
    <View style={styles.doneContainer}>
      <Text style={{ fontSize: 40 }}>💔</Text>
      <Text style={styles.doneText}>No match this round</Text>
      {sharedLikes && sharedLikes.length > 0 && (
        <View style={styles.consolation}>
          <Text style={styles.consolationLabel}>You both liked</Text>
          <Text style={styles.consolationTitles}>{sharedLikes.join(" · ")}</Text>
        </View>
      )}
      <TouchableOpacity
        onPress={onRunAgain}
        style={styles.refreshButton}
        disabled={roundLoading !== null}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {roundLoading === "rerun" ? "Starting..." : "Run Again (10 New Picks)"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSecondRoundLiked}
        style={styles.secondaryButton}
        disabled={roundLoading !== null}
      >
        <Text style={{ color: "#c4b5fd", fontWeight: "600" }}>
          {roundLoading === "liked" ? "Building..." : "Second Round From Likes"}
        </Text>
      </TouchableOpacity>
      {roundError ? <Text style={styles.errorText}>{roundError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  doneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  doneText: {
    color: "#f4f4f5",
    fontSize: 22,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  errorText: {
    marginTop: 12,
    color: "#fca5a5",
    fontSize: 12,
    textAlign: "center",
  },
  consolation: {
    marginTop: 16,
    alignItems: "center",
    backgroundColor: "#15151c",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  consolationLabel: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  consolationTitles: {
    color: "#c4b5fd",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
