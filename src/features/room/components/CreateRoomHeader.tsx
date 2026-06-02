import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CreateRoomHeaderProps {
  onBack: () => void;
}

export function CreateRoomHeader({ onBack }: CreateRoomHeaderProps) {
  return (
    <View className="px-6 pt-4 pb-6">
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-full bg-[#18181b] border border-[#ffffff15] justify-center items-center mb-6"
      >
        <Ionicons name="chevron-back" size={24} color="#f1f0f8" />
      </TouchableOpacity>

      <Text className="text-[11px] tracking-[3px] uppercase text-[#7c3aed] font-bold mb-2">
        NEW SESSION
      </Text>
      <Text className="text-[40px] font-light text-[#f1f0f8] leading-[48px] tracking-tight">
        Create a <Text className="text-[#7c3aed] font-semibold">Room</Text>
      </Text>
      <Text className="mt-2 text-[14px] text-[#9ca3af] font-light tracking-wide">
        Set your preferences below
      </Text>
    </View>
  );
}
