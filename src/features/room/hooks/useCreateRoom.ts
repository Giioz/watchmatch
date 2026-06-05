import { useState } from 'react';
import { useRouter } from 'expo-router';
import { roomService } from '@/services/roomService';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { ContentType, GENRES, mapAgeToCertification, mapImdbToMinVoteAverage } from '../constants/createRoom';

export type FilterType = 'genres' | 'imdb' | 'age';

export function useCreateRoom() {
  const router = useRouter();
  const { user } = useAuthSession();

  const [contentType, setContentType] = useState<ContentType>('movie');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [imdbRating, setImdbRating] = useState<string>('Any rating');
  const [ageRating, setAgeRating] = useState<string>('Any');

  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);

  const [showGenresModal, setShowGenresModal] = useState(false);
  const [showImdbModal, setShowImdbModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedGenreNames = selectedGenreIds.length > 0
    ? selectedGenreIds.map(id => GENRES.find(g => g.id === id)?.name).join(', ')
    : 'Select genres...';

  const toggleGenre = (id: number) => {
    setSelectedGenreIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const addFilter = (filter: FilterType) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters(prev => [...prev, filter]);
      // Automatically trigger modal open for the added filter for better UX
      if (filter === 'genres') {
        setShowGenresModal(true);
      } else if (filter === 'imdb') {
        setShowImdbModal(true);
      } else if (filter === 'age') {
        setShowAgeModal(true);
      }
    }
  };

  const removeFilter = (filter: FilterType) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
    // Reset values to defaults when removed
    if (filter === 'genres') {
      setSelectedGenreIds([]);
    } else if (filter === 'imdb') {
      setImdbRating('Any rating');
    } else if (filter === 'age') {
      setAgeRating('Any');
    }
  };

  const handleCreateRoom = async () => {
    if (!user || creatingRoom) {
      if (!user) router.push('/auth');
      return;
    }

    try {
      setCreatingRoom(true);
      setError(null);

      // Check which filters are actually active
      const hasGenres = activeFilters.includes('genres');
      const hasImdb = activeFilters.includes('imdb');
      const hasAge = activeFilters.includes('age');

      const { room } = await roomService.createRoomFromFilters({
        hostId: user.id,
        contentType,
        genreIds: hasGenres ? selectedGenreIds : [],
        sessionLimit: 10,
        minVoteAverage: hasImdb ? mapImdbToMinVoteAverage(imdbRating) : undefined,
        certification: hasAge ? mapAgeToCertification(ageRating) : undefined,
        certificationCountry: contentType === 'movie' ? 'US' : undefined,
        region: contentType === 'movie' ? 'US' : undefined,
      });
      router.replace(`/room/${room.code}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create room.');
    } finally {
      setCreatingRoom(false);
    }
  };

  return {
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
  };
}
