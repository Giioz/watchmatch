import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

interface ConnectedAccount {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
}

const ACCOUNTS: ConnectedAccount[] = [
  { key: 'letterboxd', label: 'Letterboxd', icon: 'film-outline', url: 'https://letterboxd.com' },
  { key: 'trakt', label: 'Trakt', icon: 'play-circle-outline', url: 'https://trakt.tv' },
];

export default function ProfileSettings() {
  // Local-only preference for now (no backend persistence yet).
  const [notifications, setNotifications] = useState(true);

  const openAccount = (url: string) => {
    WebBrowser.openBrowserAsync(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications-outline" size={18} color="#c4b5fd" />
            </View>
            <Text style={styles.rowLabel}>Match notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#27272a', true: '#7c3aed' }}
            thumbColor="#f4f4f5"
          />
        </View>

        {ACCOUNTS.map((account) => (
          <TouchableOpacity
            key={account.key}
            activeOpacity={0.8}
            onPress={() => openAccount(account.url)}
            style={styles.row}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name={account.icon} size={18} color="#c4b5fd" />
              </View>
              <Text style={styles.rowLabel}>Connect {account.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#52525b" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, marginBottom: 18 },
  sectionTitle: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#111115',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f1f29',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124,58,237,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { color: '#f4f4f5', fontSize: 14, fontWeight: '600' },
});
