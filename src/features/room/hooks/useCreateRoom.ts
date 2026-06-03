import { useState } from 'react';
import { useRouter } from 'expo-router';
import { roomService } from '@/services/roomService';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { ContentType, GENRES, mapAgeToCertification, mapImdbToMinVoteAverage } from '../constants/createRoom';

export function useCreateRoom() {
  const router = useRouter();
  const { user } = useAuthSession();

  const [contentType, setContentType] = useState<ContentType>('movie');
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
        minVoteAverage: mapImdbToMinVoteAverage(imdbRating),
        certification: mapAgeToCertification(ageRating),
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
