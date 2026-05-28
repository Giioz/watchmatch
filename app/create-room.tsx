import React from 'react';
import { View } from 'react-native';

/**
 * Stateful form for configuring match criteria.
 * Maps to RoomFilter data contract.
 */
export default function CreateRoomScreen() {
  return (
    <View className="flex-1 bg-background">
      {/* 
        Boundaries for:
        - Genre selection (TMDB IDs)
        - Session limits (Slider/Input)
        - Submit Action -> /room/[code]
      */}
    </View>
  );
}
