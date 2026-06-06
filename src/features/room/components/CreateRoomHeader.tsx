import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface CreateRoomHeaderProps {
  onBack: () => void;
}

export function CreateRoomHeader({ onBack }: CreateRoomHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View className="px-6 pt-6 pb-6">
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.78}
        className="w-10 h-10 rounded-full border justify-center items-center mb-8"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <Text className="text-[10px] tracking-[2px] uppercase font-bold mb-2" style={{ color: colors.primary }}>
        MATCH SETUP
      </Text>
      <Text className="text-[32px] font-bold leading-[38px] tracking-tight" style={{ color: colors.text }}>
        Host a Session
      </Text>
      <Text className="mt-2 text-[14px] font-normal leading-[20px]" style={{ color: colors.textMuted }}>
        Define your co-watching filters. Once created, you can invite your partner to join and match in seconds.
      </Text>
    </View>
  );
}
