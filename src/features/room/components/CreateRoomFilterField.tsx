import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CreateRoomFilterFieldProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  onRemove: () => void;
}

export function CreateRoomFilterField({ label, value, icon, onPress, onRemove }: CreateRoomFilterFieldProps) {
  return (
    <View className="mb-6">
      <Text className="text-[10px] text-[#71717a] uppercase tracking-[1.5px] font-bold mb-2 ml-1">
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.78}
        className="flex-row items-center justify-between bg-[#13131c] px-6 py-5 rounded-2xl border border-[#ffffff08]"
      >
        <View className="flex-row items-center flex-1 pr-4">
          <Ionicons name={icon} size={18} color="#a78bfa" style={{ marginRight: 12 }} />
          <Text className="text-[#f1f0f8] text-[14px] font-semibold" numberOfLines={1}>
            {value}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Ionicons name="chevron-down" size={16} color="#71717a" />
          <TouchableOpacity 
            onPress={(e) => { e.stopPropagation(); onRemove(); }}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-full bg-[#181822] border border-[#ffffff0d] items-center justify-center"
          >
            <Ionicons name="close" size={14} color="#fca5a5" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}
