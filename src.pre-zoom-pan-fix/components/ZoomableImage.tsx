import { useCallback, useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { StampCropViewport } from '../services/stampImageCrop';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type ZoomableImageProps = {
  uri: string;
  onCropChange?: (viewport: StampCropViewport) => void;
};

export function ZoomableImage({ uri, onCropChange }: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const viewportWidth = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const imageWidth = useSharedValue(0);
  const imageHeight = useSharedValue(0);

  const publishCrop = useCallback(
    (
      nextScale: number,
      nextTranslateX: number,
      nextTranslateY: number,
      viewportWidth: number,
      viewportHeight: number,
      imageWidth: number,
      imageHeight: number,
    ) => {
      onCropChange?.({
        scale: nextScale,
        translateX: nextTranslateX,
        translateY: nextTranslateY,
        viewportWidth,
        viewportHeight,
        imageWidth,
        imageHeight,
      });
    },
    [onCropChange],
  );

  useEffect(() => {
    let cancelled = false;
    Image.getSize(
      uri,
      (width, height) => {
        if (!cancelled && width > 0 && height > 0) {
          imageWidth.value = width;
          imageHeight.value = height;
          if (viewportWidth.value > 0) {
            publishCrop(1, 0, 0, viewportWidth.value, viewportHeight.value, width, height);
          }
        }
      },
      () => {
        // Keep zero size when lookup fails.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [publishCrop, uri]);

  const resetTransform = () => {
    'worklet';
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const notifyCrop = (
    nextScale: number,
    nextTranslateX: number,
    nextTranslateY: number,
  ) => {
    'worklet';
    runOnJS(publishCrop)(
      nextScale,
      nextTranslateX,
      nextTranslateY,
      viewportWidth.value,
      viewportHeight.value,
      imageWidth.value,
      imageHeight.value,
    );
  };

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE * 0.5, nextScale));
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) {
        resetTransform();
        notifyCrop(1, 0, 0);
        return;
      }
      if (scale.value > MAX_SCALE) {
        scale.value = withTiming(MAX_SCALE);
        savedScale.value = MAX_SCALE;
        notifyCrop(MAX_SCALE, savedTranslateX.value, savedTranslateY.value);
        return;
      }
      savedScale.value = scale.value;
      notifyCrop(savedScale.value, savedTranslateX.value, savedTranslateY.value);
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onUpdate((event) => {
      if (savedScale.value <= MIN_SCALE) {
        return;
      }
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      notifyCrop(savedScale.value, savedTranslateX.value, savedTranslateY.value);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > MIN_SCALE) {
        resetTransform();
        notifyCrop(1, 0, 0);
        return;
      }
      scale.value = withTiming(2);
      savedScale.value = 2;
      notifyCrop(2, savedTranslateX.value, savedTranslateY.value);
    });

  const gesture = Gesture.Simultaneous(pinch, Gesture.Exclusive(doubleTap, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={styles.container}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          viewportWidth.value = width;
          viewportHeight.value = height;
          if (imageWidth.value > 0) {
            publishCrop(1, 0, 0, width, height, imageWidth.value, imageHeight.value);
          }
        }}
      >
        <Animated.View style={[styles.imageWrap, animatedStyle]} collapsable={false}>
          <Animated.Image source={{ uri }} style={styles.image} resizeMode="contain" />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
