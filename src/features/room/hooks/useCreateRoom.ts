import { useState } from 'react';
import { useRouter } from 'expo-router';
import { roomService } from '@/services/roomService';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import {
  ContentType,
  GENRES,
  ReleaseEra,
  mapAgeToCertification,
  mapEraToDateRange,
  mapImdbToMinVoteAverage,
} from '../constants/createRoom';

export type CreateStep = 1 | 2 | 3;

export function useCreateRoom() {
  const router = useRouter();
  const { user } = useAuthSession();

  const [step, setStep] = useState<CreateStep>(1);
  const [contentType, setContentType] = useState<ContentType>('movie');
  const [era, setEra] = useState<ReleaseEra>('All');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [imdbRating, setImdbRating] = useState<string>('Any rating');
  const [ageRating, setAgeRating] = useState<string>('Any');

  const [creatingRoom, setCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const selectedGenreNames =
    selectedGenreIds.length > 0
      ? selectedGenreIds.map((id) => GENRES.find((g) => g.id === id)?.name).join(', ')
      : 'Any genre';

  const toggleGenre = (id: number) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const canAdvance = step === 2 ? selectedGenreIds.length >= 1 : true;

  const goNext = () => {
    setError(null);
    setStep((prev) => (prev < 3 ? ((prev + 1) as CreateStep) : prev));
  };

  const goBack = () => {
    setError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as CreateStep) : prev));
  };

  const handleGenerate = async () => {
    if (!user || creatingRoom) {
      if (!user) router.push('/auth');
      return;
    }

    try {
      setCreatingRoom(true);
      setError(null);
      const { gte, lte } = mapEraToDateRange(era);
      const { room } = await roomService.createRoomFromFilters({
        hostId: user.id,
        contentType,
        genreIds: selectedGenreIds,
        sessionLimit: 10,
        minVoteAverage: mapImdbToMinVoteAverage(imdbRating),
        certification: mapAgeToCertification(ageRating),
        certificationCountry: contentType === 'movie' ? 'US' : undefined,
        region: contentType === 'movie' ? 'US' : undefined,
        releaseDateGte: gte,
        releaseDateLte: lte,
      });
      // Surface the code for the animated reveal; navigation happens on confirm.
      setGeneratedCode(room.code);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create room.');
    } finally {
      setCreatingRoom(false);
    }
  };

  const enterRoom = () => {
    if (generatedCode) router.replace(`/room/${generatedCode}`);
  };

  return {
    step,
    contentType,
    setContentType,
    era,
    setEra,
    selectedGenreIds,
    selectedGenreNames,
    toggleGenre,
    imdbRating,
    setImdbRating,
    ageRating,
    setAgeRating,
    creatingRoom,
    error,
    generatedCode,
    canAdvance,
    goNext,
    goBack,
    handleGenerate,
    enterRoom,
  };
}
