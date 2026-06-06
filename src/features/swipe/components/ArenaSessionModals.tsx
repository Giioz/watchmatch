import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface ArenaSessionModalsProps {
  isSessionEndedModalVisible: boolean;
  isLeaveConfirmVisible: boolean;
  onCloseSessionEnded: () => void;
  onCancelLeave: () => void;
  onConfirmLeave: () => void;
}

export default function ArenaSessionModals({
  isSessionEndedModalVisible,
  isLeaveConfirmVisible,
  onCloseSessionEnded,
  onCancelLeave,
  onConfirmLeave,
}: ArenaSessionModalsProps) {
  const styles = useAppStyles(createStyles);
  const { colors } = useAppTheme();

  return (
    <>
      <Modal
        visible={isSessionEndedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={onCloseSessionEnded}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Session Ended</Text>
            <Text style={styles.body}>Partner left the match. This room is now closed.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={onCloseSessionEnded}>
              <Text style={styles.primaryButtonText}>Back Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isLeaveConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={onCancelLeave}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Leave Match?</Text>
            <Text style={styles.body}>If you leave now, this session will end for both players.</Text>
            <View style={styles.leaveActionsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancelLeave}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.leaveButton} onPress={onConfirmLeave}>
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.pureWhite,
    fontWeight: "700",
    fontSize: 14,
  },
  leaveActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSubtle,
    fontWeight: "700",
    fontSize: 14,
  },
  leaveButton: {
    flex: 1,
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  leaveButtonText: {
    color: colors.pureWhite,
    fontWeight: "700",
    fontSize: 14,
  },
});
