import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CreateRoomFilterFieldProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function CreateRoomFilterField({ label, value, icon, onPress }: CreateRoomFilterFieldProps) {
  return (
    <View className="mb-5">
      <Text className="text-[11px] text-[#9ca3af] uppercase tracking-widest mb-3 font-semibold ml-1">
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center justify-between bg-[#12121a] p-4 rounded-2xl border border-[#ffffff15] border-l-[3px] border-l-[#7c3aed]"
      >
        <View className="flex-row items-center flex-1 pr-4">
          <Ionicons name={icon} size={18} color="#9ca3af" style={{ marginRight: 12 }} />
          <Text className="text-[#f1f0f8] text-[15px] font-medium" numberOfLines={1}>
            {value}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
}
