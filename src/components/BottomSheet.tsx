import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  Dimensions,
  PanResponder,
  Animated,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

export function BottomSheet({ 
  visible, 
  onClose, 
  children, 
  contentContainerStyle,
  backgroundColor = '#0e0e13'
}: BottomSheetProps) {
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(bottomSheetAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(panY, { toValue: SCREEN_HEIGHT, duration: 240, useNativeDriver: true })
    ]).start(() => {
      setIsModalVisible(false);
    });
  };

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      panY.setValue(0);
      Animated.spring(bottomSheetAnim, {
        toValue: 1,
        tension: 45,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else if (isModalVisible) {
      handleClose();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          onClose(); // This sets parent visible to false, which triggers the useEffect to run handleClose
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true, tension: 40, friction: 8 }).start();
        }
      },
    })
  ).current;

  const modalTranslateY = Animated.add(
    bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT, 0] }),
    panY
  );

  const backdropOpacity = Animated.multiply(
    bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }),
    panY.interpolate({ inputRange: [0, SCREEN_HEIGHT], outputRange: [1, 0], extrapolate: 'clamp' })
  );

  if (!isModalVisible) return null;

  return (
    <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={{ position: 'absolute', inset: 0, backgroundColor: '#000', opacity: backdropOpacity }} />
        </TouchableWithoutFeedback>

        <Animated.View style={[{
          backgroundColor, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          borderWidth: 1, borderColor: '#1f1f29', maxHeight: SCREEN_HEIGHT * 0.85,
          transform: [{ translateY: modalTranslateY }], overflow: 'hidden',
        }, contentContainerStyle]}>
          <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center', paddingVertical: 14, backgroundColor }}>
            <View style={{ width: 44, height: 5, borderRadius: 2.5, backgroundColor: '#2d2d3d' }} />
          </View>

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
