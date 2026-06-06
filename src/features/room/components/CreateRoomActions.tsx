import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface CreateRoomActionsProps {
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  bottomInset: number;
}

export function CreateRoomActions({ loading, error, onSubmit, bottomInset }: CreateRoomActionsProps) {
  const { colors } = useAppTheme();

  return (
    <View 
      className="absolute bottom-0 w-full px-6 pt-4 pb-6 border-t"
      style={{ paddingBottom: Math.max(bottomInset, 24), backgroundColor: colors.background, borderColor: colors.border }}
    >
      <TouchableOpacity
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.8}
        className="h-14 rounded-2xl items-center justify-center flex-row border"
        style={{ backgroundColor: colors.primary, borderColor: colors.border }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.pureWhite} />
        ) : (
          <>
            <Text className="text-[15px] font-bold tracking-wide mr-2" style={{ color: colors.pureWhite }}>
              Host Session
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.pureWhite} />
          </>
        )}
      </TouchableOpacity>
      {error ? (
        <Text className="text-[12px] mt-2 text-center" style={{ color: colors.danger }}>{error}</Text>
      ) : null}
    </View>
  );
}
