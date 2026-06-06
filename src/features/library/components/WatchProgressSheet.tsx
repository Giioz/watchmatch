import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/BottomSheet';
import { LibraryMovie, WatchStatus, MovieWatchStatus } from '@/types/library';
import { movieService } from '@/services/tmdbApi';
import { useAppTheme } from '@/theme/ThemeContext';
import { useAppStyles } from '@/theme/useAppStyles';
import { ThemeColors } from '@/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_HORIZONTAL_PAD = 24;
const SLIDER_WIDTH = SCREEN_WIDTH - SLIDER_HORIZONTAL_PAD * 2 - 48; // container padding

interface WatchProgressSheetProps {
  visible: boolean;
  onClose: () => void;
  movie: LibraryMovie | null;
  onSave: (status: MovieWatchStatus) => void;
  onRemove: (movieId: number) => void;
}

export const WatchProgressSheet: React.FC<WatchProgressSheetProps> = ({
  visible,
  onClose,
  movie,
  onSave,
  onRemove,
}) => {
  const { colors, isDark } = useAppTheme();
  const styles = useAppStyles(createStyles);

  const [status, setStatus] = useState<WatchStatus>('unwatched');
  const [progressMins, setProgressMins] = useState(0);
  const [duration, setDuration] = useState(120);
  const [loadingDuration, setLoadingDuration] = useState(false);

  useEffect(() => {
    if (visible && movie) {
      if (movie.watchStatus) {
        setStatus(movie.watchStatus.status);
        setProgressMins(movie.watchStatus.progress || 0);
      } else {
        setStatus('unwatched');
        setProgressMins(0);
      }

      setLoadingDuration(true);
      movieService.getMovieDetails(movie.movie.id)
        .then(details => {
          if (details?.runtime) {
            setDuration(details.runtime);
          }
        })
        .finally(() => setLoadingDuration(false));
    }
  }, [visible, movie]);

  const handleStatusSelect = (newStatus: WatchStatus) => {
    setStatus(newStatus);
    if (newStatus === 'watched') setProgressMins(duration);
    if (newStatus === 'unwatched') setProgressMins(0);
  };

  const handleSave = () => {
    if (!movie) return;
    onSave({
      movieId: movie.movie.id,
      status,
      progress: status === 'in_progress' ? progressMins : status === 'watched' ? duration : 0,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleRemove = () => {
    if (!movie) return;
    onRemove(movie.movie.id);
    onClose();
  };

  const statusRef = useRef(status);
  statusRef.current = status;
  const durationRef = useRef(duration);
  durationRef.current = duration;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const padding = 48;
        const sliderWidth = SCREEN_WIDTH - padding;
        let newProgress = Math.round((gestureState.x0 - 24) / sliderWidth * durationRef.current);
        newProgress = Math.max(0, Math.min(durationRef.current, newProgress));
        
        if (newProgress === 0) {
          setStatus('unwatched');
        } else if (newProgress === durationRef.current && durationRef.current > 0) {
          setStatus('watched');
        } else {
          setStatus('in_progress');
        }
        setProgressMins(newProgress);
      },
      onPanResponderMove: (evt, gestureState) => {
        const padding = 48;
        const sliderWidth = SCREEN_WIDTH - padding;
        let newProgress = Math.round((gestureState.moveX - 24) / sliderWidth * durationRef.current);
        newProgress = Math.max(0, Math.min(durationRef.current, newProgress));
        
        if (newProgress === 0) {
          setStatus('unwatched');
        } else if (newProgress === durationRef.current && durationRef.current > 0) {
          setStatus('watched');
        } else {
          setStatus('in_progress');
        }
        
        setProgressMins(newProgress);
      },
    })
  ).current;

  if (!movie) return null;

  const percent = duration > 0 ? Math.min((progressMins / duration) * 100, 100) : 0;
  const posterUri = movie.movie.poster_path
    ? `https://image.tmdb.org/t/p/w200${movie.movie.poster_path}`
    : null;
  const movieTitle = movie.movie.title || movie.movie.name || 'Untitled';
  const year = (movie.movie.release_date ?? movie.movie.first_air_date ?? '').slice(0, 4);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const statusOptions: { key: WatchStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'unwatched', label: 'Not Started', icon: 'ellipse-outline' },
    { key: 'in_progress', label: 'Watching', icon: 'play-circle-outline' },
    { key: 'watched', label: 'Finished', icon: 'checkmark-circle' },
  ];

  const getStatusColor = (key: WatchStatus) => {
    if (key === 'watched') return colors.success;
    if (key === 'in_progress') return colors.primary;
    return colors.textSubtle;
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      backgroundColor={colors.surfaceElevated}
    >
      <View style={styles.container}>
        {/* Movie Header Card */}
        <View style={styles.movieHeader}>
          {posterUri ? (
            <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterFallback]}>
              <Ionicons name="film-outline" size={20} color={colors.textSubtle} />
            </View>
          )}
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle} numberOfLines={2}>{movieTitle}</Text>
            <View style={styles.movieMeta}>
              {year ? (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{year}</Text>
                </View>
              ) : null}
              {duration > 0 && !loadingDuration ? (
                <View style={styles.metaPill}>
                  <Ionicons name="time-outline" size={10} color={colors.textSubtle} style={{ marginRight: 3 }} />
                  <Text style={styles.metaPillText}>{formatTime(duration)}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Circular Progress Display */}
        {loadingDuration ? (
          <View style={styles.progressCenter}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingLabel}>Loading runtime...</Text>
          </View>
        ) : (
          <View style={styles.progressSection}>
            {/* Big Time Display */}
            <View style={styles.timeDisplay}>
              <Text style={styles.timeElapsed}>{formatTime(progressMins)}</Text>
              <Text style={styles.timeSeparator}>/</Text>
              <Text style={styles.timeTotal}>{formatTime(duration)}</Text>
            </View>

            {/* Percentage */}
            <Text style={styles.percentText}>{Math.round(percent)}% complete</Text>

            {/* Slider */}
            <View style={styles.sliderOuter}>
              <View style={styles.sliderTrack} {...panResponder.panHandlers}>
                <View style={[styles.sliderFill, { width: `${percent}%` }]} />
                <View style={[styles.sliderThumb, { left: `${percent}%` }]} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>0m</Text>
                <Text style={styles.sliderLabelText}>{formatTime(duration)}</Text>
              </View>
            </View>

            {/* Quick Adjust Buttons */}
            <View style={styles.quickActions}>
              {[
                { label: '-15m', delta: -15 },
                { label: '-5m', delta: -5 },
                { label: '+5m', delta: 5 },
                { label: '+15m', delta: 15 },
              ].map(({ label, delta }) => (
                <TouchableOpacity
                  key={label}
                  style={styles.quickBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    const newVal = Math.max(0, Math.min(duration, progressMins + delta));
                    setProgressMins(newVal);
                    if (newVal === 0) {
                      setStatus('unwatched');
                    } else if (newVal === duration && duration > 0) {
                      setStatus('watched');
                    } else {
                      setStatus('in_progress');
                    }
                  }}
                >
                  <Text style={styles.quickBtnText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Status Selector */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionLabel}>STATUS</Text>
          <View style={styles.statusRow}>
            {statusOptions.map((s) => {
              const isActive = status === s.key;
              const activeColor = getStatusColor(s.key);
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.statusCard,
                    isActive && { backgroundColor: isDark ? `${activeColor}15` : `${activeColor}12`, borderColor: activeColor },
                  ]}
                  onPress={() => handleStatusSelect(s.key)}
                  activeOpacity={0.78}
                >
                  <Ionicons
                    name={s.icon}
                    size={18}
                    color={isActive ? activeColor : colors.textSubtle}
                  />
                  <Text style={[
                    styles.statusCardText,
                    isActive && { color: activeColor },
                  ]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.clearBtn} onPress={handleRemove} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} style={{ marginRight: 6 }} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={16} color={colors.pureWhite} style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>Save Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // --- Movie Header ---
  movieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poster: {
    width: 50,
    height: 75,
    borderRadius: 10,
    backgroundColor: colors.surfaceHighlight,
  },
  posterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 14,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 20,
    marginBottom: 6,
  },
  movieMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSubtle,
  },

  // --- Progress ---
  progressCenter: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  loadingLabel: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 20,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
  },
  timeElapsed: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.textSubtle,
    marginHorizontal: 6,
  },
  timeTotal: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: -0.5,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubtle,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // --- Slider ---
  sliderOuter: {
    marginBottom: 14,
  },
  sliderTrack: {
    height: 10,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 5,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.pureWhite,
    marginLeft: -12,
    shadowColor: colors.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sliderLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSubtle,
  },

  // --- Quick Adjust ---
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },

  // --- Status ---
  statusSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSubtle,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  statusCardText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },

  // --- Actions ---
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  clearBtnText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    color: colors.pureWhite,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
