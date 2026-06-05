import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ContentType } from '../constants/createRoom';

interface CreateRoomContentToggleProps {
  contentType: ContentType;
  onSelect: (type: ContentType) => void;
}

export function CreateRoomContentToggle({ contentType, onSelect }: CreateRoomContentToggleProps) {
  return (
    <View className="flex-row bg-[#13131c] p-1.5 rounded-2xl border border-[#ffffff08] mb-8">
      {(['movie', 'tv'] as const).map(type => {
        const isSelected = contentType === type;
        return (
          <TouchableOpacity
            key={type}
            onPress={() => onSelect(type)}
            activeOpacity={0.78}
            className={`flex-1 py-3.5 items-center justify-center rounded-xl ${isSelected ? 'bg-[#222230] border border-[#ffffff0a]' : 'bg-transparent'}`}
          >
            <Text className={`text-[14px] font-semibold tracking-wide ${isSelected ? 'text-[#c4b5fd]' : 'text-[#71717a]'}`}>
              {type === 'movie' ? 'Movies' : 'TV Shows'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
