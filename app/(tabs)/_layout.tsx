import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / 4;
const INDICATOR_WIDTH = 44;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const activeIndex = state.index;
  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);

  const tabBarHeight = 56 + insets.bottom;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2,
      useNativeDriver: true,
      tension: 130,
      friction: 12,
    }).start();
  }, [activeIndex]);

  return (
    <View style={[styles.tabBarContainer, { height: tabBarHeight, paddingBottom: insets.bottom }]}>
      <BlurView tint={isDark ? "dark" : "light"} intensity={85} style={StyleSheet.absoluteFill}>
        <View style={styles.glassOverlay} />
      </BlurView>
      
      {/* Sliding Neon Accent Top Line */}
      <Animated.View
        style={[
          styles.topIndicator,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      />

      <View style={styles.tabBarRow}>
        {state.routes.map((route, index) => {
          if (route.name.startsWith('+') || route.name.includes('[') || route.name === 'rooms') {
            return null;
          }

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

          let iconName: any = 'home-outline';
          let label = 'Home';
          if (route.name === 'index') {
            iconName = isFocused ? 'home' : 'home-outline';
            label = 'Home';
          } else if (route.name === 'stats') {
            iconName = isFocused ? 'analytics' : 'analytics-outline';
            label = 'DNA';
          } else if (route.name === 'matches') {
            iconName = isFocused ? 'heart' : 'heart-outline';
            label = 'Matches';
          } else if (route.name === 'library') {
            iconName = isFocused ? 'library' : 'library-outline';
            label = 'Library';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabItem}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={iconName}
                  size={20}
                  color={isFocused ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.textMuted }]}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="stats" options={{ title: 'DNA' }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
    </Tabs>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isDark ? 'rgba(10, 10, 15, 0.88)' : 'rgba(255, 255, 255, 0.88)',
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDark ? 'rgba(167, 139, 250, 0.01)' : 'rgba(124, 58, 237, 0.01)',
  },
  topIndicator: {
    position: 'absolute',
    top: -1,
    width: INDICATOR_WIDTH,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  tabBarRow: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
