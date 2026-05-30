import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  Extrapolate,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { TMDBMediaItem } from '@/types/movie';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.32;
const ROTATION_FACTOR = 14;
const SNAP_BACK = { damping: 20, stiffness: 180, mass: 0.6 };
const FLY_OUT = { damping: 22, stiffness: 200, mass: 0.5 };

interface UseSwipeOptions {
  movie: TMDBMediaItem;
  isTop: boolean;
  index: number;
  topCardX?: SharedValue<number>;
  onSwipeLeft: (movie: TMDBMediaItem) => void;
  onSwipeRight: (movie: TMDBMediaItem) => void;
  onDetailsOpen: (movie: TMDBMediaItem) => void;
}

export function useSwipe({
  movie,
  isTop,
  index,
  topCardX,
  onSwipeLeft,
  onSwipeRight,
  onDetailsOpen,
}: UseSwipeOptions) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const drivingX = isTop ? translateX : (topCardX ?? translateX);

  const pan = Gesture.Pan()
    .minDistance(2)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.25;
      if (isTop && topCardX) {
        topCardX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const pastThreshold = Math.abs(event.translationX) > SWIPE_THRESHOLD;
      const fastFlick = Math.abs(event.velocityX) > 800;
      const goRight = (pastThreshold || fastFlick) && event.translationX > 0;
      const goLeft = (pastThreshold || fastFlick) && event.translationX < 0;

      if (goRight) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {
          ...FLY_OUT,
          velocity: event.velocityX,
        });
        translateY.value = withSpring(event.translationY * 1.5, {
          ...FLY_OUT,
          velocity: event.velocityY,
        });
        if (isTop && topCardX) {
          topCardX.value = SCREEN_WIDTH * 1.5;
        }
        runOnJS(onSwipeRight)(movie);
        return;
      }

      if (goLeft) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {
          ...FLY_OUT,
          velocity: event.velocityX,
        });
        translateY.value = withSpring(event.translationY * 1.5, {
          ...FLY_OUT,
          velocity: event.velocityY,
        });
        if (isTop && topCardX) {
          topCardX.value = -SCREEN_WIDTH * 1.5;
        }
        runOnJS(onSwipeLeft)(movie);
        return;
      }

      translateX.value = withSpring(0, { ...SNAP_BACK, velocity: event.velocityX });
      translateY.value = withSpring(0, { ...SNAP_BACK, velocity: event.velocityY });
      if (isTop && topCardX) {
        topCardX.value = 0;
      }
    });

  const singleTap = Gesture.Tap().onEnd(() => {
    if (isTop) {
      runOnJS(onDetailsOpen)(movie);
    }
  });

  const gesture = Gesture.Race(pan, singleTap);

  const swipeProgress = useDerivedValue(() =>
    interpolate(
      Math.abs(drivingX.value),
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP,
    ),
  );

  const animatedCardStyle = useAnimatedStyle(() => {
    const progress = swipeProgress.value;

    const baseScale = interpolate(index, [0, 1, 2], [1, 0.94, 0.88], Extrapolate.CLAMP);
    const targetScale = interpolate(index, [0, 1, 2], [1, 0.97, 0.94], Extrapolate.CLAMP);
    const scale = isTop ? 1 : baseScale + (targetScale - baseScale) * progress;

    const baseOffsetY = interpolate(index, [0, 1, 2], [0, 18, 34], Extrapolate.CLAMP);
    const targetOffsetY = interpolate(index, [0, 1, 2], [0, 8, 18], Extrapolate.CLAMP);
    const offsetY = isTop ? 0 : baseOffsetY - (baseOffsetY - targetOffsetY) * progress;

    const rotate = isTop
      ? interpolate(
          translateX.value,
          [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
          [-ROTATION_FACTOR, 0, ROTATION_FACTOR],
          Extrapolate.CLAMP,
        )
      : 0;

    return {
      transform: [
        { translateX: isTop ? translateX.value : 0 },
        { translateY: isTop ? translateY.value + offsetY : offsetY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.4, SWIPE_THRESHOLD],
      [0, 0.7, 1],
      Extrapolate.CLAMP,
    ),
    transform: [
      { rotate: '-22deg' },
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_THRESHOLD],
          [0.75, 1],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.4, 0],
      [1, 0.7, 0],
      Extrapolate.CLAMP,
    ),
    transform: [
      { rotate: '22deg' },
      {
        scale: interpolate(
          translateX.value,
          [-SWIPE_THRESHOLD, 0],
          [1, 0.75],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  return {
    gesture,
    animatedCardStyle,
    likeStyle,
    nopeStyle,
  };
}

export function useSwipeCardX() {
  return useSharedValue(0);
}
