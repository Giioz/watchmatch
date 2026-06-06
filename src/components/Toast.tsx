import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastType = 'success' | 'info' | 'error';

interface ToastConfig {
  message: string;
  type?: ToastType;
  icon?: keyof typeof Ionicons.glyphMap;
  duration?: number;
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

interface ActiveToast extends ToastConfig {
  id: number;
}

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { ...config, id }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.toastContainer, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ActiveToast; onDismiss: () => void }) {
  const { colors } = useAppTheme();
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const duration = toast.duration ?? 2200;

  const typeConfig = {
    success: {
      bg: colors.success,
      icon: (toast.icon ?? 'checkmark-circle') as keyof typeof Ionicons.glyphMap,
    },
    info: {
      bg: colors.primary,
      icon: (toast.icon ?? 'information-circle') as keyof typeof Ionicons.glyphMap,
    },
    error: {
      bg: colors.danger,
      icon: (toast.icon ?? 'alert-circle') as keyof typeof Ionicons.glyphMap,
    },
  };

  const config = typeConfig[toast.type ?? 'success'];

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 160,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

      const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, duration);

    return () => clearTimeout(timer);
  }, [translateY, opacity, duration]); // Removed onDismiss from dependencies to prevent timer reset

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          backgroundColor: config.bg,
          transform: [{ translateY }],
          opacity,
          marginBottom: 8,
        },
      ]}
    >
      <Ionicons name={config.icon} size={18} color="#fff" style={{ marginRight: 10 }} />
      <Text style={styles.toastText} numberOfLines={2}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 24,
    width: SCREEN_WIDTH - 48,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.2,
  },
});
