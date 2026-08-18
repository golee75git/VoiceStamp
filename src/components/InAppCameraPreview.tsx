import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { CameraView, type CameraType } from 'expo-camera';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

const MAX_ZOOM = 1;
const DOUBLE_TAP_ZOOM = 0.45;
const PINCH_SENSITIVITY = 0.4;

/** Portrait still frame (width / height) matching typical 4:3 capture. */
const STILL_FRAME_RATIO = 3 / 4;

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
  /** When true, QR in the preview is reported (http(s) filter is the parent's job). */
  httpQrListen?: boolean;
  onPreviewHttpQr?: (raw: string) => void;
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

function fitStillFrame(maxWidth: number, maxHeight: number): { width: number; height: number } {
  let width = maxWidth;
  let height = width / STILL_FRAME_RATIO;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * STILL_FRAME_RATIO;
  }
  return { width, height };
}

export const InAppCameraPreview = forwardRef<InAppCameraPreviewHandle, InAppCameraPreviewProps>(
  function InAppCameraPreview(
    {
      cameraRef,
      facing = 'back',
      pictureSize,
      onCameraReady,
      onZoomChange,
      httpQrListen = false,
      onPreviewHttpQr,
      style,
    },
    ref,
  ) {
    const [zoom, setZoom] = useState(0);
    const [lensReady, setLensReady] = useState(false);
    const [frame, setFrame] = useState({ width: 0, height: 0 });
    const zoomShared = useSharedValue(0);
    const savedZoom = useSharedValue(0);
    const onZoomChangeRef = useRef(onZoomChange);
    onZoomChangeRef.current = onZoomChange;
    const onPreviewHttpQrRef = useRef(onPreviewHttpQr);
    onPreviewHttpQrRef.current = onPreviewHttpQr;
    const onCameraReadyRef = useRef(onCameraReady);
    onCameraReadyRef.current = onCameraReady;

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
      setLensReady(false);
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

    const handleLensReady = useCallback(() => {
      setLensReady(true);
      onCameraReadyRef.current();
    }, []);

    const handlePreviewQr = useCallback((result: { data?: string }) => {
      const raw = String(result?.data || '').trim();
      if (!raw) {
        return;
      }
      onPreviewHttpQrRef.current?.(raw);
    }, []);

    const handleRootLayout = useCallback((event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (!(width > 0) || !(height > 0)) {
        return;
      }
      const next = fitStillFrame(width, height);
      setFrame((prev) => {
        if (Math.abs(prev.width - next.width) < 0.5 && Math.abs(prev.height - next.height) < 0.5) {
          return prev;
        }
        return next;
      });
    }, []);

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

    const listenQr = lensReady && httpQrListen;
    const hasFrame = frame.width > 0 && frame.height > 0;

    return (
      <GestureHandlerRootView style={[styles.root, style]} onLayout={handleRootLayout}>
        {hasFrame ? (
          <GestureDetector gesture={gesture}>
            <View style={{ width: frame.width, height: frame.height }} collapsable={false}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                mirror={facing === 'front'}
                pictureSize={pictureSize}
                ratio={Platform.OS === 'android' ? '4:3' : undefined}
                animateShutter={false}
                zoom={zoom}
                barcodeScannerSettings={listenQr ? { barcodeTypes: ['qr'] } : undefined}
                onBarcodeScanned={listenQr ? handlePreviewQr : undefined}
                onCameraReady={handleLensReady}
              />
            </View>
          </GestureDetector>
        ) : null}
      </GestureHandlerRootView>
    );
  },
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  camera: {
    flex: 1,
  },
});
