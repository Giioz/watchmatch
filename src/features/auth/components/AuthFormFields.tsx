import { Ionicons } from '@expo/vector-icons';
import React, { Dispatch, SetStateAction } from 'react';
import {
  Animated,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { AuthErrors } from '../hooks/useAuthForm';

interface AuthFormFieldsProps {
  animatedStyle: StyleProp<ViewStyle>;
  confirmHeightAnim: Animated.Value;
  confirmOpacityAnim: Animated.Value;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: Dispatch<SetStateAction<boolean>>;
  emailFocused: boolean;
  setEmailFocused: Dispatch<SetStateAction<boolean>>;
  passwordFocused: boolean;
  setPasswordFocused: Dispatch<SetStateAction<boolean>>;
  confirmFocused: boolean;
  setConfirmFocused: Dispatch<SetStateAction<boolean>>;
  errors: AuthErrors;
}

export default function AuthFormFields({
  animatedStyle,
  confirmHeightAnim,
  confirmOpacityAnim,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  emailFocused,
  setEmailFocused,
  passwordFocused,
  setPasswordFocused,
  confirmFocused,
  setConfirmFocused,
  errors,
}: AuthFormFieldsProps) {
  return (
    <Animated.View style={[styles.formContainer, animatedStyle]}>
      <View style={styles.inputGroup}>
        <View style={[
          styles.inputWrapper,
          emailFocused && styles.inputWrapperFocused,
          errors.email && styles.inputWrapperError,
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

      <View style={styles.inputGroup}>
        <View style={[
          styles.inputWrapper,
          passwordFocused && styles.inputWrapperFocused,
          errors.password && styles.inputWrapperError,
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
            onPress={() => setShowPassword((current) => !current)}
            activeOpacity={0.7}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#52525b"
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      <Animated.View style={{
        height: confirmHeightAnim,
        opacity: confirmOpacityAnim,
        overflow: 'hidden',
      }}>
        <View style={styles.inputGroup}>
          <View style={[
            styles.inputWrapper,
            confirmFocused && styles.inputWrapperFocused,
            errors.confirmPassword && styles.inputWrapperError,
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
              onPress={() => setShowConfirmPassword((current) => !current)}
              activeOpacity={0.7}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
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
  );
}

const styles = StyleSheet.create({
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
});
