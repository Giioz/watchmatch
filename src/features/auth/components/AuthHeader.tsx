import React from 'react';
import { Animated, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

interface AuthHeaderProps {
  isSignUp: boolean;
  animatedStyle: StyleProp<ViewStyle>;
}

export default function AuthHeader({ isSignUp, animatedStyle }: AuthHeaderProps) {
  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <Text style={styles.badgeText}>
        {isSignUp ? 'JOIN THE CLUB' : 'WELCOME BACK'}
      </Text>
      <Text style={styles.titleText}>
        {isSignUp ? 'Sign ' : 'Sign '}
        <Text style={styles.titleAccent}>
          {isSignUp ? 'Up' : 'In'}
        </Text>
      </Text>
      <Text style={styles.subtitleText}>
        {isSignUp
          ? 'Create an account to start syncing matches and tracking history.'
          : 'Enter your credentials to continue matching with friends.'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  titleAccent: {
    color: '#a78bfa',
    fontWeight: '600',
  },
  subtitleText: {
    marginTop: 12,
    fontSize: 13,
    color: '#52525b',
    fontWeight: '300',
    letterSpacing: 0.4,
    lineHeight: 18,
  },
});
