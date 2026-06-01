import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { roomService } from '@/services/roomService';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 9648, name: 'Mystery' },
  { id: 99, name: 'Documentary' },
  { id: 14, name: 'Fantasy' },
  { id: 80, name: 'Crime' },
];

const IMDB_RATINGS = ['Any rating', '6.0+', '7.0+', '7.5+', '8.0+', '9.0+'];
const AGE_RATINGS = ['Any', 'G', 'PG', 'PG-13', 'R', '18+'];

export default function CreateRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthSession();

  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [imdbRating, setImdbRating] = useState<string>('Any rating');
  const [ageRating, setAgeRating] = useState<string>('Any');

  const [showGenresModal, setShowGenresModal] = useState(false);
  const [showImdbModal, setShowImdbModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedGenreNames = selectedGenreIds.length > 0
    ? selectedGenreIds.map(id => GENRES.find(g => g.id === id)?.name).join(', ')
    : 'Any genre';

  const toggleGenre = (id: number) => {
    setSelectedGenreIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleCreateRoom = async () => {
    if (!user || creatingRoom) {
      if (!user) router.push('/auth');
      return;
    }

    try {
      setCreatingRoom(true);
      setError(null);
      const { room } = await roomService.createRoomFromFilters({
        hostId: user.id,
        contentType,
        genreIds: selectedGenreIds,
        sessionLimit: 10,
      });
      router.replace(`/room/${room.code}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create room.');
    } finally {
      setCreatingRoom(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#0a0a0f]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-[#18181b] border border-[#ffffff15] justify-center items-center mb-6"
          >
            <Ionicons name="chevron-back" size={24} color="#f1f0f8" />
          </TouchableOpacity>

          <Text className="text-[11px] tracking-[3px] uppercase text-[#7c3aed] font-bold mb-2">
            NEW SESSION
          </Text>
          <Text className="text-[40px] font-light text-[#f1f0f8] leading-[48px] tracking-tight">
            Create a <Text className="text-[#7c3aed] font-semibold">Room</Text>
          </Text>
          <Text className="mt-2 text-[14px] text-[#9ca3af] font-light tracking-wide">
            Set your preferences below
          </Text>
        </View>

        <View className="px-6">
          {/* Content Type Toggle */}
          <View className="flex-row bg-[#18181b] p-1.5 rounded-2xl border border-[#ffffff15] mb-8">
            {(['movie', 'tv'] as const).map(type => {
              const isSelected = contentType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setContentType(type)}
                  activeOpacity={0.8}
                  className={`flex-1 py-3.5 items-center justify-center rounded-xl ${isSelected ? 'bg-[#7c3aed]' : 'bg-transparent'}`}
                >
                  <Text className={`text-[15px] font-semibold tracking-wide ${isSelected ? 'text-white' : 'text-[#9ca3af]'}`}>
                    {type === 'movie' ? 'Movies' : 'TV Shows'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Genres Dropdown */}
          <View className="mb-5">
            <Text className="text-[11px] text-[#9ca3af] uppercase tracking-widest mb-3 font-semibold ml-1">
              GENRES
            </Text>
            <TouchableOpacity
              onPress={() => setShowGenresModal(true)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between bg-[#12121a] p-4 rounded-2xl border border-[#ffffff15] border-l-[3px] border-l-[#7c3aed]"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <Ionicons name="film-outline" size={18} color="#9ca3af" style={{ marginRight: 12 }} />
                <Text className="text-[#f1f0f8] text-[15px] font-medium" numberOfLines={1}>
                  {selectedGenreNames}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* IMDb Rating Dropdown */}
          <View className="mb-5">
            <Text className="text-[11px] text-[#9ca3af] uppercase tracking-widest mb-3 font-semibold ml-1">
              IMDB RATING
            </Text>
            <TouchableOpacity
              onPress={() => setShowImdbModal(true)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between bg-[#12121a] p-4 rounded-2xl border border-[#ffffff15] border-l-[3px] border-l-[#7c3aed]"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <Ionicons name="star-outline" size={18} color="#9ca3af" style={{ marginRight: 12 }} />
                <Text className="text-[#f1f0f8] text-[15px] font-medium">
                  {imdbRating}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Age Rating Dropdown */}
          <View className="mb-5">
            <Text className="text-[11px] text-[#9ca3af] uppercase tracking-widest mb-3 font-semibold ml-1">
              AGE RATING
            </Text>
            <TouchableOpacity
              onPress={() => setShowAgeModal(true)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between bg-[#12121a] p-4 rounded-2xl border border-[#ffffff15] border-l-[3px] border-l-[#7c3aed]"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <Ionicons name="shield-outline" size={18} color="#9ca3af" style={{ marginRight: 12 }} />
                <Text className="text-[#f1f0f8] text-[15px] font-medium">
                  {ageRating}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Generate Button */}
      <View 
        className="absolute bottom-0 w-full px-6 pt-4 pb-6 bg-[#0a0a0f]/95 border-t border-[#ffffff0a]"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity
          onPress={handleCreateRoom}
          disabled={creatingRoom}
          activeOpacity={0.8}
          className="bg-[#7c3aed] h-14 rounded-full items-center justify-center flex-row shadow-lg shadow-[#7c3aed]/40"
        >
          {creatingRoom ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text className="text-white text-[16px] font-bold tracking-wide">
                Generate Room Code
              </Text>
            </>
          )}
        </TouchableOpacity>
        {error ? (
          <Text className="text-[#fca5a5] text-[12px] mt-2 text-center">{error}</Text>
        ) : null}
      </View>

      {/* Genres Modal */}
      <Modal visible={showGenresModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-[#000000CC]">
          <View 
            className="bg-[#12121a] rounded-t-[24px] p-6"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            <View className="flex-row justify-between items-center mb-6 px-1">
              <Text className="text-[20px] font-bold text-white tracking-tight">Select Genres</Text>
              <TouchableOpacity onPress={() => setShowGenresModal(false)} className="w-8 h-8 rounded-full bg-[#ffffff10] items-center justify-center">
                 <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-[55vh]" showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                {GENRES.map(genre => {
                  const isSelected = selectedGenreIds.includes(genre.id);
                  return (
                    <TouchableOpacity
                      key={genre.id}
                      onPress={() => toggleGenre(genre.id)}
                      activeOpacity={0.7}
                      className={`w-[31%] py-3 mb-3 rounded-2xl flex-row items-center justify-center border ${isSelected ? 'bg-[#7c3aed] border-[#7c3aed]' : 'bg-[#18181b] border-[#ffffff15]'}`}
                    >
                      {isSelected && <Ionicons name="checkmark" size={14} color="white" style={{ marginRight: 4 }} />}
                      <Text className={`text-[12px] ${isSelected ? 'font-bold text-white' : 'font-medium text-[#d4d4d8]'}`}>
                         {genre.name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>

            <TouchableOpacity 
              onPress={() => setShowGenresModal(false)}
              activeOpacity={0.8}
              className="bg-[#7c3aed] rounded-full h-14 mt-4 items-center justify-center shadow-lg shadow-[#7c3aed]/40"
            >
              <Text className="text-white font-bold text-[16px] tracking-wide">
                Done ({selectedGenreIds.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* IMDb Modal */}
      <Modal visible={showImdbModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-[#000000CC]">
          <View className="bg-[#12121a] rounded-t-[24px] p-6" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
             <View className="flex-row justify-between items-center mb-6 px-1">
              <Text className="text-[20px] font-bold text-white tracking-tight">Select IMDb Rating</Text>
              <TouchableOpacity onPress={() => setShowImdbModal(false)} className="w-8 h-8 rounded-full bg-[#ffffff10] items-center justify-center">
                 <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {IMDB_RATINGS.map((rating, index) => {
               const isSelected = imdbRating === rating;
               return (
                  <TouchableOpacity
                     key={rating}
                     onPress={() => { setImdbRating(rating); setShowImdbModal(false); }}
                     activeOpacity={0.7}
                     className={`flex-row justify-between items-center py-4 px-2 ${index !== IMDB_RATINGS.length - 1 ? 'border-b border-[#ffffff0a]' : ''}`}
                  >
                     <Text className={`text-[16px] ${isSelected ? 'text-white font-bold' : 'text-[#9ca3af] font-medium'}`}>{rating}</Text>
                     {isSelected && <Ionicons name="checkmark" size={22} color="#7c3aed" />}
                  </TouchableOpacity>
               )
            })}
          </View>
        </View>
      </Modal>

      {/* Age Modal */}
      <Modal visible={showAgeModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-[#000000CC]">
          <View className="bg-[#12121a] rounded-t-[24px] p-6" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
             <View className="flex-row justify-between items-center mb-6 px-1">
              <Text className="text-[20px] font-bold text-white tracking-tight">Select Age Rating</Text>
              <TouchableOpacity onPress={() => setShowAgeModal(false)} className="w-8 h-8 rounded-full bg-[#ffffff10] items-center justify-center">
                 <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {AGE_RATINGS.map((rating, index) => {
               const isSelected = ageRating === rating;
               return (
                  <TouchableOpacity
                     key={rating}
                     onPress={() => { setAgeRating(rating); setShowAgeModal(false); }}
                     activeOpacity={0.7}
                     className={`flex-row justify-between items-center py-4 px-2 ${index !== AGE_RATINGS.length - 1 ? 'border-b border-[#ffffff0a]' : ''}`}
                  >
                     <Text className={`text-[16px] ${isSelected ? 'text-white font-bold' : 'text-[#9ca3af] font-medium'}`}>{rating}</Text>
                     {isSelected && <Ionicons name="checkmark" size={22} color="#7c3aed" />}
                  </TouchableOpacity>
               )
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
