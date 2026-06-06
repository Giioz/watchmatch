import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { TMDBMediaItem } from '@/types/movie';
import { useAppTheme } from '@/theme/ThemeContext';
interface MovieFilmStripProps {
  loading: boolean;
  movies: TMDBMediaItem[];
  onSelectMovie: (movie: TMDBMediaItem) => void;
}

export default function MovieFilmStrip({ loading, movies, onSelectMovie }: MovieFilmStripProps) {
  const { colors } = useAppTheme();

  if (loading) {
    return (
      <View style={{ height: 88, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.primary} />
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
              backgroundColor: colors.surface, borderWidth: 1,
              borderColor: isMatch ? colors.primary : colors.surfaceHighlight,
              overflow: 'hidden',
            }}
          >
            <View style={{ width: 60, overflow: 'hidden' }}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/w154${movie.poster_path}` }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </View>

            <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.text }}>{movie.title}</Text>
                {isMatch ? (
                  <View style={{ backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 9, color: colors.primary, fontWeight: '600', letterSpacing: 0.8 }}>✦ MATCH</Text>
                  </View>
                ) : (
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: dotColors[index] ?? colors.textMuted, marginTop: 3 }} />
                )}
              </View>
              <Text numberOfLines={2} style={{ fontSize: 11, color: colors.textMuted, lineHeight: 15, marginTop: 4 }}>{movie.overview}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '500' }}>★ {movie.vote_average.toFixed(1)}</Text>
                <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: colors.textSubtle }} />
                <Text style={{ fontSize: 10, color: colors.textSubtle }}>{(movie.release_date ?? '').slice(0, 4)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
