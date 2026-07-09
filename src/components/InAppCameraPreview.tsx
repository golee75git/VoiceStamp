import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { CameraView } from 'expo-camera';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

const MAX_ZOOM = 1;
const DOUBLE_TAP_ZOOM = 0.45;
const PINCH_SENSITIVITY = 0.4;

type InAppCameraPreviewProps = {
  cameraRef: React.RefObject<CameraView | null>;
  pictureSize?: string;
  onCameraReady: () => void;
  style?: StyleProp<ViewStyle>;
};

export function InAppCameraPreview({
  cameraRef,
  pictureSize,
  onCameraReady,
  style,
}: InAppCameraPreviewProps) {
  const [zoom, setZoom] = useState(0);
  const zoomShared = useSharedValue(0);
  const savedZoom = useSharedValue(0);

  useEffect(() => {
    zoomShared.value = 0;
    setZoom(0);
  }, [zoomShared]);

  const applyZoom = useCallback(
    (value: number) => {
      const clamped = Math.min(MAX_ZOOM, Math.max(0, value));
      zoomShared.value = clamped;
      setZoom(clamped);
    },
    [zoomShared],
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
            facing="back"
            pictureSize={pictureSize}
            zoom={zoom}
            onCameraReady={onCameraReady}
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

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
