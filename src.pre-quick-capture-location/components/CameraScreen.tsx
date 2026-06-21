import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { CaptureActionSheet } from './CaptureActionSheet';
import { takePhotoWithSystemCamera } from '../services/pickStampImage';
import { saveQuickCapture } from '../services/quickCaptureSave';
import { getCameraHand, type CameraHand } from '../services/settingsService';
import type { CaptureStampForExport } from '../services/exportStampImage';
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
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    getCameraHand().then(setCameraHand);
  }, [refreshKey]);

  const openSaveModal = useCallback((uri: string) => {
    setCapturedUri(uri);
    setModalVisible(true);
  }, []);

  const handleCameraError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : '카메라에 실패했습니다.';
    Alert.alert('카메라', message);
  }, []);

  const showCaptureActionSheet = useCallback((uri: string) => {
    actionSheetVisibleRef.current = true;
    setPendingCaptureUri(uri);
    setActionSheetVisible(true);
  }, []);

  const clearCaptureActionSheet = useCallback(() => {
    actionSheetVisibleRef.current = false;
    setActionSheetVisible(false);
    setPendingCaptureUri(null);
  }, []);

  const runContinuousCaptureLoop = useCallback(
    async (firstUri: string) => {
      let nextUri: string | null = firstUri;
      while (nextUri) {
        setCameraBusy(true);
        setBusyHint('저장 중…');
        try {
          await saveQuickCapture({
            tempImageUri: nextUri,
            captureForExport: captureStampForExport,
          });
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

  const handleCapturedUri = useCallback(
    (uri: string) => {
      showCaptureActionSheet(uri);
    },
    [showCaptureActionSheet],
  );

  const openSystemCamera = useCallback(async () => {
    if (cameraBusy || modalVisible || actionSheetVisibleRef.current || launchingRef.current) {
      return;
    }

    launchingRef.current = true;
    setCameraBusy(true);
    setBusyHint(isWeb ? '카메라 여는 중…' : '시스템 카메라 여는 중…');
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
  }, [cameraBusy, modalVisible, handleCameraError, handleCapturedUri, isWeb]);

  const handleActionRetake = useCallback(() => {
    clearCaptureActionSheet();
    void openSystemCamera();
  }, [clearCaptureActionSheet, openSystemCamera]);

  const handleActionSave = useCallback(() => {
    const uri = pendingCaptureUri;
    clearCaptureActionSheet();
    if (uri) {
      openSaveModal(uri);
    }
  }, [clearCaptureActionSheet, openSaveModal, pendingCaptureUri]);

  const handleActionContinuous = useCallback(() => {
    const uri = pendingCaptureUri;
    clearCaptureActionSheet();
    if (uri) {
      void runContinuousCaptureLoop(uri);
    }
  }, [clearCaptureActionSheet, pendingCaptureUri, runContinuousCaptureLoop]);

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
    if (!readyToLaunch || !permission?.granted || !autoLaunch || modalVisible || cameraBusy || actionSheetVisible) {
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
    openSystemCamera,
    refreshKey,
  ]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>카메라 권한 확인 중...</Text>
      </View>
    );
  }

  if (!isWeb && !permission.granted) {
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
          accessibilityLabel="사진 촬영"
        >
          <View style={styles.launchCaptureInner} />
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
          cameraHand === 'left' ? styles.sideNavLeft : styles.sideNavRight,
        ]}
      >
        <Pressable
          style={[styles.navButton, styles.navIconButton]}
          onPress={onOpenList}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityLabel="목록"
        >
          <Image source={listIcon} style={styles.navIcon} resizeMode="contain" />
        </Pressable>
        <Pressable
          style={[styles.navButton, styles.navIconButton]}
          onPress={onOpenSettings}
          disabled={cameraBusy || actionSheetVisible}
          accessibilityLabel="설정"
        >
          <Image source={settingsIcon} style={styles.navIcon} resizeMode="contain" />
        </Pressable>
      </View>

      <CaptureActionSheet
        visible={actionSheetVisible}
        imageUri={pendingCaptureUri}
        onRetake={handleActionRetake}
        onSave={handleActionSave}
        onContinuous={handleActionContinuous}
      />

      <StampSaveModal
        visible={modalVisible}
        imageUri={capturedUri}
        captureStampForExport={captureStampForExport}
        onClose={() => {
          setModalVisible(false);
          setCapturedUri(null);
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
});
