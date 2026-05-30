import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface RoomTopBarProps {
  onBack: () => void;
}

export default function RoomTopBar({ onBack }: RoomTopBarProps) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onBack} activeOpacity={0.75} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#f1f0f8" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
});
