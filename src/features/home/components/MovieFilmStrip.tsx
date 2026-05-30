import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { TMDBMediaItem } from '@/types/movie';

interface MovieFilmStripProps {
  loading: boolean;
  movies: TMDBMediaItem[];
  onSelectMovie: (movie: TMDBMediaItem) => void;
}

export default function MovieFilmStrip({ loading, movies, onSelectMovie }: MovieFilmStripProps) {
  if (loading) {
    return (
      <View style={{ height: 88, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {movies.map((movie, index) => {
        const isMatch = index === 1;
        const dotColors = ['#22c55e', null, '#f59e0b'];
        
        return (
          <TouchableOpacity
            key={movie.id}
            activeOpacity={0.85}
            onPress={() => onSelectMovie(movie)}
            style={{
              flexDirection: 'row', height: 88, borderRadius: 14,
              backgroundColor: '#111115', borderWidth: 1,
              borderColor: isMatch ? 'rgba(124,58,237,0.45)' : '#1f1f27',
              overflow: 'hidden',
            }}
          >
            <View style={{ width: 60, overflow: 'hidden' }}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/w154${movie.poster_path}` }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </View>

            <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, fontWeight: '600', color: '#e4e4e7' }}>{movie.title}</Text>
                {isMatch ? (
                  <View style={{ backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.5)', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 9, color: '#c4b5fd', fontWeight: '600', letterSpacing: 0.8 }}>✦ MATCH</Text>
                  </View>
                ) : (
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: dotColors[index] ?? '#52525b', marginTop: 3 }} />
                )}
              </View>
              <Text numberOfLines={2} style={{ fontSize: 11, color: '#52525b', lineHeight: 15, marginTop: 4 }}>{movie.overview}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Text style={{ fontSize: 10, color: '#c4b5fd', fontWeight: '500' }}>★ {movie.vote_average.toFixed(1)}</Text>
                <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: '#3f3f46' }} />
                <Text style={{ fontSize: 10, color: '#3f3f46' }}>{(movie.release_date ?? '').slice(0, 4)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
