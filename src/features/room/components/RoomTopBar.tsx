import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface RoomTopBarProps {
  onBack: () => void;
}

export default function RoomTopBar({ onBack }: RoomTopBarProps) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity 
        onPress={onBack} 
        activeOpacity={0.78} 
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={20} color="#f1f0f8" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#13131c",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
});
