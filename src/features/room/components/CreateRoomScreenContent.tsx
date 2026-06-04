import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCreateRoom } from '../hooks/useCreateRoom';
import { CreateRoomSegmented } from './CreateRoomSegmented';
import { CreateRoomGenreGrid } from './CreateRoomGenreGrid';
import RoomCodeReveal from './RoomCodeReveal';
import {
  AGE_RATINGS,
  ContentType,
  IMDB_RATINGS,
  RELEASE_ERAS,
  ReleaseEra,
} from '../constants/createRoom';

const STEP_TITLES: Record<number, { eyebrow: string; title: string }> = {
  1: { eyebrow: 'Format', title: 'What are we watching?' },
  2: { eyebrow: 'Taste', title: 'Dial in the vibe' },
  3: { eyebrow: 'Review', title: 'Ready to roll?' },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function CreateRoomScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
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
  } = useCreateRoom();

  const meta = STEP_TITLES[step];

  const handleBack = () => {
    if (step > 1) goBack();
    else router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.orb} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} activeOpacity={0.75} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#f1f0f8" />
        </TouchableOpacity>
        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>Step {step} of 3</Text>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>{meta.eyebrow}</Text>
        <Text style={styles.title}>{meta.title}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <>
            <FieldLabel>Format</FieldLabel>
            <CreateRoomSegmented
              options={[
                { key: 'movie', label: 'Movies' },
                { key: 'tv', label: 'TV Shows' },
              ]}
              value={contentType}
              onChange={(k) => setContentType(k as ContentType)}
            />

            <FieldLabel>Release era</FieldLabel>
            <CreateRoomSegmented
              wrap
              options={RELEASE_ERAS.map((e) => ({ key: e, label: e }))}
              value={era}
              onChange={(k) => setEra(k as ReleaseEra)}
            />
          </>
        )}

        {step === 2 && (
          <>
            <FieldLabel>Genres · pick at least one</FieldLabel>
            <CreateRoomGenreGrid selectedGenreIds={selectedGenreIds} onToggle={toggleGenre} />

            <FieldLabel>Minimum IMDb rating</FieldLabel>
            <CreateRoomSegmented
              wrap
              options={IMDB_RATINGS.map((r) => ({ key: r, label: r }))}
              value={imdbRating}
              onChange={setImdbRating}
            />

            <FieldLabel>Age rating</FieldLabel>
            <CreateRoomSegmented
              wrap
              options={AGE_RATINGS.map((r) => ({ key: r, label: r }))}
              value={ageRating}
              onChange={setAgeRating}
            />
          </>
        )}

        {step === 3 && (
          <View style={styles.reviewCard}>
            <ReviewRow label="Format" value={contentType === 'movie' ? 'Movies' : 'TV Shows'} />
            <ReviewRow label="Era" value={era} />
            <ReviewRow label="Genres" value={selectedGenreNames} />
            <ReviewRow label="IMDb" value={imdbRating} />
            <ReviewRow label="Age rating" value={ageRating} />
          </View>
        )}
      </ScrollView>

      {/* Footer nav */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.footerRow}>
          {step > 1 && (
            <TouchableOpacity onPress={goBack} activeOpacity={0.8} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          )}

          {step < 3 ? (
            <TouchableOpacity
              onPress={goNext}
              disabled={!canAdvance}
              activeOpacity={0.85}
              style={[styles.primaryBtn, !canAdvance && styles.primaryBtnDisabled]}
            >
              <Text style={styles.primaryBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={creatingRoom}
              activeOpacity={0.85}
              style={styles.primaryBtn}
            >
              {creatingRoom ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Generate Room Code</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {generatedCode && <RoomCodeReveal code={generatedCode} onEnter={enterRoom} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#7c3aed',
    opacity: 0.12,
    top: -110,
    right: -90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,92,240,0.4)',
    backgroundColor: 'rgba(124,92,240,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepPillText: {
    color: '#c4b5fd',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  titleBlock: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 12 },
  eyebrow: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: { color: '#f1f0f8', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  fieldLabel: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 12,
  },
  reviewCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#111115',
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#27272a',
    gap: 16,
  },
  reviewLabel: { color: '#71717a', fontSize: 13, fontWeight: '600' },
  reviewValue: { color: '#f4f4f5', fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0a0a0f',
  },
  error: { color: '#fca5a5', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  footerRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: {
    paddingHorizontal: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3f3f46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: '#d4d4d8', fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
