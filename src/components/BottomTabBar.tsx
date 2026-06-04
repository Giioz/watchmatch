import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Minimal structural shape of the props React Navigation passes to a custom
 * `tabBar`. Typed locally so we don't depend on @react-navigation/bottom-tabs
 * being a resolvable top-level import.
 */
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

/**
 * Bar height excluding the bottom safe-area inset. Screens should pad their
 * scrollable content by TAB_BAR_HEIGHT + insets.bottom so nothing hides
 * behind the floating blurred bar.
 */
export const TAB_BAR_HEIGHT = 62;

const ACTIVE = '#a78bfa';
const INACTIVE = '#52525b';

type TabMeta = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const TAB_META: Record<string, TabMeta> = {
  index: { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  rooms: { label: 'Rooms', icon: 'film-outline', activeIcon: 'film' },
  matches: { label: 'Matches', icon: 'sparkles-outline', activeIcon: 'sparkles' },
  profile: { label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
};

export default function BottomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={32}
      tint="dark"
      style={[styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <View style={styles.iconWrap}>
                {isFocused && <View style={styles.glowDot} />}
                <Ionicons
                  name={isFocused ? meta.activeIcon : meta.icon}
                  size={23}
                  color={isFocused ? ACTIVE : INACTIVE}
                />
              </View>
              <Text style={[styles.label, { color: isFocused ? ACTIVE : INACTIVE }]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Platform.OS === 'android' ? 'rgba(10,10,18,0.96)' : 'rgba(10,10,18,0.82)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(123,92,240,0.15)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDot: {
    position: 'absolute',
    top: -7,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: ACTIVE,
    shadowColor: ACTIVE,
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
