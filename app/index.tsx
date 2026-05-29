import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHomeMovies } from '@/hooks/useHomeMovies'; // ქასთომ ჰუკი

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function IndexScreen() {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  
  // მოდალის ლოკალური სტეიტები
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { trendingMovies, loadingMovies } = useHomeMovies(3);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const joinAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  
  // მოდალის ანიმაციის მნიშვნელობა (0 = ქვემოთაა, 1 = ამოწეულია)
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  // თითით დრეგირების (Pan) ანიმაციური მნიშვნელობა
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.spring(actionsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5500, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // PanResponder-ის აწყობა დრეგისთვის
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // აქტიურდება მხოლოდ მაშინ, როცა მოძრაობა ვერტიკალურია და მიმართულია ქვემოთ
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // ნებას ვრთავთ მხოლოდ ქვემოთ ჩამოსრიალებას (პოზიტიური dy)
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // თუ ჩამოვსრიალდით 120px-ზე მეტით ან ჩამოსმის სიჩქარე დიდია (vy > 0.5), ვხურავთ
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeMovieModal();
        } else {
          // წინააღმდეგ შემთხვევაში ბრუნდება საწყის პოზიციაზე ზამბარით
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // მოდალის გახსნის ანიმაცია
  const openMovieModal = (movie: any) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
    panY.setValue(0); // დრეგის სტეიტის განულება
    Animated.timing(bottomSheetAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  // მოდალის დახურვის ანიმაცია
  const closeMovieModal = () => {
    Animated.parallel([
      Animated.timing(bottomSheetAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(panY, {
        toValue: SCREEN_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsModalVisible(false);
      setSelectedMovie(null);
      panY.setValue(0);
    });
  };

  const openJoin = () => {
    setIsJoining(true);
    Animated.spring(joinAnim, { toValue: 1, useNativeDriver: true, tension: 70, friction: 12 }).start();
  };

  const closeJoin = () => {
    Animated.spring(joinAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }).start(() => {
      setIsJoining(false);
      setRoomCode('');
    });
  };

  const handleJoin = () => {
    if (roomCode.length === 4) {
      router.push(`/room/${roomCode.toUpperCase()}`);
    }
  };

  const fadeUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  const orb1Style = {
    transform: [
      { translateX: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) },
      { translateY: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }) },
    ],
  };

  const orb2Style = {
    transform: [
      { translateX: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
      { translateY: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
    ],
  };

  // მოდალის საბოლოო translateY (ითვალისწინებს როგორც გახსნის სტეიტს, ისე დრეგს)
  const modalTranslateY = Animated.add(
    bottomSheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [SCREEN_HEIGHT, 0],
    }),
    panY
  );

  // ფონის ჩამუქება იკლებს დრეგის პარალელურად
  const backdropOpacity = Animated.multiply(
    bottomSheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.6],
    }),
    panY.interpolate({
      inputRange: [0, SCREEN_HEIGHT],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      {/* Ambient orbs */}
      <Animated.View
        style={[{
          position: 'absolute', width: 260, height: 260,
          borderRadius: 130, backgroundColor: '#7c3aed',
          opacity: 0.15, top: -80, left: -80,
        }, orb1Style]}
        pointerEvents="none"
      />
      <Animated.View
        style={[{
          position: 'absolute', width: 180, height: 180,
          borderRadius: 90, backgroundColor: '#4f46e5',
          opacity: 0.12, bottom: 60, right: -50,
        }, orb2Style]}
        pointerEvents="none"
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'space-between' }}
        >
          {/* Header */}
          <Animated.View style={[{ paddingHorizontal: 32, paddingTop: 52 }, fadeUp(headerAnim)]}>
            <Text style={{
              fontSize: 11, letterSpacing: 3.5, textTransform: 'uppercase',
              color: '#7c3aed', fontWeight: '500', marginBottom: 14,
            }}>
              Your next watch, decided
            </Text>
            <Text style={{
              fontSize: 52, fontWeight: '300', color: '#f1f0f8',
              lineHeight: 52, letterSpacing: -1,
            }}>
              Watch<Text style={{ color: '#a78bfa', fontWeight: '600' }}>Match</Text>
            </Text>
            <Text style={{
              marginTop: 12, fontSize: 13, color: '#52525b',
              fontWeight: '300', letterSpacing: 0.4,
            }}>
              Swipe. Match. Watch together.
            </Text>
          </Animated.View>

          <TouchableOpacity
            onPress={() => router.push('/arena')}
            style={{
              position: 'absolute',
              top: 60,
              right: 24,
              backgroundColor: '#27272a',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              zIndex: 10,
            }}
          >
            <Text style={{ color: '#71717a', fontSize: 11, letterSpacing: 1 }}>
              DEV: Arena
            </Text>
          </TouchableOpacity>

          {/* Real Movie Film Strip — Horizontal Banner Cards */}
          <Animated.View style={[{ paddingHorizontal: 20, marginTop: 28, gap: 10 }, fadeUp(cardsAnim)]}>
            {loadingMovies ? (
              <View style={{ height: 88, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#7c3aed" />
              </View>
            ) : (
              trendingMovies.map((movie, index) => {
                const isMatch = index === 1;
                const dotColors = ['#22c55e', null, '#f59e0b'];
                
                return (
                  <TouchableOpacity
                    key={movie.id}
                    activeOpacity={0.85}
                    onPress={() => openMovieModal(movie)}
                    style={{
                      flexDirection: 'row',
                      height: 88,
                      borderRadius: 14,
                      backgroundColor: '#111115',
                      borderWidth: 1,
                      borderColor: isMatch ? 'rgba(124,58,237,0.45)' : '#1f1f27',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Poster column */}
                    <View style={{ width: 60, overflow: 'hidden' }}>
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w154${movie.poster_path}` }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </View>

                    {/* Info column */}
                    <View style={{
                      flex: 1, paddingHorizontal: 12, paddingVertical: 10,
                      justifyContent: 'space-between',
                    }}>
                      {/* Title row */}
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <Text
                          numberOfLines={1}
                          style={{ flex: 1, fontSize: 13, fontWeight: '600', color: '#e4e4e7', letterSpacing: 0.1 }}
                        >
                          {movie.title}
                        </Text>
                        {isMatch ? (
                          <View style={{
                            backgroundColor: 'rgba(124,58,237,0.2)',
                            borderWidth: 1, borderColor: 'rgba(167,139,250,0.5)',
                            borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2,
                          }}>
                            <Text style={{ fontSize: 9, color: '#c4b5fd', fontWeight: '600', letterSpacing: 0.8 }}>
                              ✦ MATCH
                            </Text>
                          </View>
                        ) : (
                          <View style={{
                            width: 7, height: 7, borderRadius: 3.5,
                            backgroundColor: dotColors[index] ?? '#52525b',
                            marginTop: 3,
                          }} />
                        )}
                      </View>

                      {/* Overview */}
                      <Text
                        numberOfLines={2}
                        style={{ fontSize: 11, color: '#52525b', lineHeight: 15, marginTop: 4 }}
                      >
                        {movie.overview}
                      </Text>

                      {/* Rating + Year */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Text style={{ fontSize: 10, color: '#c4b5fd', fontWeight: '500' }}>
                          ★ {movie.vote_average.toFixed(1)}
                        </Text>
                        <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: '#3f3f46' }} />
                        <Text style={{ fontSize: 10, color: '#3f3f46' }}>
                          {(movie.release_date ?? '').slice(0, 4)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Animated.View>

          {/* Actions */}
          <Animated.View style={[{ paddingHorizontal: 32, paddingTop: 28 }, fadeUp(actionsAnim)]}>
            {!isJoining ? (
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push('/create-room')}
                  style={{
                    backgroundColor: '#7c3aed',
                    paddingVertical: 16, borderRadius: 14,
                    alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'row', gap: 8,
                  }}
                >
                  <Ionicons name="enter-outline" size={18} color="rgba(255,255,255,0.8)" />
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500', letterSpacing: 0.2 }}>
                    Create a Room
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={openJoin}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 1, borderColor: '#27272a',
                    paddingVertical: 15, borderRadius: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#a1a1aa', fontSize: 15, fontWeight: '400' }}>
                    Join Existing Room
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/auth' as any)}
                  style={{
                    alignItems: 'center',
                    paddingVertical: 8,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '500', letterSpacing: 0.2 }}>
                    Sign In or Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Animated.View style={{
                gap: 12,
                opacity: joinAnim,
                transform: [{ translateY: joinAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <TextInput
                    value={roomCode}
                    onChangeText={(t) => setRoomCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="CODE"
                    placeholderTextColor="#3f3f46"
                    maxLength={4}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoFocus
                    style={{
                      flex: 1, height: 58,
                      backgroundColor: '#18181b',
                      borderWidth: 1,
                      borderColor: roomCode.length > 0 ? '#7c3aed' : '#3f3f46',
                      color: '#f4f4f5', fontSize: 22, fontWeight: '500',
                      textAlign: 'center', letterSpacing: 10,
                      borderRadius: 14,
                    }}
                  />
                  <TouchableOpacity
                    disabled={roomCode.length !== 4}
                    onPress={handleJoin}
                    activeOpacity={0.8}
                    style={{
                      width: 58, height: 58, borderRadius: 14,
                      backgroundColor: roomCode.length === 4 ? '#7c3aed' : '#27272a',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={22}
                      color={roomCode.length === 4 ? '#fff' : '#52525b'}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={closeJoin} activeOpacity={0.6} style={{ alignItems: 'center', paddingVertical: 4 }}>
                  <Text style={{
                    color: '#52525b', fontSize: 11, fontWeight: '500',
                    letterSpacing: 1.5, textTransform: 'uppercase',
                  }}>
                    Nevermind, go back
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* 🎬 PREMIUM MOVIE DETAILS BOTTOM SHEET MODAL */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeMovieModal}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* ჩამუქებული ფონი დახურვის ფუნქციით */}
          <TouchableWithoutFeedback onPress={closeMovieModal}>
            <Animated.View style={{
              position: 'absolute', inset: 0,
              backgroundColor: '#000', opacity: backdropOpacity
            }} />
          </TouchableWithoutFeedback>

          {/* ასრიალებადი ბარათი */}
          <Animated.View style={{
            backgroundColor: '#0e0e13',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderWidth: 1, borderColor: '#1f1f29',
            maxHeight: SCREEN_HEIGHT * 0.85,
            transform: [{ translateY: modalTranslateY }],
            overflow: 'hidden',
          }}>
            <View 
              {...panResponder.panHandlers}
              style={{ width: '100%', alignItems: 'center', paddingVertical: 14, backgroundColor: '#0e0e13' }}
            >
              <View style={{ width: 44, height: 5, borderRadius: 2.5, backgroundColor: '#2d2d3d' }} />
            </View>

            {selectedMovie && (
              <View style={{ paddingHorizontal: 24, paddingBottom: 44 }}>
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w342${selectedMovie.poster_path}` }}
                    style={{ width: 110, height: 160, borderRadius: 12, backgroundColor: '#18181b' }}
                  />
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: '#f1f0f8', marginBottom: 6 }}>
                        {selectedMovie.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#7c3aed', fontWeight: '600', letterSpacing: 0.5 }}>
                        RELEASE: {(selectedMovie.release_date ?? '').slice(0, 4)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                      <View style={{ backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ fontSize: 13, color: '#f59e0b', fontWeight: '700' }}>
                          ⭐ {selectedMovie.vote_average.toFixed(1)}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: '#4a4a5a' }}>
                        TMDb Popularity: {Math.round(selectedMovie.popularity)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Divider line */}
                <View style={{ height: 1, backgroundColor: '#1f1f29', marginVertical: 4 }} />

                {/* სრული სიუჟეტი (Overview) */}
                <Text style={{ fontSize: 13, color: '#71717a', fontWeight: '500', marginTop: 12, letterSpacing: 0.3 }}>
                  STORYLINE
                </Text>
                <Text style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 22, marginTop: 6, fontWeight: '300' }}>
                  {selectedMovie.overview || "No description available for this title."}
                </Text>

                {/* Quick Action Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={closeMovieModal}
                  style={{
                    backgroundColor: '#1c1b26',
                    borderWidth: 1, borderColor: '#2d2d3d',
                    paddingVertical: 14, borderRadius: 12,
                    alignItems: 'center', marginTop: 28,
                  }}
                >
                  <Text style={{ color: '#c4b5fd', fontSize: 14, fontWeight: '600' }}>
                    Close Details
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}