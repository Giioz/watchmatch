import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  PanResponder,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  movie: any;
  onClose: () => void;
}

export default function HomeMovieBottomSheet({ visible, movie, onClose }: BottomSheetProps) {
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      Animated.spring(bottomSheetAnim, {
        toValue: 1,
        tension: 45,
        friction: 9,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(bottomSheetAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(panY, { toValue: SCREEN_HEIGHT, duration: 240, useNativeDriver: true })
    ]).start(onClose);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true, tension: 40, friction: 8 }).start();
        }
      },
    })
  ).current;

  const modalTranslateY = Animated.add(
    bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT, 0] }),
    panY
  );

  const backdropOpacity = Animated.multiply(
    bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }),
    panY.interpolate({ inputRange: [0, SCREEN_HEIGHT], outputRange: [1, 0], extrapolate: 'clamp' })
  );

  if (!visible || !movie) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={{ position: 'absolute', inset: 0, backgroundColor: '#000', opacity: backdropOpacity }} />
        </TouchableWithoutFeedback>

        <Animated.View style={{
          backgroundColor: '#0e0e13', borderTopLeftRadius: 24, borderTopRightRadius: 24,
          borderWidth: 1, borderColor: '#1f1f29', maxHeight: SCREEN_HEIGHT * 0.85,
          transform: [{ translateY: modalTranslateY }], overflow: 'hidden',
        }}>
          <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center', paddingVertical: 14, backgroundColor: '#0e0e13' }}>
            <View style={{ width: 44, height: 5, borderRadius: 2.5, backgroundColor: '#2d2d3d' }} />
          </View>

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
                  <Text style={{ fontSize: 11, color: '#4a4a5a' }}>TMDb: {Math.round(movie.popularity)}</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: '#1f1f29', marginVertical: 4 }} />
            <Text style={{ fontSize: 13, color: '#71717a', fontWeight: '500', marginTop: 12 }}>STORYLINE</Text>
            <Text style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 22, marginTop: 6, fontWeight: '300' }}>{movie.overview || "No description available."}</Text>
            
            <TouchableOpacity activeOpacity={0.8} onPress={handleClose} style={{ backgroundColor: '#1c1b26', borderWidth: 1, borderColor: '#2d2d3d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 28 }}>
              <Text style={{ color: '#c4b5fd', fontSize: 14, fontWeight: '600' }}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}