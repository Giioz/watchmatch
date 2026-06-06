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
import { useAppStyles } from '@/theme/useAppStyles';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

export function CreateRoomScreenContent() {
  const { colors } = useAppTheme();
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
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 160 }} 
        showsVerticalScrollIndicator={false}
      >
        <CreateRoomHeader onBack={() => router.back()} />

        <View className="px-6">
          <CreateRoomContentToggle contentType={contentType} onSelect={setContentType} />

          {/* Section Header */}
          <View className="flex-row items-center justify-between mb-4 mt-1">
            <Text className="text-[10px] uppercase tracking-[2px] font-bold" style={{ color: colors.textSubtle }}>
              PREFERENCE FILTERS
            </Text>
            {availableFilterOptions.length > 0 && activeFilters.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowAddFilterModal(true)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full border items-center justify-center"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Empty State / Unfiltered Card */}
          {activeFilters.length === 0 && (
            <TouchableOpacity
              onPress={() => setShowAddFilterModal(true)}
              activeOpacity={0.8}
              className="p-6 rounded-2xl border border-dashed mb-6 items-center justify-center"
              style={{ backgroundColor: colors.surfaceHighlight, borderColor: colors.border }}
            >
              <View className="w-12 h-12 rounded-full border items-center justify-center mb-3" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
                <Ionicons name="funnel-outline" size={20} color={colors.primary} />
              </View>
              <Text className="text-[15px] font-bold tracking-tight text-center" style={{ color: colors.text }}>
                No Filters Active
              </Text>
              <Text className="text-[12px] text-center mt-1.5 max-w-[240px] leading-[18px]" style={{ color: colors.textSubtle }}>
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
                className="flex-row items-center px-6 py-3 rounded-full border border-dashed"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <Ionicons name="add" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text className="text-[13px] font-bold tracking-wide" style={{ color: colors.primary }}>
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
