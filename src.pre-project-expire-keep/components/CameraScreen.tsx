import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';
import { CameraView, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import { CaptureActionSheet } from './CaptureActionSheet';
import { FieldTemplateSheet } from './FieldTemplateSheet';
import { takePhotoWithSystemCamera } from '../services/pickStampImage';
import { getCurrentLocationSnapshot, getFastLocationSnapshot, type LocationSnapshot } from '../services/locationService';
import { saveQuickCapture, type QuickCaptureLocation } from '../services/quickCaptureSave';
import { getCameraHand, getCameraHomeBg, getCaptureAfterMode, getContinuousCaptureCamera, getPrimaryCaptureCamera, getShutterSoundEnabled, isGpsPlaceEnabled, cameraHomeBgFill, type CameraHand, type CameraHomeBg } from '../services/settingsService';
import type { CaptureStampForExport } from '../services/exportStampImage';
import { STAMP_CAPTURE_JPEG_QUALITY } from '../constants/captureImageBudget';
import { pickPreferredStampPictureSize } from '../utils/cameraPictureSize';
import { loadStampSaveModalLayoutSettings } from '../services/stampSaveModalLayoutCache';
import { normalizeHttpUrl } from '../services/qrUrlExtractService';
import { StampSaveModal } from './StampSaveModal';
import {
  InAppCameraPreview,
  type InAppCameraPreviewHandle,
  type ZoomPreset,
  ZOOM_PRESET_VALUES,
} from './InAppCameraPreview';

import {
  subscribeProjectUploadFeedback,
} from '../services/projectUploadFeedback';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const listIcon = require('../../assets/list-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const listIconLeft = require('../../assets/list-icon-white-left.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const settingsIcon = require('../../assets/settings-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const settingsIconBlack = require('../../assets/settings-icon-black.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const templateIcon = require('../../assets/template-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const projectCollectIcon = require('../../assets/project-collect-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cameraHomeMainint = require('../../assets/camera-home.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cameraHomeMainint1 = require('../../assets/camera-home-mainint1.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cameraHomeLeftHand = require('../../assets/mainint1.png');

const CAMERA_HOME_IMAGES: Record<CameraHomeBg, number> = {
  mainint: cameraHomeMainint,
  mainint1: cameraHomeMainint1,
};

type CameraScreenProps = {
  refreshKey: number;
  onOpenList: () => void;
  onOpenSettings: () => void;
  onOpenProjectCollect?: () => void;
  onSaved: () => void;
  captureStampForExport: CaptureStampForExport;
};

type InAppCameraMode = 'single' | 'continuous';

export function CameraScreen({
  refreshKey,
  onOpenList,
  onOpenSettings,
  onOpenProjectCollect,
  onSaved,
  captureStampForExport,
}: CameraScreenProps) {
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [pendingCaptureUri, setPendingCaptureUri] = useState<string | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [templateSheetVisible, setTemplateSheetVisible] = useState(false);
  const [projectCollectEnabled, setProjectCollectEnabled] = useState(false);
  const [collectJoinName, setCollectJoinName] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [busyHint, setBusyHint] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const saveFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraHand, setCameraHand] = useState<CameraHand>('right');
  const [cameraHomeBg, setCameraHomeBg] = useState<CameraHomeBg>('mainint');
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [readyToLaunch, setReadyToLaunch] = useState(Platform.OS === 'web');
  const savedAndClosingRef = useRef(false);
  const launchingRef = useRef(false);
  const actionSheetVisibleRef = useRef(false);
  const prefetchForUriRef = useRef<string | null>(null);
  const prefetchCancelledRef = useRef(false);
  const [prefetchedLocation, setPrefetchedLocation] = useState<LocationSnapshot | null>(null);
  const [locationPrefetchLoading, setLocationPrefetchLoading] = useState(false);
  const [locationPrefetchFinished, setLocationPrefetchFinished] = useState(false);
  const [inAppCameraMode, setInAppCameraMode] = useState<InAppCameraMode | null>(null);
  const [inAppCameraReady, setInAppCameraReady] = useState(false);
  const [inAppCapturing, setInAppCapturing] = useState(false);
  const [inAppPictureSize, setInAppPictureSize] = useState<string | undefined>();
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const previewRef = useRef<InAppCameraPreviewHandle>(null);
  const [zoomPreset, setZoomPreset] = useState<ZoomPreset | null>(1);
  const [previewOpenHref, setPreviewOpenHref] = useState<string | null>(null);
  const [hrefLocked, setHrefLocked] = useState(false);
  const [saveSeedSourceUrl, setSaveSeedSourceUrl] = useState<string | null>(null);
  const previewHrefRef = useRef<string | null>(null);
  const lensReadyWaiterRef = useRef<(() => void) | null>(null);
  const reuseLocationRef = useRef<QuickCaptureLocation | null>(null);
  const prefetchedLocationRef = useRef<LocationSnapshot | null>(null);
  const locationPrefetchRunningRef = useRef(false);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    prefetchedLocationRef.current = prefetchedLocation;
  }, [prefetchedLocation]);

  const cancelLocationPrefetch = useCallback(() => {
    prefetchCancelledRef.current = true;
    prefetchForUriRef.current = null;
    locationPrefetchRunningRef.current = false;
    setPrefetchedLocation(null);
    setLocationPrefetchLoading(false);
    setLocationPrefetchFinished(false);
  }, []);

  const runLocationPrefetch = useCallback(async (captureKey: string, clearSnapshot: boolean) => {
    if (!(await isGpsPlaceEnabled())) {
      setLocationPrefetchFinished(true);
      setLocationPrefetchLoading(false);
      return;
    }

    prefetchCancelledRef.current = false;
    prefetchForUriRef.current = captureKey;
    locationPrefetchRunningRef.current = true;
    if (clearSnapshot) {
      setPrefetchedLocation(null);
      setLocationPrefetchFinished(false);
    }
    setLocationPrefetchLoading(true);

    let fast: LocationSnapshot | null = null;
    try {
      fast = await getFastLocationSnapshot();
      if (!prefetchCancelledRef.current && prefetchForUriRef.current === captureKey) {
        if (fast) {
          setPrefetchedLocation(fast);
        }
        setLocationPrefetchLoading(false);
      }
    } catch {
      if (!prefetchCancelledRef.current && prefetchForUriRef.current === captureKey) {
        setLocationPrefetchLoading(false);
      }
    }

    if (prefetchCancelledRef.current || prefetchForUriRef.current !== captureKey) {
      locationPrefetchRunningRef.current = false;
      return;
    }

    try {
      const refined = await getCurrentLocationSnapshot();
      if (!prefetchCancelledRef.current && prefetchForUriRef.current === captureKey) {
        setPrefetchedLocation(refined ?? fast ?? prefetchedLocationRef.current);
      }
    } finally {
      if (!prefetchCancelledRef.current && prefetchForUriRef.current === captureKey) {
        setLocationPrefetchFinished(true);
        locationPrefetchRunningRef.current = false;
      }
    }
  }, []);

  const startLocationWarmup = useCallback(() => {
    if (locationPrefetchRunningRef.current) {
      return;
    }
    void runLocationPrefetch('warmup', !prefetchedLocationRef.current);
  }, [runLocationPrefetch]);

  const startLocationPrefetch = useCallback(
    (uri: string) => {
      if (prefetchedLocationRef.current?.placeLabel) {
        prefetchForUriRef.current = uri;
        if (!locationPrefetchRunningRef.current) {
          void runLocationPrefetch(uri, false);
        }
        return;
      }
      void runLocationPrefetch(uri, !prefetchedLocationRef.current);
    },
    [runLocationPrefetch],
  );

  useEffect(() => {
    getCameraHand().then(setCameraHand);
    getCameraHomeBg().then(setCameraHomeBg);
    void loadStampSaveModalLayoutSettings();
    if (Platform.OS === 'web') {
      setProjectCollectEnabled(false);
      setCollectJoinName(null);
    } else {
      void import('../services/projectCollectSettings').then(
        ({ getProjectCollectEnabled, getProjectJoin }) => {
          void getProjectCollectEnabled().then(setProjectCollectEnabled);
          void getProjectJoin().then((join) => setCollectJoinName(join?.name ?? null));
        },
      );
    }
  }, [refreshKey]);


  useEffect(() => {
    const clearTimer = () => {
      if (saveFeedbackTimerRef.current) {
        clearTimeout(saveFeedbackTimerRef.current);
        saveFeedbackTimerRef.current = null;
      }
    };
    const unsub = subscribeProjectUploadFeedback((ev) => {
      let text: string | null = null;
      let holdMs = 2500;
      switch (ev.type) {
        case 'saved_local':
          text = '저장됨';
          holdMs = 2000;
          break;
        case 'upload_queued':
        case 'uploading':
          text = `올리는 중 · ${ev.projectName}`;
          holdMs = 5000;
          break;
        case 'synced':
          text = `전송 완료 · ${ev.projectName}`;
          holdMs = 2500;
          break;
        case 'failed':
          text = `전송 실패 · ${ev.projectName}`;
          holdMs = 3500;
          break;
        default:
          break;
      }
      if (!text) return;
      clearTimer();
      setSaveFeedback(text);
      saveFeedbackTimerRef.current = setTimeout(() => {
        setSaveFeedback(null);
        saveFeedbackTimerRef.current = null;
      }, holdMs);
    });
    return () => {
      clearTimer();
      unsub();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    const refreshCollectFlag = () => {
      void import('../services/projectCollectSettings').then(
        ({ getProjectCollectEnabled, getProjectJoin }) => {
          void getProjectCollectEnabled().then(setProjectCollectEnabled);
          void getProjectJoin().then((join) => setCollectJoinName(join?.name ?? null));
        },
      );
    };
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        refreshCollectFlag();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (isWeb || !permission?.granted) {
      return;
    }
    startLocationWarmup();
  }, [isWeb, permission?.granted, refreshKey, startLocationWarmup]);

  useEffect(() => {
    if (isWeb) {
      return;
    }

    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState !== 'active' && launchingRef.current) {
        setCameraBusy(false);
        setBusyHint(null);
      }
    });

    return () => sub.remove();
  }, [isWeb]);

  const openSaveModal = useCallback((uri: string, seedSourceUrl?: string | null) => {
    setSaveSeedSourceUrl(seedSourceUrl ?? null);
    setCapturedUri(uri);
    setModalVisible(true);
  }, []);

  const handleCameraError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : '카메라에 실패했습니다.';
    Alert.alert('카메라', message);
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

  const clearCaptureBusy = useCallback(() => {
    launchingRef.current = false;
    setCameraBusy(false);
    setBusyHint(null);
  }, []);

  const handleCapturedUri = useCallback(
    async (uri: string, seedSourceUrl?: string | null) => {
      setCameraBusy(true);
      setBusyHint('처리 중…');
      setSaveSeedSourceUrl(seedSourceUrl ?? null);
      try {
        const mode = await getCaptureAfterMode();
        if (mode === 'save_modal') {
          startLocationPrefetch(uri);
          openSaveModal(uri, seedSourceUrl);
          return;
        }
        showCaptureActionSheet(uri);
      } catch (error) {
        handleCameraError(error);
        clearCaptureBusy();
      }
    },
    [clearCaptureBusy, handleCameraError, openSaveModal, showCaptureActionSheet, startLocationPrefetch],
  );

  useEffect(() => {
    if (modalVisible || actionSheetVisible) {
      clearCaptureBusy();
    }
  }, [actionSheetVisible, clearCaptureBusy, modalVisible]);

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
        setBusyHint('저장 중…');
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

        setBusyHint(isWeb ? '카메라 여는 중…' : '시스템 카메라 여는 중…');
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

  const exitInAppCamera = useCallback(() => {
    setInAppCameraMode(null);
    setInAppCameraReady(false);
    setZoomPreset(1);
    setCameraFacing('back');
    setInAppPictureSize(undefined);
    setInAppCapturing(false);
    setPreviewOpenHref(null);
    setHrefLocked(false);
    previewHrefRef.current = null;
    reuseLocationRef.current = null;
    setAutoLaunch(false);
  }, []);

  const startInAppContinuousCapture = useCallback(
    async (firstUri: string, initialLocation?: QuickCaptureLocation) => {
      setCameraBusy(true);
      setBusyHint('저장 중…');
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
        setInAppCameraMode('continuous');
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
    const waiter = lensReadyWaiterRef.current;
    if (waiter) {
      lensReadyWaiterRef.current = null;
      waiter();
    }
    try {
      const sizes = await cameraRef.current?.getAvailablePictureSizesAsync();
      const preferred = sizes?.length ? pickPreferredStampPictureSize(sizes) : undefined;
      if (preferred) {
        setInAppPictureSize((prev) => prev || preferred);
      }
    } catch {
      // Keep default picture size when sizes are unavailable.
    }
  }, []);

  const toggleCameraFacing = useCallback(() => {
    if (cameraBusy || inAppCapturing) {
      return;
    }
    setInAppCameraReady(false);
    setInAppPictureSize(undefined);
    setZoomPreset(1);
    setPreviewOpenHref(null);
    setHrefLocked(false);
    previewHrefRef.current = null;
    setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, [cameraBusy, inAppCapturing]);

  const handlePreviewHttpQr = useCallback((raw: string) => {
    const href = normalizeHttpUrl(raw);
    if (!href) {
      return;
    }
    previewHrefRef.current = href;
    setPreviewOpenHref((prev) => (prev === href ? prev : href));
    setHrefLocked(true);
  }, []);

  const openPreviewHref = useCallback(async () => {
    if (!previewOpenHref) {
      return;
    }
    try {
      await Linking.openURL(previewOpenHref);
    } catch {
      Alert.alert('주소', '이 주소를 열 수 없습니다.');
    }
  }, [previewOpenHref]);

  const waitLensReadyAfterUnbind = useCallback(() => {
    return new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        if (lensReadyWaiterRef.current === finish) {
          lensReadyWaiterRef.current = null;
        }
        resolve();
      };
      lensReadyWaiterRef.current = finish;
      setTimeout(finish, 200);
    });
  }, []);

  const handleInAppShutter = useCallback(async () => {
    if (!cameraRef.current || inAppCapturing || !inAppCameraReady || cameraBusy || !inAppCameraMode) {
      return;
    }

    const seedHref = previewOpenHref ?? previewHrefRef.current ?? null;
    const needUnbind = !hrefLocked;
    previewHrefRef.current = seedHref;
    setHrefLocked(true);
    setPreviewOpenHref(null);

    setInAppCapturing(true);
    setCameraBusy(true);
    setBusyHint(inAppCameraMode === 'continuous' ? '저장 중…' : '처리 중…');
    startLocationWarmup();
    try {
      if (needUnbind) {
        await waitLensReadyAfterUnbind();
      }
      const shutterSound = await getShutterSoundEnabled();
      const photo = await cameraRef.current.takePictureAsync({
        quality: STAMP_CAPTURE_JPEG_QUALITY,
        skipProcessing: false,
        shutterSound,
      });
      if (!photo?.uri) {
        if (seedHref) {
          setPreviewOpenHref(seedHref);
        }
        return;
      }

      if (inAppCameraMode === 'single') {
        setInAppCameraMode(null);
        setInAppCameraReady(false);
        previewHrefRef.current = null;
        await handleCapturedUri(photo.uri, seedHref);
        return;
      }

      const savedLocation = await saveQuickCapture({
        tempImageUri: photo.uri,
        captureForExport: captureStampForExport,
        reuseLocation: reuseLocationRef.current ?? undefined,
        sourceUrl: seedHref || undefined,
      });
      previewHrefRef.current = null;
      if (savedLocation) {
        reuseLocationRef.current = savedLocation;
      }
      onSaved();
    } catch (error) {
      if (seedHref) {
        setPreviewOpenHref(seedHref);
      }
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
    handleCapturedUri,
    hrefLocked,
    inAppCameraMode,
    inAppCameraReady,
    inAppCapturing,
    onSaved,
    previewOpenHref,
    startLocationWarmup,
    waitLensReadyAfterUnbind,
  ]);

  const openSystemCamera = useCallback(async () => {
    if (
      cameraBusy ||
      modalVisible ||
      actionSheetVisibleRef.current ||
      launchingRef.current ||
      inAppCameraMode !== null
    ) {
      return;
    }

    launchingRef.current = true;
    setCameraBusy(true);
    setBusyHint(isWeb ? '카메라 여는 중…' : '시스템 카메라 여는 중…');
    startLocationWarmup();
    let postCapturePending = false;
    try {
      const uri = await takePhotoWithSystemCamera();
      if (uri) {
        postCapturePending = true;
        await handleCapturedUri(uri);
        return;
      }
      setAutoLaunch(false);
    } catch (error) {
      setAutoLaunch(false);
      handleCameraError(error);
    } finally {
      if (!postCapturePending) {
        clearCaptureBusy();
      }
    }
  }, [
    cameraBusy,
    modalVisible,
    clearCaptureBusy,
    handleCameraError,
    handleCapturedUri,
    inAppCameraMode,
    isWeb,
    startLocationWarmup,
  ]);

  const openInAppCamera = useCallback(
    (mode: InAppCameraMode) => {
      if (
        cameraBusy ||
        modalVisible ||
        actionSheetVisibleRef.current ||
        launchingRef.current ||
        inAppCameraMode !== null
      ) {
        return;
      }
      startLocationWarmup();
      setInAppCameraReady(false);
      setInAppCameraMode(mode);
    },
    [cameraBusy, inAppCameraMode, modalVisible, startLocationWarmup],
  );

  const openPrimaryCapture = useCallback(async () => {
    if (isWeb) {
      await openSystemCamera();
      return;
    }
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        return;
      }
    }
    const mode = await getPrimaryCaptureCamera();
    if (mode === 'in_app') {
      openInAppCamera('single');
      return;
    }
    await openSystemCamera();
  }, [isWeb, openInAppCamera, openSystemCamera, permission?.granted, requestPermission]);

  const handleActionRetake = useCallback(() => {
    cancelLocationPrefetch();
    clearCaptureActionSheet();
    void openPrimaryCapture();
  }, [cancelLocationPrefetch, clearCaptureActionSheet, openPrimaryCapture]);

  const handleActionSave = useCallback(() => {
    const uri = pendingCaptureUri;
    const seed = saveSeedSourceUrl;
    clearCaptureActionSheet();
    if (uri) {
      openSaveModal(uri, seed);
    }
  }, [clearCaptureActionSheet, openSaveModal, pendingCaptureUri, saveSeedSourceUrl]);

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
    if (!inAppCameraMode) {
      return;
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      exitInAppCamera();
      return true;
    });

    return () => sub.remove();
  }, [exitInAppCamera, inAppCameraMode]);

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
          await handleCapturedUri(pending.assets[0].uri);
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
      inAppCameraMode !== null
    ) {
      return;
    }
    if (Platform.OS === 'web') {
      return;
    }

    void openPrimaryCapture();
  }, [
    readyToLaunch,
    permission?.granted,
    autoLaunch,
    modalVisible,
    cameraBusy,
    actionSheetVisible,
    inAppCameraMode,
    openPrimaryCapture,
    refreshKey,
  ]);

  // permission === null: show launcher immediately (avoid "권한 확인 중" flash)
  if (!isWeb && permission && !permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>사진 촬영을 위해 카메라 권한이 필요합니다.</Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>권한 허용</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onOpenList}>
          <Text style={styles.secondaryButtonText}>목록으로 (앨범)</Text>
        </Pressable>
      </View>
    );
  }

  if (inAppCameraMode && !isWeb) {
    const isContinuous = inAppCameraMode === 'continuous';
    return (
      <View style={styles.container}>
        <InAppCameraPreview
          ref={previewRef}
          cameraRef={cameraRef}
          facing={cameraFacing}
          pictureSize={inAppPictureSize}
          style={styles.inAppCamera}
          httpQrListen={inAppCameraReady && !hrefLocked && !inAppCapturing && !cameraBusy}
          onPreviewHttpQr={handlePreviewHttpQr}
          onCameraReady={() => void handleInAppCameraReady()}
          onZoomChange={(_zoom, preset) => setZoomPreset(preset)}
        />

        <View style={styles.inAppTopBar}>
          <Text style={styles.inAppTitle}>{isContinuous ? '연속 촬영' : '사진 촬영'}</Text>
          <Text style={styles.inAppHint}>
            {isContinuous
              ? '전·후면 · 1x·3x·5x · 핀치·더블탭 · 셔터 → 저장 · 완료로 종료'
              : '전·후면 · 1x·3x·5x · 핀치·더블탭 · 셔터 → 확인 · 취소로 돌아가기'}
          </Text>
        </View>

        <View
          style={[
            styles.inAppSideNav,
            cameraHand === 'left' ? styles.sideNavLeft : styles.sideNavRight,
          ]}
        >
          <Pressable
            style={styles.inAppDoneButton}
            onPress={exitInAppCamera}
            disabled={cameraBusy || inAppCapturing}
            accessibilityLabel={isContinuous ? '연속 촬영 완료' : '촬영 취소'}
          >
            <Text style={styles.inAppDoneButtonText}>{isContinuous ? '완료' : '취소'}</Text>
          </Pressable>
        </View>

        <View style={styles.inAppBottomBar} pointerEvents="box-none">
          <View style={styles.zoomPresetRow} accessibilityRole="adjustable" accessibilityLabel="배율">
            {(Object.keys(ZOOM_PRESET_VALUES).map(Number) as ZoomPreset[]).map((preset) => {
              const selected = zoomPreset === preset;
              return (
                <Pressable
                  key={preset}
                  style={[styles.zoomPresetButton, selected && styles.zoomPresetButtonSelected]}
                  onPress={() => {
                    previewRef.current?.setZoomPreset(preset);
                    setZoomPreset(preset);
                  }}
                  disabled={!inAppCameraReady || cameraBusy || inAppCapturing}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${preset}배 줌`}
                >
                  <Text
                    style={[styles.zoomPresetText, selected && styles.zoomPresetTextSelected]}
                  >
                    {preset}x
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.inAppShutterRow}>
            <Pressable
              style={styles.inAppFlipButton}
              onPress={toggleCameraFacing}
              disabled={cameraBusy || inAppCapturing}
              accessibilityRole="button"
              accessibilityLabel={cameraFacing === 'back' ? '전면 카메라로 전환' : '후면 카메라로 전환'}
            >
              <Text style={styles.inAppFlipButtonText}>
                {cameraFacing === 'back' ? '전면' : '후면'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.inAppShutterOuter}
              onPress={() => void handleInAppShutter()}
              disabled={!inAppCameraReady || cameraBusy || inAppCapturing}
              accessibilityRole="button"
              accessibilityLabel="촬영"
            >
              <View style={styles.inAppShutterInner} />
            </Pressable>
            <View style={styles.inAppFlipSpacer} />
          </View>
        </View>

        {previewOpenHref ? (
          <View style={styles.previewHrefBar} pointerEvents="box-none">
            <Text style={styles.previewHrefText} numberOfLines={1} pointerEvents="none">
              {previewOpenHref}
            </Text>
            <Pressable
              style={styles.previewHrefBtn}
              onPress={() => void openPreviewHref()}
              disabled={cameraBusy || inAppCapturing}
              accessibilityRole="button"
              accessibilityLabel="주소 열기"
            >
              <Text style={styles.previewHrefBtnText}>열기</Text>
            </Pressable>
          </View>
        ) : null}

        {cameraBusy ? (
          <View style={styles.busyOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.launcherHint}>{busyHint ?? (isContinuous ? '저장 중…' : '처리 중…')}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  // Left-hand theme: fixed light key visual + contrasting nav icons (overrides home-bg setting).
  const isLeftHand = cameraHand === 'left';
  const homeImage = isLeftHand ? cameraHomeLeftHand : CAMERA_HOME_IMAGES[cameraHomeBg];
  const homeFill = isLeftHand ? '#ffffff' : cameraHomeBgFill(cameraHomeBg);
  const homeOnLight = isLeftHand || cameraHomeBg === 'mainint1';
  const activeListIcon = isLeftHand ? listIconLeft : listIcon;
  const activeSettingsIcon = isLeftHand ? settingsIconBlack : settingsIcon;

  return (
    <View style={[styles.container, { backgroundColor: homeFill }]}>
      <View style={[styles.launcher, { backgroundColor: homeFill }]}>
        <View style={styles.launcherSplash}>
          <Image
            source={homeImage}
            style={styles.launcherImage}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
        {saveFeedback ? (
          <View
            style={[styles.saveFeedbackBanner, homeOnLight && styles.saveFeedbackBannerOnLight]}
            pointerEvents="none"
            accessibilityLiveRegion="polite"
          >
            <Text
              style={[styles.saveFeedbackText, homeOnLight && styles.saveFeedbackTextOnLight]}
              numberOfLines={1}
            >
              {saveFeedback}
            </Text>
          </View>
        ) : null}
        {collectJoinName ? (
          <Pressable
            style={[styles.collectJoinBanner, homeOnLight && styles.collectJoinBannerOnLight]}
            onPress={() => onOpenProjectCollect?.()}
            disabled={cameraBusy || actionSheetVisible || !onOpenProjectCollect}
            accessibilityRole="button"
            accessibilityLabel={`이 사업으로 전송, ${collectJoinName}`}
            accessibilityHint="사업 취합 화면으로 이동합니다"
          >
            <Text
              style={[styles.collectJoinBannerTitle, homeOnLight && styles.collectJoinBannerTitleOnLight]}
              numberOfLines={1}
            >
              이 사업으로 전송
            </Text>
            <Text
              style={[styles.collectJoinBannerName, homeOnLight && styles.collectJoinBannerNameOnLight]}
              numberOfLines={1}
            >
              {collectJoinName}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[
            styles.launchCaptureButton,
            homeOnLight && styles.launchCaptureButtonOnLight,
          ]}
          onPress={() => void openPrimaryCapture()}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityRole="button"
          accessibilityLabel="사진 촬영"
        >
          <View
            style={[
              styles.launchCaptureInner,
              homeOnLight && styles.launchCaptureInnerOnLight,
            ]}
          />
        </Pressable>
        {cameraBusy ? (
          <View style={styles.busyOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.launcherHint}>
              {busyHint ?? (isWeb ? '카메라 여는 중…' : '시스템 카메라 여는 중…')}
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.sideNav,
          isLeftHand ? styles.sideNavLeft : styles.sideNavRight,
        ]}
      >
        {projectCollectEnabled && onOpenProjectCollect ? (
          <Pressable
            style={[styles.navButton, styles.navIconButton]}
            onPress={onOpenProjectCollect}
            disabled={cameraBusy || actionSheetVisible}
            accessibilityRole="button"
            accessibilityLabel="취합"
          >
            <Image source={projectCollectIcon} style={styles.navIcon} resizeMode="contain" />
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.navButton, styles.navIconButton]}
          onPress={() => setTemplateSheetVisible(true)}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityLabel="저장 템플릿"
        >
          <Image source={templateIcon} style={styles.navIcon} resizeMode="contain" />
        </Pressable>
        <Pressable
          style={[styles.navButton, styles.navIconButton]}
          onPress={onOpenList}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityLabel="목록"
        >
          <Image source={activeListIcon} style={styles.navIcon} resizeMode="contain" />
        </Pressable>
        <Pressable
          style={[styles.navButton, styles.navIconButton]}
          onPress={onOpenSettings}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityLabel="설정"
        >
          <Image source={activeSettingsIcon} style={styles.navIcon} resizeMode="contain" />
        </Pressable>
      </View>

      <FieldTemplateSheet
        visible={templateSheetVisible}
        onClose={() => setTemplateSheetVisible(false)}
        onApplied={(template) => {
          Alert.alert('저장 템플릿', `「${template.name}」표시명을 적용했습니다.`);
        }}
      />

      <CaptureActionSheet
        visible={actionSheetVisible}
        imageUri={pendingCaptureUri}
        locationPrefetchLoading={locationPrefetchLoading}
        placeLabel={prefetchedLocation?.placeLabel ?? null}
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
        locationPrefetchFinished={locationPrefetchFinished}
        capturedSourceUrl={saveSeedSourceUrl}
        onClose={() => {
          setModalVisible(false);
          setCapturedUri(null);
          setSaveSeedSourceUrl(null);
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
    justifyContent: 'flex-end',
    paddingBottom: 100,
    gap: 12,
  },
  saveFeedbackBanner: {
    alignSelf: 'center',
    maxWidth: '88%',
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    zIndex: 3,
  },
  saveFeedbackBannerOnLight: {
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#94a3b8',
  },
  saveFeedbackText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  saveFeedbackTextOnLight: {
    color: '#0f172a',
  },
  collectJoinBanner: {
    alignSelf: 'center',
    maxWidth: '88%',
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 95, 70, 0.92)',
    gap: 2,
    zIndex: 2,
  },
  collectJoinBannerOnLight: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  collectJoinBannerTitle: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '700',
  },
  collectJoinBannerTitleOnLight: {
    color: '#047857',
  },
  collectJoinBannerName: {
    color: '#ecfdf5',
    fontSize: 16,
    fontWeight: '800',
  },
  collectJoinBannerNameOnLight: {
    color: '#064e3b',
  },
  launcherSplash: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '4%',
    paddingTop: 8,
  },
  launcherImage: {
    width: '100%',
    height: '100%',
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
  launchCaptureButtonOnLight: {
    borderColor: '#111',
  },
  launchCaptureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  launchCaptureInnerOnLight: {
    backgroundColor: '#111',
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
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'transparent',
  },
  navIcon: {
    width: 52,
    height: 52,
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
    bottom: 160,
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
    zIndex: 20,
    alignItems: 'center',
    gap: 14,
  },
  previewHrefBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 168,
    zIndex: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  previewHrefText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
  },
  previewHrefBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  previewHrefBtnText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 13,
  },
  zoomPresetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zoomPresetButton: {
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
  },
  zoomPresetButtonSelected: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: '#fff',
  },
  zoomPresetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  zoomPresetTextSelected: {
    color: '#111',
  },
  inAppShutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    width: '100%',
    paddingHorizontal: 24,
  },
  inAppFlipSpacer: {
    minWidth: 64,
  },
  inAppFlipButton: {
    minWidth: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inAppFlipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
