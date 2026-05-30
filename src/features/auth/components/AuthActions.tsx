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
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <View style={styles.submitButtonContent}>
            <Ionicons
              name={isSignUp ? 'person-add-outline' : 'log-in-outline'}
              size={18}
              color="rgba(255,255,255,0.9)"
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

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.35)',
  },
  messageBoxSuccess: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.35)',
  },
  messageText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  messageTextError: {
    color: '#fca5a5',
  },
  messageTextSuccess: {
    color: '#86efac',
  },
  submitButton: {
    backgroundColor: '#7c3aed',
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
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  modeToggle: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  modeToggleText: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '400',
  },
  modeToggleHighlight: {
    color: '#a78bfa',
    fontWeight: '600',
  },
});
