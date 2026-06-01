import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthActions from './AuthActions';
import AuthFooter from './AuthFooter';
import AuthFormFields from './AuthFormFields';
import AuthHeader from './AuthHeader';
import { useAuthAnimations } from '../hooks/useAuthAnimations';
import { useAuthForm } from '../hooks/useAuthForm';

export default function AuthScreenContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const {
    router,
    isSignUp,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    errors,
    statusMessage,
    toggleMode,
    handleAuthSubmit,
  } = useAuthForm();

  const {
    headerAnim,
    formAnim,
    submitAnim,
    confirmHeightAnim,
    confirmOpacityAnim,
    fadeUp,
    orb1Style,
    orb2Style,
  } = useAuthAnimations(isSignUp);

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient glowing background orbs */}
      <Animated.View
        style={[styles.orbPurple, orb1Style]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.orbIndigo, orb2Style]}
        pointerEvents="none"
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Top Bar with back button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#f1f0f8" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <AuthHeader
              isSignUp={isSignUp}
              animatedStyle={fadeUp(headerAnim)}
            />

            <AuthFormFields
              animatedStyle={fadeUp(formAnim)}
              confirmHeightAnim={confirmHeightAnim}
              confirmOpacityAnim={confirmOpacityAnim}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              emailFocused={emailFocused}
              setEmailFocused={setEmailFocused}
              passwordFocused={passwordFocused}
              setPasswordFocused={setPasswordFocused}
              confirmFocused={confirmFocused}
              setConfirmFocused={setConfirmFocused}
              errors={errors}
            />

            <AuthActions
              animatedStyle={fadeUp(submitAnim)}
              errors={errors}
              statusMessage={statusMessage}
              isSignUp={isSignUp}
              loading={loading}
              onSubmit={handleAuthSubmit}
              onToggleMode={toggleMode}
            />
          </View>

          <AuthFooter />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  orbPurple: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#7c3aed',
    opacity: 0.15,
    top: -80,
    left: -80,
  },
  orbIndigo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#4f46e5',
    opacity: 0.12,
    bottom: 60,
    right: -50,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 56,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
