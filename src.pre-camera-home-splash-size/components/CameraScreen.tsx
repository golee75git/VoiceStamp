import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import { CaptureActionSheet } from './CaptureActionSheet';
import { takePhotoWithSystemCamera } from '../services/pickStampImage';
import { getCurrentLocationSnapshot, type LocationSnapshot } from '../services/locationService';
import { saveQuickCapture, type QuickCaptureLocation } from '../services/quickCaptureSave';
import { getCameraHand, getContinuousCaptureCamera, type CameraHand } from '../services/settingsService';
import type { CaptureStampForExport } from '../services/exportStampImage';
import { pickLargestPictureSize } from '../utils/cameraPictureSize';
import { StampSaveModal } from './StampSaveModal';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const listIcon = require('../../assets/list-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const settingsIcon = require('../../assets/settings-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cameraHomeImage = require('../../assets/camera-home.png');

type CameraScreenProps = {
  refreshKey: number;
  onOpenList: () => void;
  onOpenSettings: () => void;
  onSaved: () => void;
  captureStampForExport: CaptureStampForExport;
};

export function CameraScreen({
  refreshKey,
  onOpenList,
  onOpenSettings,
  onSaved,
  captureStampForExport,
}: CameraScreenProps) {
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [pendingCaptureUri, setPendingCaptureUri] = useState<string | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [busyHint, setBusyHint] = useState<string | null>(null);
  const [cameraHand, setCameraHand] = useState<CameraHand>('right');
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [readyToLaunch, setReadyToLaunch] = useState(Platform.OS === 'web');
  const savedAndClosingRef = useRef(false);
  const launchingRef = useRef(false);
  const actionSheetVisibleRef = useRef(false);
  const prefetchForUriRef = useRef<string | null>(null);
  const prefetchCancelledRef = useRef(false);
  const [prefetchedLocation, setPrefetchedLocation] = useState<LocationSnapshot | null>(null);
  const [locationPrefetchLoading, setLocationPrefetchLoading] = useState(false);
  const [inAppContinuousActive, setInAppContinuousActive] = useState(false);
  const [inAppCameraReady, setInAppCameraReady] = useState(false);
  const [inAppCapturing, setInAppCapturing] = useState(false);
  const [inAppPictureSize, setInAppPictureSize] = useState<string | undefined>();
  const cameraRef = useRef<CameraView>(null);
  const reuseLocationRef = useRef<QuickCaptureLocation | null>(null);
  const isWeb = Platform.OS === 'web';

  const cancelLocationPrefetch = useCallback(() => {
    prefetchCancelledRef.current = true;
    prefetchForUriRef.current = null;
    setPrefetchedLocation(null);
    setLocationPrefetchLoading(false);
  }, []);

  const startLocationPrefetch = useCallback((uri: string) => {
    prefetchForUriRef.current = uri;
    prefetchCancelledRef.current = false;
    setPrefetchedLocation(null);
    setLocationPrefetchLoading(true);

    void (async () => {
      try {
        const snapshot = await getCurrentLocationSnapshot();
        if (prefetchCancelledRef.current || prefetchForUriRef.current !== uri) {
          return;
        }
        setPrefetchedLocation(snapshot);
      } finally {
        if (!prefetchCancelledRef.current && prefetchForUriRef.current === uri) {
          setLocationPrefetchLoading(false);
        }
      }
    })();
  }, []);

  useEffect(() => {
    getCameraHand().then(setCameraHand);
  }, [refreshKey]);

  const openSaveModal = useCallback((uri: string) => {
    setCapturedUri(uri);
    setModalVisible(true);
  }, []);

  const handleCameraError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : '移대찓?쇱뿉 ?ㅽ뙣?덉뒿?덈떎.';
    Alert.alert('移대찓??, message);
  }, []);

  const showCaptureActionSheet = useCallback(
    (uri: string) => {
      actionSheetVisibleRef.current = true;
      setPendingCaptureUri(uri);
      setActionSheetVisible(true);
      startLocationPrefetch(uri);
    },
    [startLocationPrefetch],
  );

  const clearCaptureActionSheet = useCallback(() => {
    actionSheetVisibleRef.current = false;
    setActionSheetVisible(false);
    setPendingCaptureUri(null);
  }, []);

  const runContinuousCaptureLoop = useCallback(
    async (firstUri: string, initialLocation?: QuickCaptureLocation) => {
      let nextUri: string | null = firstUri;
      let reuseLocation: QuickCaptureLocation | null = initialLocation ?? null;
      while (nextUri) {
        setCameraBusy(true);
        setBusyHint('???以묅?);
        try {
          const savedLocation = await saveQuickCapture({
            tempImageUri: nextUri,
            captureForExport: captureStampForExport,
            reuseLocation: reuseLocation ?? undefined,
          });
          if (savedLocation) {
            reuseLocation = savedLocation;
          }
          onSaved();
        } catch (error) {
          handleCameraError(error);
          openSaveModal(nextUri);
          return;
        } finally {
          setBusyHint(null);
        }

        setBusyHint(isWeb ? '移대찓???щ뒗 以묅? : '?쒖뒪??移대찓???щ뒗 以묅?);
        launchingRef.current = true;
        try {
          nextUri = await takePhotoWithSystemCamera();
        } catch (error) {
          setAutoLaunch(false);
          handleCameraError(error);
          return;
        } finally {
          launchingRef.current = false;
          setCameraBusy(false);
          setBusyHint(null);
        }
      }
      setAutoLaunch(false);
    },
    [captureStampForExport, handleCameraError, isWeb, onSaved, openSaveModal],
  );

  const exitInAppContinuous = useCallback(() => {
    setInAppContinuousActive(false);
    setInAppCameraReady(false);
    setInAppCapturing(false);
    reuseLocationRef.current = null;
    setAutoLaunch(false);
  }, []);

  const startInAppContinuousCapture = useCallback(
    async (firstUri: string, initialLocation?: QuickCaptureLocation) => {
      setCameraBusy(true);
      setBusyHint('???以묅?);
      try {
        let reuseLocation: QuickCaptureLocation | null = initialLocation ?? null;
        const savedLocation = await saveQuickCapture({
          tempImageUri: firstUri,
          captureForExport: captureStampForExport,
          reuseLocation: reuseLocation ?? undefined,
        });
        if (savedLocation) {
          reuseLocation = savedLocation;
        }
        reuseLocationRef.current = reuseLocation;
        onSaved();
        setInAppContinuousActive(true);
      } catch (error) {
        handleCameraError(error);
        openSaveModal(firstUri);
      } finally {
        setCameraBusy(false);
        setBusyHint(null);
      }
    },
    [captureStampForExport, handleCameraError, onSaved, openSaveModal],
  );

  const handleInAppCameraReady = useCallback(async () => {
    setInAppCameraReady(true);
    try {
      const sizes = await cameraRef.current?.getAvailablePictureSizesAsync();
      const largest = sizes?.length ? pickLargestPictureSize(sizes) : undefined;
      if (largest) {
        setInAppPictureSize(largest);
      }
    } catch {
      // Keep default picture size when sizes are unavailable.
    }
  }, []);

  const handleInAppContinuousShutter = useCallback(async () => {
    if (!cameraRef.current || inAppCapturing || !inAppCameraReady || cameraBusy) {
      return;
    }

    setInAppCapturing(true);
    setCameraBusy(true);
    setBusyHint('???以묅?);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        return;
      }

      const savedLocation = await saveQuickCapture({
        tempImageUri: photo.uri,
        captureForExport: captureStampForExport,
        reuseLocation: reuseLocationRef.current ?? undefined,
      });
      if (savedLocation) {
        reuseLocationRef.current = savedLocation;
      }
      onSaved();
    } catch (error) {
      handleCameraError(error);
    } finally {
      setInAppCapturing(false);
      setCameraBusy(false);
      setBusyHint(null);
    }
  }, [
    cameraBusy,
    captureStampForExport,
    handleCameraError,
    inAppCameraReady,
    inAppCapturing,
    onSaved,
  ]);

  const handleCapturedUri = useCallback(
    (uri: string) => {
      showCaptureActionSheet(uri);
    },
    [showCaptureActionSheet],
  );

  const openSystemCamera = useCallback(async () => {
    if (
      cameraBusy ||
      modalVisible ||
      actionSheetVisibleRef.current ||
      launchingRef.current ||
      inAppContinuousActive
    ) {
      return;
    }

    launchingRef.current = true;
    setCameraBusy(true);
    setBusyHint(isWeb ? '移대찓???щ뒗 以묅? : '?쒖뒪??移대찓???щ뒗 以묅?);
    try {
      const uri = await takePhotoWithSystemCamera();
      if (uri) {
        handleCapturedUri(uri);
      } else {
        setAutoLaunch(false);
      }
    } catch (error) {
      setAutoLaunch(false);
      handleCameraError(error);
    } finally {
      launchingRef.current = false;
      setCameraBusy(false);
      setBusyHint(null);
    }
  }, [cameraBusy, modalVisible, handleCameraError, handleCapturedUri, inAppContinuousActive, isWeb]);

  const handleActionRetake = useCallback(() => {
    cancelLocationPrefetch();
    clearCaptureActionSheet();
    void openSystemCamera();
  }, [cancelLocationPrefetch, clearCaptureActionSheet, openSystemCamera]);

  const handleActionSave = useCallback(() => {
    const uri = pendingCaptureUri;
    clearCaptureActionSheet();
    if (uri) {
      openSaveModal(uri);
    }
  }, [clearCaptureActionSheet, openSaveModal, pendingCaptureUri]);

  const handleActionContinuous = useCallback(() => {
    const uri = pendingCaptureUri;
    const initialLocation =
      prefetchedLocation &&
      prefetchedLocation.latitude != null &&
      prefetchedLocation.longitude != null
        ? {
            latitude: prefetchedLocation.latitude,
            longitude: prefetchedLocation.longitude,
            placeLabel: prefetchedLocation.placeLabel,
          }
        : undefined;
    clearCaptureActionSheet();
    if (!uri) {
      return;
    }

    void (async () => {
      const mode = isWeb ? 'system' : await getContinuousCaptureCamera();
      if (mode === 'in_app') {
        await startInAppContinuousCapture(uri, initialLocation);
        return;
      }
      await runContinuousCaptureLoop(uri, initialLocation);
    })();
  }, [
    clearCaptureActionSheet,
    pendingCaptureUri,
    prefetchedLocation,
    isWeb,
    startInAppContinuousCapture,
    runContinuousCaptureLoop,
  ]);

  useEffect(() => {
    if (!inAppContinuousActive) {
      return;
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      exitInAppContinuous();
      return true;
    });

    return () => sub.remove();
  }, [exitInAppContinuous, inAppContinuousActive]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const pending = await ImagePicker.getPendingResultAsync();
        if (cancelled) {
          return;
        }
        if (pending && 'assets' in pending && !pending.canceled && pending.assets?.[0]?.uri) {
          handleCapturedUri(pending.assets[0].uri);
          setAutoLaunch(false);
        }
      } finally {
        if (!cancelled) {
          setReadyToLaunch(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handleCapturedUri]);

  useEffect(() => {
    if (
      !readyToLaunch ||
      !permission?.granted ||
      !autoLaunch ||
      modalVisible ||
      cameraBusy ||
      actionSheetVisible ||
      inAppContinuousActive
    ) {
      return;
    }
    if (Platform.OS === 'web') {
      return;
    }

    void openSystemCamera();
  }, [
    readyToLaunch,
    permission?.granted,
    autoLaunch,
    modalVisible,
    cameraBusy,
    actionSheetVisible,
    inAppContinuousActive,
    openSystemCamera,
    refreshKey,
  ]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>移대찓??沅뚰븳 ?뺤씤 以?..</Text>
      </View>
    );
  }

  if (!isWeb && !permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>?ъ쭊 珥ъ쁺???꾪빐 移대찓??沅뚰븳???꾩슂?⑸땲??</Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>沅뚰븳 ?덉슜</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onOpenList}>
          <Text style={styles.secondaryButtonText}>紐⑸줉?쇰줈 (?⑤쾾)</Text>
        </Pressable>
      </View>
    );
  }

  if (inAppContinuousActive && !isWeb) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.inAppCamera}
          facing="back"
          pictureSize={inAppPictureSize}
          onCameraReady={() => void handleInAppCameraReady()}
        />

        <View style={styles.inAppTopBar}>
          <Text style={styles.inAppTitle}>?곗냽 珥ъ쁺</Text>
          <Text style={styles.inAppHint}>?뷀꽣 ?????쨌 ?꾨즺濡?醫낅즺</Text>
        </View>

        <View
          style={[
            styles.inAppSideNav,
            cameraHand === 'left' ? styles.sideNavLeft : styles.sideNavRight,
          ]}
        >
          <Pressable
            style={styles.inAppDoneButton}
            onPress={exitInAppContinuous}
            disabled={cameraBusy || inAppCapturing}
            accessibilityLabel="?곗냽 珥ъ쁺 ?꾨즺"
          >
            <Text style={styles.inAppDoneButtonText}>?꾨즺</Text>
          </Pressable>
        </View>

        <View style={styles.inAppBottomBar}>
          <Pressable
            style={styles.inAppShutterOuter}
            onPress={() => void handleInAppContinuousShutter()}
            disabled={!inAppCameraReady || cameraBusy || inAppCapturing}
            accessibilityRole="button"
            accessibilityLabel="珥ъ쁺"
          >
            <View style={styles.inAppShutterInner} />
          </Pressable>
        </View>

        {cameraBusy ? (
          <View style={styles.busyOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.launcherHint}>{busyHint ?? '???以묅?}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.launcher}>
        <Image
          source={cameraHomeImage}
          style={styles.launcherImage}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Pressable
          style={styles.launchCaptureButton}
          onPress={() => void openSystemCamera()}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityRole="button"
          accessibilityLabel="?ъ쭊 珥ъ쁺"
        >
          <View style={styles.launchCaptureInner} />
        </Pressable>
        {cameraBusy ? (
          <View style={styles.busyOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.launcherHint}>
              {busyHint ?? (isWeb ? '移대찓???щ뒗 以묅? : '?쒖뒪??移대찓???щ뒗 以묅?)}
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.sideNav,
          cameraHand === 'left' ? styles.sideNavLeft : styles.sideNavRight,
        ]}
      >
        <Pressable
          style={[styles.navButton, styles.navIconButton]}
          onPress={onOpenList}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityLabel="紐⑸줉"
        >
          <Image source={listIcon} style={styles.navIcon} resizeMode="contain" />
        </Pressable>
        <Pressable
          style={[styles.navButton, styles.navIconButton]}
          onPress={onOpenSettings}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityLabel="?ㅼ젙"
        >
          <Image source={settingsIcon} style={styles.navIcon} resizeMode="contain" />
        </Pressable>
      </View>

      <CaptureActionSheet
        visible={actionSheetVisible}
        imageUri={pendingCaptureUri}
        locationPrefetchLoading={locationPrefetchLoading}
        onRetake={handleActionRetake}
        onSave={handleActionSave}
        onContinuous={handleActionContinuous}
      />

      <StampSaveModal
        visible={modalVisible}
        imageUri={capturedUri}
        captureStampForExport={captureStampForExport}
        prefetchedLocationSnapshot={prefetchedLocation}
        locationPrefetchLoading={locationPrefetchLoading}
        onClose={() => {
          setModalVisible(false);
          setCapturedUri(null);
          cancelLocationPrefetch();
          savedAndClosingRef.current = false;
          setAutoLaunch(false);
        }}
        onSaved={() => {
          savedAndClosingRef.current = true;
          onSaved();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  launcher: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
    gap: 20,
  },
  launcherImage: {
    width: '88%',
    height: '50%',
  },
  launchCaptureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchCaptureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  launcherHint: {
    color: '#d1d5db',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  sideNav: {
    position: 'absolute',
    bottom: 48,
    gap: 8,
    zIndex: 10,
  },
  sideNavLeft: {
    left: 16,
    alignItems: 'flex-start',
  },
  sideNavRight: {
    right: 16,
    alignItems: 'flex-end',
  },
  navButton: {
    width: 76,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  navIcon: {
    width: 40,
    height: 40,
  },
  inAppCamera: {
    flex: 1,
  },
  inAppTopBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 56,
    left: 16,
    right: 16,
    alignItems: 'center',
    gap: 4,
  },
  inAppTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  inAppHint: {
    color: '#e5e7eb',
    fontSize: 13,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  inAppSideNav: {
    position: 'absolute',
    bottom: 120,
    zIndex: 10,
  },
  inAppDoneButton: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inAppDoneButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  inAppBottomBar: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  inAppShutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inAppShutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
});
