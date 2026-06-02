import { BottomSheet } from '@/components/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  return (
    <BottomSheet 
      visible={visible} 
      onClose={onClose} 
      backgroundColor="#12121a"
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
    >
      <View className="px-6 pb-6">
        <View className="mb-6 px-1 mt-2">
          <Text className="text-[20px] font-bold text-white tracking-tight">{title}</Text>
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
                    activeOpacity={0.7}
                    className={`w-[31%] py-3 mb-3 rounded-2xl flex-row items-center justify-center border ${isSelected ? 'bg-[#7c3aed] border-[#7c3aed]' : 'bg-[#18181b] border-[#ffffff15]'}`}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="white" style={{ marginRight: 4 }} />}
                    <Text className={`text-[12px] ${isSelected ? 'font-bold text-white' : 'font-medium text-[#d4d4d8]'}`}>
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
                       activeOpacity={0.7}
                       className={`flex-row justify-between items-center py-4 px-2 ${index !== options.length - 1 ? 'border-b border-[#ffffff0a]' : ''}`}
                    >
                       <Text className={`text-[16px] ${isSelected ? 'text-white font-bold' : 'text-[#9ca3af] font-medium'}`}>{option.label}</Text>
                       {isSelected && <Ionicons name="checkmark" size={22} color="#7c3aed" />}
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
            className="bg-[#7c3aed] rounded-full h-14 mt-4 items-center justify-center shadow-lg shadow-[#7c3aed]/40"
          >
            <Text className="text-white font-bold text-[16px] tracking-wide">
              {actionLabel || `Done (${selectedKeys.length} selected)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </BottomSheet>
  );
}
