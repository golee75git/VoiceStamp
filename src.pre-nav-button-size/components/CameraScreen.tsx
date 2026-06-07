import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { takePhotoWithSystemCamera } from '../services/pickStampImage';
import { getCameraHand, type CameraHand } from '../services/settingsService';
import { pickLargestPictureSize } from '../utils/cameraPictureSize';
import { StampSaveModal } from './StampSaveModal';

type CameraScreenProps = {
  refreshKey: number;
  onOpenList: () => void;
  onOpenSettings: () => void;
  onSaved: () => void;
};

export function CameraScreen({ refreshKey, onOpenList, onOpenSettings, onSaved }: CameraScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [externalPickBusy, setExternalPickBusy] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [pictureSize, setPictureSize] = useState<string | undefined>();
  const [cameraHand, setCameraHand] = useState<CameraHand>('right');

  useEffect(() => {
    getCameraHand().then(setCameraHand);
  }, [refreshKey]);

  const openSaveModal = (uri: string) => {
    setCapturedUri(uri);
    setModalVisible(true);
  };

  const handleExternalPickError = (label: string, error: unknown) => {
    const message = error instanceof Error ? error.message : `${label}에 실패했습니다.`;
    Alert.alert(label, message);
  };

  const handleSystemCamera = async () => {
    if (externalPickBusy || capturing) {
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('카메라', '웹에서는 목록의 앨범을 이용해 주세요.');
      return;
    }

    setExternalPickBusy(true);
    try {
      const uri = await takePhotoWithSystemCamera();
      if (uri) {
        openSaveModal(uri);
      }
    } catch (error) {
      handleExternalPickError('카메라', error);
    } finally {
      setExternalPickBusy(false);
    }
  };

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

  const handleCameraReady = async () => {
    setCameraReady(true);

    try {
      const sizes = await cameraRef.current?.getAvailablePictureSizesAsync();
      const largest = sizes?.length ? pickLargestPictureSize(sizes) : undefined;
      if (largest) {
        setPictureSize(largest);
      }
    } catch {
      // Keep the default camera picture size when sizes are unavailable.
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || capturing || !cameraReady || externalPickBusy) {
      return;
    }

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });
      if (photo?.uri) {
        openSaveModal(photo.uri);
      }
    } finally {
      setCapturing(false);
    }
  };

  const bottomBusy = capturing || externalPickBusy;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        pictureSize={pictureSize}
        onCameraReady={handleCameraReady}
      />

      <View
        style={[
          styles.sideNav,
          cameraHand === 'left' ? styles.sideNavLeft : styles.sideNavRight,
        ]}
      >
        <Pressable style={styles.navButton} onPress={onOpenList}>
          <Text style={styles.navButtonText}>목록</Text>
        </Pressable>
        <Pressable style={styles.navButton} onPress={onOpenSettings}>
          <Text style={styles.navButtonText}>설정</Text>
        </Pressable>
        {Platform.OS !== 'web' && (
          <Pressable
            style={[styles.navButton, bottomBusy && styles.navButtonDisabled]}
            onPress={handleSystemCamera}
            disabled={bottomBusy}
          >
            <Text style={styles.navButtonText}>카메라</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.captureButton, (bottomBusy || !cameraReady) && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={bottomBusy || !cameraReady}
        >
          <View style={styles.captureInner} />
        </Pressable>
      </View>

      <StampSaveModal
        visible={modalVisible}
        imageUri={capturedUri}
        onClose={() => {
          setModalVisible(false);
          setCapturedUri(null);
        }}
        onSaved={onSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  navButtonDisabled: {
    opacity: 0.6,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
});
