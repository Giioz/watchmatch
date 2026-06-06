import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LibraryMovie } from '@/types/library';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

interface LibraryMovieCardProps {
  movie: LibraryMovie;
  onPress: () => void;
  onPressProgress: () => void;
  onMarkWatched: () => void;
  onUnmarkWatched: () => void;
  isWatchedTab: boolean;
}

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

const LibraryMovieCardInner: React.FC<LibraryMovieCardProps> = ({
  movie,
  onPress,
  onPressProgress,
  onMarkWatched,
  onUnmarkWatched,
  isWatchedTab,
}) => {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const watchedScale = useRef(new Animated.Value(1)).current;
  const progressScale = useRef(new Animated.Value(1)).current;
  const cardGlow = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const { title, name, poster_path, vote_average } = movie.movie;
  const displayTitle = title || name || 'Unknown Title';
  const posterUri = poster_path ? `${IMAGE_BASE}${poster_path}` : null;
  const year = (movie.movie.release_date ?? movie.movie.first_air_date ?? '').slice(0, 4);
  const status = movie.watchStatus?.status || 'unwatched';
  const isInProgress = status === 'in_progress';
  const progressMins = movie.watchStatus?.progress ?? 0;

  const triggerSpring = useCallback((animValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animValue, { toValue: 1.25, duration: 80, useNativeDriver: true }),
      Animated.spring(animValue, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleMarkWatched = useCallback(() => {
    triggerSpring(watchedScale);
    if (isWatchedTab) {
      // Unmark: just do it
      onUnmarkWatched();
      return;
    }
    // Mark as watched: green glow flash → fade out → trigger action
    Animated.sequence([
      // Flash green glow
      Animated.timing(cardGlow, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      // Hold briefly
      Animated.delay(400),
      // Fade out card
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onMarkWatched();
      // Reset for next render
      cardGlow.setValue(0);
      cardOpacity.setValue(1);
    });
  }, [isWatchedTab, onMarkWatched, onUnmarkWatched, triggerSpring, watchedScale, cardGlow, cardOpacity]);

  const handleProgress = useCallback(() => {
    triggerSpring(progressScale);
    onPressProgress();
  }, [triggerSpring, progressScale, onPressProgress]);

  // Interpolate glow border color
  const glowBorderColor = cardGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.success],
  });

  const glowShadowOpacity = cardGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          opacity: cardOpacity,
          borderColor: glowBorderColor,
          shadowColor: colors.success,
          shadowOpacity: glowShadowOpacity,
        },
      ]}
    >
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
        {/* Poster */}
        <View style={styles.posterWrap}>
          {posterUri ? (
            <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={styles.posterFallback}>
              <Ionicons name="film-outline" size={24} color={colors.textSubtle} />
            </View>
          )}
          {/* Progress Badge */}
          {isInProgress && !isWatchedTab && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{progressMins}m</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.contentTop}>
            <Text style={styles.title} numberOfLines={2}>{displayTitle}</Text>
            <View style={styles.metaRow}>
              {year ? (
                <View style={styles.metaBadge}>
                  <Ionicons name="calendar-outline" size={10} color={colors.textSubtle} />
                  <Text style={styles.metaText}>{year}</Text>
                </View>
              ) : null}
              {vote_average ? (
                <View style={styles.metaBadge}>
                  <Ionicons name="star" size={10} color="#facc15" />
                  <Text style={[styles.metaText, { color: '#facc15' }]}>{vote_average.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {/* Progress Button */}
            {!isWatchedTab && (
              <TouchableOpacity
                style={[styles.actionBtn, isInProgress && styles.actionBtnActive]}
                onPress={handleProgress}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ scale: progressScale }] }}>
                  <Ionicons
                    name={isInProgress ? 'time' : 'time-outline'}
                    size={14}
                    color={isInProgress ? colors.primary : colors.textMuted}
                  />
                </Animated.View>
                <Text style={[styles.actionBtnText, isInProgress && styles.actionBtnTextActive]}>
                  {isInProgress ? `${progressMins}m` : 'Progress'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Mark Watched Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isWatchedTab ? styles.actionBtnWatched : styles.actionBtnDefault,
              ]}
              onPress={handleMarkWatched}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: watchedScale }] }}>
                <Ionicons
                  name={isWatchedTab ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={14}
                  color={isWatchedTab ? colors.success : colors.textMuted}
                />
              </Animated.View>
              <Text style={[styles.actionBtnText, isWatchedTab && { color: colors.success }]}>
                {isWatchedTab ? 'Undo' : 'Watched'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Memoize to prevent re-renders when other cards in the list change
export const LibraryMovieCard = React.memo(LibraryMovieCardInner, (prev, next) => {
  return (
    prev.movie.movie.id === next.movie.movie.id &&
    prev.movie.watchStatus?.status === next.movie.watchStatus?.status &&
    prev.movie.watchStatus?.progress === next.movie.watchStatus?.progress &&
    prev.isWatchedTab === next.isWatchedTab
  );
});

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  cardOuter: {
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
  },
  posterWrap: {
    width: 100,
    height: 150,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceHighlight,
  },
  posterFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  progressBadgeText: {
    color: colors.pureWhite,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  contentTop: {
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 20,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnDefault: {},
  actionBtnActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  actionBtnWatched: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  actionBtnTextActive: {
    color: colors.primary,
  },
});
