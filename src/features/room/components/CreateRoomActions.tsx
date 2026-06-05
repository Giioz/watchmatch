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
      className="absolute bottom-0 w-full px-6 pt-4 pb-6 bg-[#0a0a0f]/98 border-t border-[#ffffff05]"
      style={{ paddingBottom: Math.max(bottomInset, 24) }}
    >
      <TouchableOpacity
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.8}
        className="bg-[#7c3aed] h-14 rounded-2xl items-center justify-center flex-row border border-[#ffffff10]"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Text className="text-white text-[15px] font-bold tracking-wide mr-2">
              Host Session
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </>
        )}
      </TouchableOpacity>
      {error ? (
        <Text className="text-[#fca5a5] text-[12px] mt-2 text-center">{error}</Text>
      ) : null}
    </View>
  );
}
