import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface SegmentOption {
  key: string;
  label: string;
}

interface CreateRoomSegmentedProps {
  options: SegmentOption[];
  value: string;
  onChange: (key: string) => void;
  /** Allow options to wrap onto multiple rows (for longer option sets). */
  wrap?: boolean;
}

export function CreateRoomSegmented({ options, value, onChange, wrap }: CreateRoomSegmentedProps) {
  return (
    <View style={[styles.container, wrap ? styles.wrap : styles.row]}>
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.85}
            onPress={() => onChange(option.key)}
            style={[
              wrap ? styles.wrapPill : styles.pill,
              selected ? styles.pillSelected : styles.pillIdle,
            ]}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : styles.labelIdle]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', backgroundColor: '#15151c', borderRadius: 16, padding: 5 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wrapPill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillSelected: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  pillIdle: { backgroundColor: 'transparent', borderColor: '#27272a' },
  label: { fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  labelSelected: { color: '#fff' },
  labelIdle: { color: '#9ca3af' },
});
