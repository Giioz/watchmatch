import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface CreateRoomFilterFieldProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  onRemove: () => void;
}

export function CreateRoomFilterField({ label, value, icon, onPress, onRemove }: CreateRoomFilterFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View className="mb-6">
      <Text className="text-[10px] uppercase tracking-[1.5px] font-bold mb-2 ml-1" style={{ color: colors.textSubtle }}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.78}
        className="flex-row items-center justify-between px-6 py-5 rounded-2xl border"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View className="flex-row items-center flex-1 pr-4">
          <Ionicons name={icon} size={18} color={colors.primary} style={{ marginRight: 12 }} />
          <Text className="text-[14px] font-semibold" numberOfLines={1} style={{ color: colors.text }}>
            {value}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Ionicons name="chevron-down" size={16} color={colors.textSubtle} />
          <TouchableOpacity 
            onPress={(e) => { e.stopPropagation(); onRemove(); }}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-full border items-center justify-center"
            style={{ backgroundColor: colors.surfaceHighlight, borderColor: colors.border }}
          >
            <Ionicons name="close" size={14} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}
