import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TMDBMediaItem } from '@/types/movie';

import { useHomeMovies } from '../hooks/useHomeMovies';
import { useHomeAnimations } from '../hooks/useHomeAnimations'; // 🎯 ახალი ჰუკი

import MovieFilmStrip from './MovieFilmStrip';
import HomeActionButtons from './HomeActionButtons';
import HomeMovieBottomSheet from './HomeMovieBottomSheet';

export default function HomeScreenContent() {
  const router = useRouter();
  const { trendingMovies, loadingMovies } = useHomeMovies(3);
  
  const [selectedMovie, setSelectedMovie] = useState<TMDBMediaItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { headerAnim, cardsAnim, actionsAnim, orb1Style, orb2Style } = useHomeAnimations();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      {/* Ambient Orbs */}
      <Animated.View style={[styles.orb1, orb1Style]} pointerEvents="none" />
      <Animated.View style={[styles.orb2, orb2Style]} pointerEvents="none" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1, justifyContent: 'space-between' }}
        >
          
          {/* Header */}
          <Animated.View style={[{ paddingHorizontal: 32, paddingTop: 52 }, { opacity: headerAnim }]}>
            <Text style={styles.topTagline}>Your next watch, decided</Text>
            <Text style={styles.mainTitle}>Watch<Text style={{ color: '#a78bfa', fontWeight: '600' }}>Match</Text></Text>
            <Text style={styles.subTagline}>Swipe. Match. Watch together.</Text>
          </Animated.View>

          {/* Dev Shortcut */}
          <TouchableOpacity onPress={() => router.push('/arena')} style={styles.devBadge}>
            <Text style={{ color: '#71717a', fontSize: 11, letterSpacing: 1 }}>DEV: Arena</Text>
          </TouchableOpacity>

          {/* Film Strip */}
          <Animated.View style={[{ paddingHorizontal: 20, marginTop: 28 }, { opacity: cardsAnim }]}>
            <MovieFilmStrip 
              loading={loadingMovies} 
              movies={trendingMovies} 
              onSelectMovie={(movie) => {
                setSelectedMovie(movie);
                setIsModalVisible(true);
              }}
            />
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={{ opacity: actionsAnim }}>
            <HomeActionButtons 
              onCreateRoom={() => router.push('/create-room')}
              onSignIn={() => router.push('/auth')}
              onJoinRoom={(code) => router.push(`/room/${code}`)}
            />
          </Animated.View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <HomeMovieBottomSheet 
        visible={isModalVisible} 
        movie={selectedMovie} 
        onClose={() => setIsModalVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  orb1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#7c3aed', opacity: 0.15, top: -80, left: -80 },
  orb2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#4f46e5', opacity: 0.12, bottom: 60, right: -50 },
  topTagline: { fontSize: 11, letterSpacing: 3.5, textTransform: 'uppercase', color: '#7c3aed', fontWeight: '500', marginBottom: 14 },
  mainTitle: { fontSize: 52, fontWeight: '300', color: '#f1f0f8', lineHeight: 52, letterSpacing: -1 },
  subTagline: { marginTop: 12, fontSize: 13, color: '#52525b', fontWeight: '300', letterSpacing: 0.4 },
  devBadge: { position: 'absolute', top: 60, right: 24, backgroundColor: '#27272a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, zIndex: 10 },
});
