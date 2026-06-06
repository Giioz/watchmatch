import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface RoomTopBarProps {
  onBack: () => void;
}

export default function RoomTopBar({ onBack }: RoomTopBarProps) {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

  return (
    <View style={styles.topBar}>
      <TouchableOpacity 
        onPress={onBack} 
        activeOpacity={0.78} 
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
