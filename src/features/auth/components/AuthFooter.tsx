import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AuthFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.divider} />
      <Text style={styles.footerText}>You Say Sometimes Whaat</Text>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
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
