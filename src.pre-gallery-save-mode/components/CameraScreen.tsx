import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { takePhotoWithSystemCamera } from '../services/pickStampImage';
import { getCameraHand, type CameraHand } from '../services/settingsService';
import { StampSaveModal } from './StampSaveModal';

type CameraScreenProps = {
  refreshKey: number;
  onOpenList: () => void;
  onOpenSettings: () => void;
  onSaved: () => void;
};

export function CameraScreen({ refreshKey, onOpenList, onOpenSettings, onSaved }: CameraScreenProps) {
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraHand, setCameraHand] = useState<CameraHand>('right');
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [readyToLaunch, setReadyToLaunch] = useState(Platform.OS === 'web');
  const savedAndClosingRef = useRef(false);
  const launchingRef = useRef(false);

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

  const openSystemCamera = useCallback(async () => {
    if (cameraBusy || modalVisible || launchingRef.current) {
      return;
    }

    launchingRef.current = true;

    if (Platform.OS === 'web') {
      Alert.alert('카메라', '웹에서는 목록의 앨범을 이용해 주세요.');
      return;
    }

    setCameraBusy(true);
    try {
      const uri = await takePhotoWithSystemCamera();
      if (uri) {
        openSaveModal(uri);
      } else {
        setAutoLaunch(false);
      }
    } catch (error) {
      setAutoLaunch(false);
      handleCameraError(error);
    } finally {
      launchingRef.current = false;
      setCameraBusy(false);
    }
  }, [cameraBusy, modalVisible, openSaveModal, handleCameraError]);

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
          openSaveModal(pending.assets[0].uri);
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
  }, [openSaveModal]);

  useEffect(() => {
    if (!readyToLaunch || !permission?.granted || !autoLaunch || modalVisible || cameraBusy) {
      return;
    }
    if (Platform.OS === 'web') {
      return;
    }

    void openSystemCamera();
  }, [readyToLaunch, permission?.granted, autoLaunch, modalVisible, cameraBusy, openSystemCamera, refreshKey]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>카메라 권한 확인 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
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
        {cameraBusy ? (
          <>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.launcherHint}>시스템 카메라 여는 중…</Text>
          </>
        ) : (
          <>
            <Text style={styles.launcherTitle}>VoiceStamp</Text>
            <Text style={styles.launcherHint}>촬영 버튼을 누르면 줌 가능한 시스템 카메라가 열립니다.</Text>
            <Pressable style={styles.launchCaptureButton} onPress={() => void openSystemCamera()}>
              <View style={styles.launchCaptureInner} />
            </Pressable>
          </>
        )}
      </View>

      <View
        style={[
          styles.sideNav,
          cameraHand === 'left' ? styles.sideNavLeft : styles.sideNavRight,
        ]}
      >
        <Pressable style={styles.navButton} onPress={onOpenList} disabled={cameraBusy}>
          <Text style={styles.navButtonText}>목록</Text>
        </Pressable>
        <Pressable style={styles.navButton} onPress={onOpenSettings} disabled={cameraBusy}>
          <Text style={styles.navButtonText}>설정</Text>
        </Pressable>
      </View>

      <StampSaveModal
        visible={modalVisible}
        imageUri={capturedUri}
        onClose={() => {
          setModalVisible(false);
          setCapturedUri(null);
          if (savedAndClosingRef.current) {
            savedAndClosingRef.current = false;
            setAutoLaunch(true);
          } else {
            setAutoLaunch(false);
          }
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  launcherTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  launcherHint: {
    color: '#d1d5db',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  launchCaptureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  launchCaptureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
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
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
