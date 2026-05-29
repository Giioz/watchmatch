import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import SwipeCard, { Movie } from '@/components/swipe/SwipeCard';
import { movieService } from '@/src/services/tmdbApi';

const CARD_STACK_SIZE    = 3;
const PREFETCH_THRESHOLD = 5;

export default function ArenaScreen() {
  const router = useRouter();

  const [movies,      setMovies]      = useState<Movie[]>([]);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likedCount,  setLikedCount]  = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Shared value of the TOP card's X — passed to back cards so they
  // can smoothly scale/rise in sync with the drag
  const topCardX = useSharedValue(0);

  useEffect(() => { loadMovies(1); }, []);

  const loadMovies = async (pageNum: number) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    const data = await movieService.discoverMedia('movie', [], pageNum);
    if (data?.results) {
      setMovies(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
    }
    if (pageNum === 1) setLoading(false);
    else setLoadingMore(false);
  };

  const checkAndPrefetch = useCallback((nextIdx: number, total: number) => {
    if (total - nextIdx <= PREFETCH_THRESHOLD && !loadingMore) {
      const next = page + 1;
      setPage(next);
      loadMovies(next);
    }
  }, [page, loadingMore]);

  const handleSwipeRight = useCallback((movie: Movie) => {
    setLikedCount(p => p + 1);
    setSwipedCount(p => p + 1);
    // reset shared value for next top card
    topCardX.value = 0;
    setCurrentIndex(prev => {
      const next = prev + 1;
      checkAndPrefetch(next, movies.length);
      return next;
    });
  }, [movies.length, checkAndPrefetch, topCardX]);

  const handleSwipeLeft = useCallback((movie: Movie) => {
    setSwipedCount(p => p + 1);
    topCardX.value = 0;
    setCurrentIndex(prev => {
      const next = prev + 1;
      checkAndPrefetch(next, movies.length);
      return next;
    });
  }, [movies.length, checkAndPrefetch, topCardX]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    const top = visibleMovies[0];
    if (!top) return;
    if (direction === 'right') handleSwipeRight(top);
    else handleSwipeLeft(top);
  };

  const visibleMovies = movies.slice(currentIndex, currentIndex + CARD_STACK_SIZE);
  const isDone = !loading && currentIndex >= movies.length && movies.length > 0;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{ color: '#52525b', marginTop: 12, fontSize: 13, letterSpacing: 0.5 }}>
          Loading films…
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>

      {/* Header */}
      <View style={{
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'space-between',
        paddingHorizontal: 24,
        paddingTop:       8,
        paddingBottom:    12,
      }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color="#71717a" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#7c3aed', fontWeight: '500' }}>
            Swiping
          </Text>
          <Text style={{ color: '#3f3f46', fontSize: 11, marginTop: 2 }}>
            {swipedCount} swiped · {likedCount} liked
          </Text>
        </View>

        <View style={{ width: 24 }} />
      </View>

      {/* Card stack */}
      <View style={{ flex: 1, marginHorizontal: 16, marginTop: 4, marginBottom: 108 }}>
        {isDone ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 40 }}>🎬</Text>
            <Text style={{ color: '#f4f4f5', fontSize: 22, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
              You've seen everything
            </Text>
            <Text style={{ color: '#52525b', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
              Liked {likedCount} films.
            </Text>
            {loadingMore && <ActivityIndicator size="small" color="#7c3aed" style={{ marginTop: 20 }} />}
          </View>
        ) : (
          // Render bottom→top so top card is drawn last (on top)
          [...visibleMovies].reverse().map((movie, reversedIdx) => {
            const stackIndex = (visibleMovies.length - 1) - reversedIdx;
            const isTop = stackIndex === 0;
            return (
              <SwipeCard
                key={movie.id}
                movie={movie}
                isTop={isTop}
                index={stackIndex}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                // pass top card's X to every back card
                topCardX={isTop ? undefined : topCardX}
              />
            );
          })
        )}
      </View>

      {/* Bottom buttons */}
      {!isDone && (
        <View style={{
          position:       'absolute',
          bottom:         36,
          left:           0,
          right:          0,
          flexDirection:  'row',
          justifyContent: 'center',
          alignItems:     'center',
          gap:            28,
        }}>
          {/* NOPE */}
          <TouchableOpacity
            onPress={() => handleButtonSwipe('left')}
            activeOpacity={0.8}
            style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: '#18181b',
              borderWidth: 1, borderColor: '#27272a',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={26} color="#f87171" />
          </TouchableOpacity>

          {/* LIKE */}
          <TouchableOpacity
            onPress={() => handleButtonSwipe('right')}
            activeOpacity={0.8}
            style={{
              width: 70, height: 70, borderRadius: 35,
              backgroundColor: '#7c3aed',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#7c3aed',
              shadowOpacity: 0.5,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 6 },
              elevation: 10,
            }}
          >
            <Ionicons name="heart" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Rewind (placeholder) */}
          <TouchableOpacity
            activeOpacity={0.4}
            style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: '#18181b',
              borderWidth: 1, borderColor: '#27272a',
              alignItems: 'center', justifyContent: 'center',
              opacity: 0.35,
            }}
          >
            <Ionicons name="refresh" size={22} color="#71717a" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}