import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useCreateRoom } from '../hooks/useCreateRoom';
import { CreateRoomHeader } from './CreateRoomHeader';
import { CreateRoomContentToggle } from './CreateRoomContentToggle';
import { CreateRoomFilterField } from './CreateRoomFilterField';
import { CreateRoomBottomSheet } from './CreateRoomBottomSheet';
import { CreateRoomActions } from './CreateRoomActions';
import { GENRES, IMDB_RATINGS, AGE_RATINGS } from '../constants/createRoom';

export function CreateRoomScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    contentType,
    setContentType,
    selectedGenreIds,
    imdbRating,
    setImdbRating,
    ageRating,
    setAgeRating,
    showGenresModal,
    setShowGenresModal,
    showImdbModal,
    setShowImdbModal,
    showAgeModal,
    setShowAgeModal,
    creatingRoom,
    error,
    selectedGenreNames,
    toggleGenre,
    handleCreateRoom
  } = useCreateRoom();

  const genreOptions = GENRES.map(g => ({ key: g.id, label: g.name }));
  const imdbOptions = IMDB_RATINGS.map(r => ({ key: r, label: r }));
  const ageOptions = AGE_RATINGS.map(r => ({ key: r, label: r }));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#0a0a0f]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
      >
        <CreateRoomHeader onBack={() => router.back()} />

        <View className="px-6">
          <CreateRoomContentToggle contentType={contentType} onSelect={setContentType} />

          <CreateRoomFilterField 
            label="GENRES" 
            value={selectedGenreNames} 
            icon="film-outline" 
            onPress={() => setShowGenresModal(true)} 
          />

          <CreateRoomFilterField 
            label="IMDB RATING" 
            value={imdbRating} 
            icon="star-outline" 
            onPress={() => setShowImdbModal(true)} 
          />

          <CreateRoomFilterField 
            label="AGE RATING" 
            value={ageRating} 
            icon="shield-outline" 
            onPress={() => setShowAgeModal(true)} 
          />
        </View>
      </ScrollView>

      <CreateRoomActions 
        loading={creatingRoom} 
        error={error} 
        onSubmit={handleCreateRoom} 
        bottomInset={insets.bottom} 
      />

      <CreateRoomBottomSheet
        visible={showGenresModal}
        onClose={() => setShowGenresModal(false)}
        title="Select Genres"
        options={genreOptions}
        selectedKeys={selectedGenreIds}
        onSelect={(key) => toggleGenre(key as number)}
        multiSelect={true}
        actionLabel={`Done (${selectedGenreIds.length} selected)`}
      />

      <CreateRoomBottomSheet
        visible={showImdbModal}
        onClose={() => setShowImdbModal(false)}
        title="Minimum IMDb Rating"
        options={imdbOptions}
        selectedKeys={[imdbRating]}
        onSelect={(key) => setImdbRating(key as string)}
      />

      <CreateRoomBottomSheet
        visible={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        title="Maximum Age Rating"
        options={ageOptions}
        selectedKeys={[ageRating]}
        onSelect={(key) => setAgeRating(key as string)}
      />
    </SafeAreaView>
  );
}
