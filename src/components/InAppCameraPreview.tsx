import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { CameraView, type CameraType } from 'expo-camera';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

const MAX_ZOOM = 1;
const DOUBLE_TAP_ZOOM = 0.45;
const PINCH_SENSITIVITY = 0.4;

/** Relative presets mapped onto expo-camera zoom 0..1 (device max zoom). */
export const ZOOM_PRESET_VALUES = {
  1: 0,
  3: 0.5,
  5: 1,
} as const;

export type ZoomPreset = keyof typeof ZOOM_PRESET_VALUES;

export type InAppCameraPreviewHandle = {
  setZoomPreset: (preset: ZoomPreset) => void;
  getZoom: () => number;
};

type InAppCameraPreviewProps = {
  cameraRef: React.RefObject<CameraView | null>;
  facing?: CameraType;
  pictureSize?: string;
  onCameraReady: () => void;
  onZoomChange?: (zoom: number, preset: ZoomPreset | null) => void;
  style?: StyleProp<ViewStyle>;
};

function nearestPreset(zoom: number): ZoomPreset | null {
  const entries = Object.entries(ZOOM_PRESET_VALUES) as [string, number][];
  let best: ZoomPreset | null = null;
  let bestDist = Infinity;
  for (const [key, value] of entries) {
    const dist = Math.abs(zoom - value);
    if (dist < 0.08 && dist < bestDist) {
      bestDist = dist;
      best = Number(key) as ZoomPreset;
    }
  }
  return best;
}

export const InAppCameraPreview = forwardRef<InAppCameraPreviewHandle, InAppCameraPreviewProps>(
  function InAppCameraPreview(
    { cameraRef, facing = 'back', pictureSize, onCameraReady, onZoomChange, style },
    ref,
  ) {
    const [zoom, setZoom] = useState(0);
    const zoomShared = useSharedValue(0);
    const savedZoom = useSharedValue(0);
    const onZoomChangeRef = useRef(onZoomChange);
    onZoomChangeRef.current = onZoomChange;

    const applyZoom = useCallback(
      (value: number) => {
        const clamped = Math.min(MAX_ZOOM, Math.max(0, value));
        zoomShared.value = clamped;
        setZoom(clamped);
        onZoomChangeRef.current?.(clamped, nearestPreset(clamped));
      },
      [zoomShared],
    );

    useEffect(() => {
      zoomShared.value = 0;
      setZoom(0);
      onZoomChangeRef.current?.(0, 1);
    }, [zoomShared, facing]);

    useImperativeHandle(
      ref,
      () => ({
        setZoomPreset: (preset: ZoomPreset) => {
          applyZoom(ZOOM_PRESET_VALUES[preset]);
        },
        getZoom: () => zoomShared.value,
      }),
      [applyZoom, zoomShared],
    );

    const pinch = Gesture.Pinch()
      .onBegin(() => {
        savedZoom.value = zoomShared.value;
      })
      .onUpdate((event) => {
        const next = savedZoom.value + (event.scale - 1) * PINCH_SENSITIVITY;
        const clamped = Math.min(MAX_ZOOM, Math.max(0, next));
        zoomShared.value = clamped;
        runOnJS(applyZoom)(clamped);
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        const next = zoomShared.value > 0.05 ? 0 : DOUBLE_TAP_ZOOM;
        runOnJS(applyZoom)(next);
      });

    const gesture = Gesture.Simultaneous(pinch, doubleTap);

    return (
      <GestureHandlerRootView style={[styles.root, style]}>
        <GestureDetector gesture={gesture}>
          <View style={styles.previewSlot} collapsable={false}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              mirror={facing === 'front'}
              pictureSize={pictureSize}
              zoom={zoom}
              onCameraReady={onCameraReady}
            />
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  },
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  previewSlot: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});
