import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react';
import { Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { StampCropViewport } from '../services/stampImageCrop';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export type ZoomableImageHandle = {
  /** Read zoom from UI thread (avoids JS-stale / getSize race wiping Apply). */
  getCropViewport: () => Promise<StampCropViewport | null>;
};

type ZoomableImageProps = {
  uri: string;
  onCropChange?: (viewport: StampCropViewport) => void;
};

export const ZoomableImage = forwardRef<ZoomableImageHandle, ZoomableImageProps>(
  function ZoomableImage({ uri, onCropChange }, ref) {
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
        nextViewportWidth: number,
        nextViewportHeight: number,
        nextImageWidth: number,
        nextImageHeight: number,
      ) => {
        onCropChange?.({
          scale: nextScale,
          translateX: nextTranslateX,
          translateY: nextTranslateY,
          viewportWidth: nextViewportWidth,
          viewportHeight: nextViewportHeight,
          imageWidth: nextImageWidth,
          imageHeight: nextImageHeight,
        });
      },
      [onCropChange],
    );

    const flushCropViewport = useCallback((): Promise<StampCropViewport | null> => {
      return new Promise((resolve) => {
        runOnUI(() => {
          'worklet';
          const vw = viewportWidth.value;
          const vh = viewportHeight.value;
          const iw = imageWidth.value;
          const ih = imageHeight.value;
          if (vw <= 0 || vh <= 0 || iw <= 0 || ih <= 0) {
            runOnJS(resolve)(null);
            return;
          }
          const nextScale = scale.value;
          const nextTx = translateX.value;
          const nextTy = translateY.value;
          runOnJS(publishCrop)(nextScale, nextTx, nextTy, vw, vh, iw, ih);
          runOnJS(resolve)({
            scale: nextScale,
            translateX: nextTx,
            translateY: nextTy,
            viewportWidth: vw,
            viewportHeight: vh,
            imageWidth: iw,
            imageHeight: ih,
          });
        })();
      });
    }, [
      imageHeight,
      imageWidth,
      publishCrop,
      scale,
      translateX,
      translateY,
      viewportHeight,
      viewportWidth,
    ]);

    useImperativeHandle(ref, () => ({ getCropViewport: flushCropViewport }), [flushCropViewport]);

    useEffect(() => {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      imageWidth.value = 0;
      imageHeight.value = 0;

      let cancelled = false;
      Image.getSize(
        uri,
        (width, height) => {
          if (cancelled || width <= 0 || height <= 0) {
            return;
          }
          // Keep current gesture transform — never force identity (wipes Apply for large in-app photos).
          runOnUI(() => {
            'worklet';
            imageWidth.value = width;
            imageHeight.value = height;
            if (viewportWidth.value > 0) {
              runOnJS(publishCrop)(
                scale.value,
                translateX.value,
                translateY.value,
                viewportWidth.value,
                viewportHeight.value,
                width,
                height,
              );
            }
          })();
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
          notifyCrop(MAX_SCALE, translateX.value, translateY.value);
          return;
        }
        savedScale.value = scale.value;
        notifyCrop(scale.value, translateX.value, translateY.value);
      });

    const pan = Gesture.Pan()
      .minPointers(1)
      .maxPointers(1)
      .activeOffsetX([-8, 8])
      .activeOffsetY([-8, 8])
      .onBegin(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      })
      .onUpdate((event) => {
        if (scale.value <= MIN_SCALE + 0.01) {
          return;
        }
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        savedScale.value = scale.value;
        notifyCrop(scale.value, savedTranslateX.value, savedTranslateY.value);
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
        notifyCrop(2, translateX.value, translateY.value);
      });

    const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);

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
            // Size only — do not publish identity (large in-app decode can re-layout after zoom).
            runOnUI(() => {
              'worklet';
              viewportWidth.value = width;
              viewportHeight.value = height;
              if (imageWidth.value > 0) {
                runOnJS(publishCrop)(
                  scale.value,
                  translateX.value,
                  translateY.value,
                  width,
                  height,
                  imageWidth.value,
                  imageHeight.value,
                );
              }
            })();
          }}
        >
          <Animated.View style={[styles.imageWrap, animatedStyle]} collapsable={false}>
            {/* cover: fill viewport (no letterbox) so crop math matches on-screen pixels */}
            <Animated.Image source={{ uri }} style={styles.image} resizeMode="cover" />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

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
