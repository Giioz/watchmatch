import { BottomSheet } from '@/components/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface CreateRoomBottomSheetProps {
  visible: boolean;
  title: string;
  options: { key: string | number; label: string }[];
  selectedKeys: (string | number)[];
  multiSelect?: boolean;
  onSelect: (key: string | number) => void;
  onClose: () => void;
  actionLabel?: string;
}

export function CreateRoomBottomSheet({
  visible,
  title,
  options,
  selectedKeys,
  multiSelect = false,
  onSelect,
  onClose,
  actionLabel,
}: CreateRoomBottomSheetProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <BottomSheet 
      visible={visible} 
      onClose={onClose} 
      backgroundColor={colors.surfaceElevated}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
    >
      <View className="px-6 pb-6">
        <View className="mb-6 px-1 mt-2">
          <Text className="text-[18px] font-bold tracking-tight" style={{ color: colors.text }}>{title}</Text>
        </View>
        
        <ScrollView className="max-h-[55vh]" showsVerticalScrollIndicator={false}>
          {multiSelect ? (
            <View className="flex-row flex-wrap justify-between">
              {options.map(option => {
                const isSelected = selectedKeys.includes(option.key);
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => onSelect(option.key)}
                    activeOpacity={0.78}
                    className="w-[31%] py-3 mb-3 rounded-xl flex-row items-center justify-center border"
                    style={{ 
                      backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                      borderColor: isSelected ? colors.primaryHover : colors.border
                    }}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color={colors.primary} style={{ marginRight: 4 }} />}
                    <Text className="text-[12px]" style={{
                      fontWeight: isSelected ? 'bold' : '500',
                      color: isSelected ? colors.primary : colors.textMuted
                    }}>
                       {option.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          ) : (
            <View>
              {options.map((option, index) => {
                 const isSelected = selectedKeys.includes(option.key);
                 return (
                     <TouchableOpacity
                       key={option.key}
                       onPress={() => { onSelect(option.key); onClose(); }}
                       activeOpacity={0.78}
                       className="flex-row justify-between items-center py-4 px-2"
                       style={{ borderBottomWidth: index !== options.length - 1 ? 1 : 0, borderBottomColor: colors.border }}
                    >
                       <Text className="text-[15px]" style={{
                         fontWeight: isSelected ? 'bold' : '500',
                         color: isSelected ? colors.primary : colors.textMuted
                       }}>{option.label}</Text>
                       {isSelected && <Ionicons name="checkmark-sharp" size={18} color={colors.primary} />}
                    </TouchableOpacity>
                 )
              })}
            </View>
          )}
        </ScrollView>

        {multiSelect && (
          <TouchableOpacity 
            onPress={onClose}
            activeOpacity={0.8}
            className="rounded-2xl h-14 mt-4 items-center justify-center border"
            style={{ backgroundColor: colors.primary, borderColor: colors.border }}
          >
            <Text className="font-bold text-[15px] tracking-wide" style={{ color: colors.pureWhite }}>
              {actionLabel || `Done (${selectedKeys.length} selected)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </BottomSheet>
  );
}
