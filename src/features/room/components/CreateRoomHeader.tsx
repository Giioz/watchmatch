import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CreateRoomHeaderProps {
  onBack: () => void;
}

export function CreateRoomHeader({ onBack }: CreateRoomHeaderProps) {
  return (
    <View className="px-6 pt-6 pb-6">
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.78}
        className="w-10 h-10 rounded-full bg-[#13131c] border border-[#ffffff0a] justify-center items-center mb-8"
      >
        <Ionicons name="chevron-back" size={20} color="#f1f0f8" />
      </TouchableOpacity>

      <Text className="text-[10px] tracking-[2px] uppercase text-[#a78bfa] font-bold mb-2">
        MATCH SETUP
      </Text>
      <Text className="text-[32px] font-bold text-[#ffffff] leading-[38px] tracking-tight">
        Host a Session
      </Text>
      <Text className="mt-2 text-[14px] text-[#94a3b8] font-normal leading-[20px]">
        Define your co-watching filters. Once created, you can invite your partner to join and match in seconds.
      </Text>
    </View>
  );
}
