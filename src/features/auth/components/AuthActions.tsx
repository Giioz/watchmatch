import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { AuthErrors } from '../hooks/useAuthForm';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface AuthActionsProps {
  animatedStyle: StyleProp<ViewStyle>;
  errors: AuthErrors;
  statusMessage: string | null;
  isSignUp: boolean;
  loading: boolean;
  onSubmit: () => void;
  onToggleMode: () => void;
}

export default function AuthActions({
  animatedStyle,
  errors,
  statusMessage,
  isSignUp,
  loading,
  onSubmit,
  onToggleMode,
}: AuthActionsProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <Animated.View style={[styles.actionsContainer, animatedStyle]}>
      {(errors.form || statusMessage) && (
        <View style={[
          styles.messageBox,
          errors.form ? styles.messageBoxError : styles.messageBoxSuccess,
        ]}>
          <Text style={[
            styles.messageText,
            errors.form ? styles.messageTextError : styles.messageTextSuccess,
          ]}>
            {errors.form ?? statusMessage}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onSubmit}
        activeOpacity={0.8}
        disabled={loading}
        style={styles.submitButton}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.pureWhite} />
        ) : (
          <View style={styles.submitButtonContent}>
            <Ionicons
              name={isSignUp ? 'person-add-outline' : 'log-in-outline'}
              size={18}
              color={colors.pureWhite}
            />
            <Text style={styles.submitButtonText}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleMode}
        activeOpacity={0.6}
        style={styles.modeToggle}
      >
        <Text style={styles.modeToggleText}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <Text style={styles.modeToggleHighlight}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  actionsContainer: {
    gap: 16,
  },
  messageBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  messageBoxError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  messageBoxSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  messageTextError: {
    color: colors.danger,
  },
  messageTextSuccess: {
    color: colors.success,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: colors.pureWhite,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  modeToggle: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  modeToggleText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
  },
  modeToggleHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});
