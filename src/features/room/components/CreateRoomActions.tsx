import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CreateRoomActionsProps {
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  bottomInset: number;
}

export function CreateRoomActions({ loading, error, onSubmit, bottomInset }: CreateRoomActionsProps) {
  return (
    <View 
      className="absolute bottom-0 w-full px-6 pt-4 pb-6 bg-[#0a0a0f]/95 border-t border-[#ffffff0a]"
      style={{ paddingBottom: Math.max(bottomInset, 24) }}
    >
      <TouchableOpacity
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.8}
        className="bg-[#7c3aed] h-14 rounded-full items-center justify-center flex-row shadow-lg shadow-[#7c3aed]/40"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text className="text-white text-[16px] font-bold tracking-wide">
              Generate Room Code
            </Text>
          </>
        )}
      </TouchableOpacity>
      {error ? (
        <Text className="text-[#fca5a5] text-[12px] mt-2 text-center">{error}</Text>
      ) : null}
    </View>
  );
}
