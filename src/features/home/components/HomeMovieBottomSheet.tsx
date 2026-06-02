import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { TMDBMediaItem } from '@/types/movie';
import { BottomSheet } from '@/components/BottomSheet';

interface BottomSheetProps {
  visible: boolean;
  movie: TMDBMediaItem | null;
  onClose: () => void;
}

export default function HomeMovieBottomSheet({ visible, movie, onClose }: BottomSheetProps) {
  if (!movie) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: 24, paddingBottom: 44 }}>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
          <Image source={{ uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}` }} style={{ width: 110, height: 160, borderRadius: 12, backgroundColor: '#18181b' }} />
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#f1f0f8', marginBottom: 6 }}>{movie.title}</Text>
              <Text style={{ fontSize: 12, color: '#7c3aed', fontWeight: '600', letterSpacing: 0.5 }}>RELEASE: {(movie.release_date ?? '').slice(0, 4)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 13, color: '#f59e0b', fontWeight: '700' }}>⭐ {movie.vote_average.toFixed(1)}</Text>
              </View>
              <Text style={{ fontSize: 11, color: '#4a4a5a' }}>TMDb: {Math.round(movie.popularity ?? 0)}</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: '#1f1f29', marginVertical: 4 }} />
        <Text style={{ fontSize: 13, color: '#71717a', fontWeight: '500', marginTop: 12 }}>STORYLINE</Text>
        <Text style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 22, marginTop: 6, fontWeight: '300' }}>{movie.overview || "No description available."}</Text>
        
        <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={{ backgroundColor: '#1c1b26', borderWidth: 1, borderColor: '#2d2d3d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 28 }}>
          <Text style={{ color: '#c4b5fd', fontSize: 14, fontWeight: '600' }}>Close Details</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

