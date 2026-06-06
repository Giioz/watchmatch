import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ContentType } from '../constants/createRoom';
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface CreateRoomContentToggleProps {
  contentType: ContentType;
  onSelect: (type: ContentType) => void;
}

export function CreateRoomContentToggle({ contentType, onSelect }: CreateRoomContentToggleProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row p-1.5 rounded-2xl border mb-8" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      {(['movie', 'tv'] as const).map(type => {
        const isSelected = contentType === type;
        return (
          <TouchableOpacity
            key={type}
            onPress={() => onSelect(type)}
            activeOpacity={0.78}
            className="flex-1 py-3.5 items-center justify-center rounded-xl border"
            style={{ 
              backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
              borderColor: isSelected ? colors.border : 'transparent'
            }}
          >
            <Text className="text-[14px] font-semibold tracking-wide" style={{ color: isSelected ? colors.primary : colors.textMuted }}>
              {type === 'movie' ? 'Movies' : 'TV Shows'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
