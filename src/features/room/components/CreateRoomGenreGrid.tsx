import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GENRES } from '../constants/createRoom';

interface CreateRoomGenreGridProps {
  selectedGenreIds: number[];
  onToggle: (id: number) => void;
}

export function CreateRoomGenreGrid({ selectedGenreIds, onToggle }: CreateRoomGenreGridProps) {
  return (
    <View style={styles.grid}>
      {GENRES.map((genre) => {
        const selected = selectedGenreIds.includes(genre.id);
        return (
          <TouchableOpacity
            key={genre.id}
            activeOpacity={0.8}
            onPress={() => onToggle(genre.id)}
            style={[styles.badge, selected ? styles.badgeSelected : styles.badgeIdle]}
          >
            {selected && (
              <Ionicons name="checkmark" size={13} color="#fff" style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.label, selected ? styles.labelSelected : styles.labelIdle]}>
              {genre.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeSelected: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  badgeIdle: { backgroundColor: '#15151c', borderColor: '#27272a' },
  label: { fontSize: 13, fontWeight: '600' },
  labelSelected: { color: '#fff' },
  labelIdle: { color: '#d4d4d8' },
});
