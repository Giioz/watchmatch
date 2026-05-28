import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const submitAnim = useRef(new Animated.Value(0)).current;
  
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  // Confirm password expand/collapse animation
  const confirmHeightAnim = useRef(new Animated.Value(0)).current;
  const confirmOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered enter transitions
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(formAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(submitAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
    ]).start();

    // Ambient orb animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5500, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Animate confirm password field in/out
  useEffect(() => {
    if (isSignUp) {
      // Expanding: grow height first, then fade in
      Animated.sequence([
        Animated.timing(confirmHeightAnim, {
          toValue: 80,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(confirmOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Collapsing: fade out first, then shrink height
      Animated.sequence([
        Animated.timing(confirmOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(confirmHeightAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isSignUp]);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    // Email Validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password Validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password Validation
    if (isSignUp) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = () => {
    if (!validate()) return;
    
    setLoading(true);
    // Simulate API authorization network call
    setTimeout(() => {
      setLoading(false);
      // Navigate back to index upon successful authentication
      router.replace('/');
    }, 1500);
  };

  const fadeUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  const orb1Style = {
    transform: [
      { translateX: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) },
      { translateY: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }) },
    ],
  };

  const orb2Style = {
    transform: [
      { translateX: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
      { translateY: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
    ],
  };

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
            {/* Header Title Section */}
            <Animated.View style={[styles.header, fadeUp(headerAnim)]}>
              <Text style={styles.badgeText}>
                {isSignUp ? 'JOIN THE CLUB' : 'WELCOME BACK'}
              </Text>
              <Text style={styles.titleText}>
                {isSignUp ? 'Sign ' : 'Sign '}
                <Text style={{ color: '#a78bfa', fontWeight: '600' }}>
                  {isSignUp ? 'Up' : 'In'}
                </Text>
              </Text>
              <Text style={styles.subtitleText}>
                {isSignUp 
                  ? 'Create an account to start syncing matches and tracking history.' 
                  : 'Enter your credentials to continue matching with friends.'}
              </Text>
            </Animated.View>

            {/* Input Form Fields */}
            <Animated.View style={[styles.formContainer, fadeUp(formAnim)]}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused,
                  errors.email && styles.inputWrapperError
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={errors.email ? '#ef4444' : (emailFocused ? '#a78bfa' : '#52525b')} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email Address"
                    placeholderTextColor="#3f3f46"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    style={styles.textInput}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused,
                  errors.password && styles.inputWrapperError
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={errors.password ? '#ef4444' : (passwordFocused ? '#a78bfa' : '#52525b')} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#3f3f46"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={styles.textInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#52525b" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password (Animated expand/collapse) */}
              <Animated.View style={{
                height: confirmHeightAnim,
                opacity: confirmOpacityAnim,
                overflow: 'hidden',
              }}>
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputWrapper,
                    confirmFocused && styles.inputWrapperFocused,
                    errors.confirmPassword && styles.inputWrapperError
                  ]}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color={errors.confirmPassword ? '#ef4444' : (confirmFocused ? '#a78bfa' : '#52525b')} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm Password"
                      placeholderTextColor="#3f3f46"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setConfirmFocused(true)}
                      onBlur={() => setConfirmFocused(false)}
                      style={styles.textInput}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                      style={styles.eyeButton}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#52525b" 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>
              </Animated.View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View style={[styles.actionsContainer, fadeUp(submitAnim)]}>
              <TouchableOpacity
                onPress={handleAuthSubmit}
                activeOpacity={0.8}
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <View style={styles.submitButtonContent}>
                    <Ionicons name={isSignUp ? "person-add-outline" : "log-in-outline"} size={18} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.submitButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Mode Toggle Link */}
              <TouchableOpacity 
                onPress={toggleMode} 
                activeOpacity={0.6} 
                style={styles.modeToggle}
              >
                <Text style={styles.modeToggleText}>
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <Text style={styles.modeToggleHighlight}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Decorative Divider Footer */}
          <View style={styles.footer}>
            <View style={styles.divider} />
            <Text style={styles.footerText}>Secure authentication</Text>
            <View style={styles.divider} />
          </View>
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
  header: {
    marginBottom: 32,
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color: '#7c3aed',
    fontWeight: '500',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#f1f0f8',
    lineHeight: 52,
    letterSpacing: -1,
  },
  subtitleText: {
    marginTop: 12,
    fontSize: 13,
    color: '#52525b',
    fontWeight: '300',
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#7c3aed',
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '400',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: 0,
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 5,
    marginLeft: 4,
  },
  actionsContainer: {
    gap: 16,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 28,
    paddingTop: 20,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#1c1c22',
  },
  footerText: {
    fontSize: 10,
    color: '#3f3f46',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
