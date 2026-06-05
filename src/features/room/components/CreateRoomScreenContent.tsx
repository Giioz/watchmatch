import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useCreateRoom, FilterType } from '../hooks/useCreateRoom';
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
    activeFilters,
    addFilter,
    removeFilter,
    showAddFilterModal,
    setShowAddFilterModal,
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

  const availableFilterOptions = [
    { key: 'genres', label: 'Genres' },
    { key: 'imdb', label: 'IMDb Rating' },
    { key: 'age', label: 'Age Rating' },
  ].filter(option => !activeFilters.includes(option.key as FilterType));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#0a0a0f]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 160 }} 
        showsVerticalScrollIndicator={false}
      >
        <CreateRoomHeader onBack={() => router.back()} />

        <View className="px-6">
          <CreateRoomContentToggle contentType={contentType} onSelect={setContentType} />

          {/* Section Header */}
          <View className="flex-row items-center justify-between mb-4 mt-1">
            <Text className="text-[10px] text-[#71717a] uppercase tracking-[2px] font-bold">
              PREFERENCE FILTERS
            </Text>
            {availableFilterOptions.length > 0 && activeFilters.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowAddFilterModal(true)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-[#13131c] border border-[#ffffff0a] items-center justify-center"
              >
                <Ionicons name="add" size={16} color="#a78bfa" />
              </TouchableOpacity>
            )}
          </View>

          {/* Empty State / Unfiltered Card */}
          {activeFilters.length === 0 && (
            <TouchableOpacity
              onPress={() => setShowAddFilterModal(true)}
              activeOpacity={0.8}
              className="bg-[#13131c]/40 p-6 rounded-2xl border border-dashed border-[#ffffff0a] mb-6 items-center justify-center"
            >
              <View className="w-12 h-12 rounded-full bg-[#181825] border border-[#ffffff0a] items-center justify-center mb-3">
                <Ionicons name="funnel-outline" size={20} color="#a78bfa" />
              </View>
              <Text className="text-[#f1f0f8] text-[15px] font-bold tracking-tight text-center">
                No Filters Active
              </Text>
              <Text className="text-[#71717a] text-[12px] text-center mt-1.5 max-w-[240px] leading-[18px]">
                You'll swipe on all available {contentType === 'movie' ? 'movies' : 'shows'}. Tap to narrow down your queue.
              </Text>
            </TouchableOpacity>
          )}

          {activeFilters.includes('genres') && (
            <CreateRoomFilterField 
              label="GENRES" 
              value={selectedGenreNames} 
              icon="film-outline" 
              onPress={() => setShowGenresModal(true)} 
              onRemove={() => removeFilter('genres')}
            />
          )}

          {activeFilters.includes('imdb') && (
            <CreateRoomFilterField 
              label="IMDB RATING" 
              value={imdbRating} 
              icon="star-outline" 
              onPress={() => setShowImdbModal(true)} 
              onRemove={() => removeFilter('imdb')}
            />
          )}

          {activeFilters.includes('age') && (
            <CreateRoomFilterField 
              label="AGE RATING" 
              value={ageRating} 
              icon="shield-outline" 
              onPress={() => setShowAgeModal(true)} 
              onRemove={() => removeFilter('age')}
            />
          )}

          {/* Centered Add Session Filter Block Button */}
          {availableFilterOptions.length > 0 && (
            <View className="items-center mt-2 mb-6">
              <TouchableOpacity
                onPress={() => setShowAddFilterModal(true)}
                activeOpacity={0.78}
                className="flex-row items-center bg-[#13131c] px-6 py-3 rounded-full border border-dashed border-[#ffffff12]"
              >
                <Ionicons name="add" size={16} color="#a78bfa" style={{ marginRight: 6 }} />
                <Text className="text-[#c4b5fd] text-[13px] font-bold tracking-wide">
                  Add Session Filter
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <CreateRoomActions 
        loading={creatingRoom} 
        error={error} 
        onSubmit={handleCreateRoom} 
        bottomInset={insets.bottom} 
      />

      {/* Sheet to choose which filter to add */}
      <CreateRoomBottomSheet
        visible={showAddFilterModal}
        onClose={() => setShowAddFilterModal(false)}
        title="Add Preference Filter"
        options={availableFilterOptions}
        selectedKeys={[]}
        onSelect={(key) => {
          setShowAddFilterModal(false);
          setTimeout(() => {
            addFilter(key as FilterType);
          }, 320);
        }}
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
