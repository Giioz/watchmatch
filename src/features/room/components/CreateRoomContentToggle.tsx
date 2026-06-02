import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ContentType } from '../constants/createRoom';

interface CreateRoomContentToggleProps {
  contentType: ContentType;
  onSelect: (type: ContentType) => void;
}

export function CreateRoomContentToggle({ contentType, onSelect }: CreateRoomContentToggleProps) {
  return (
    <View className="flex-row bg-[#18181b] p-1.5 rounded-2xl border border-[#ffffff15] mb-8">
      {(['movie', 'tv'] as const).map(type => {
        const isSelected = contentType === type;
        return (
          <TouchableOpacity
            key={type}
            onPress={() => onSelect(type)}
            activeOpacity={0.8}
            className={`flex-1 py-3.5 items-center justify-center rounded-xl ${isSelected ? 'bg-[#7c3aed]' : 'bg-transparent'}`}
          >
            <Text className={`text-[15px] font-semibold tracking-wide ${isSelected ? 'text-white' : 'text-[#9ca3af]'}`}>
              {type === 'movie' ? 'Movies' : 'TV Shows'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
