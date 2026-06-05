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
      backgroundColor="#0b0b0f"
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
    >
      <View className="px-6 pb-6">
        <View className="mb-6 px-1 mt-2">
          <Text className="text-[18px] font-bold text-white tracking-tight">{title}</Text>
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
                    className={`w-[31%] py-3 mb-3 rounded-xl flex-row items-center justify-center border ${isSelected ? 'bg-[#a78bfa]/10 border-[#a78bfa]' : 'bg-[#13131c] border-[#ffffff05]'}`}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color="#c4b5fd" style={{ marginRight: 4 }} />}
                    <Text className={`text-[12px] ${isSelected ? 'font-bold text-[#c4b5fd]' : 'font-medium text-[#8e8e9f]'}`}>
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
                       className={`flex-row justify-between items-center py-4 px-2 ${index !== options.length - 1 ? 'border-b border-[#ffffff05]' : ''}`}
                    >
                       <Text className={`text-[15px] ${isSelected ? 'text-[#c4b5fd] font-bold' : 'text-[#8e8e9f] font-medium'}`}>{option.label}</Text>
                       {isSelected && <Ionicons name="checkmark-sharp" size={18} color="#c4b5fd" />}
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
            className="bg-[#7c3aed] rounded-2xl h-14 mt-4 items-center justify-center border border-[#ffffff10]"
          >
            <Text className="text-white font-bold text-[15px] tracking-wide">
              {actionLabel || `Done (${selectedKeys.length} selected)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </BottomSheet>
  );
}
