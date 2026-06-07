import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { pickLargestPictureSize } from '../utils/cameraPictureSize';
import { StampSaveModal } from './StampSaveModal';

type CameraScreenProps = {
  onOpenList: () => void;
  onOpenSettings: () => void;
  onSaved: () => void;
};

export function CameraScreen({ onOpenList, onOpenSettings, onSaved }: CameraScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [pictureSize, setPictureSize] = useState<string | undefined>();

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
    if (!cameraRef.current || capturing || !cameraReady) {
      return;
    }

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        setModalVisible(true);
      }
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        pictureSize={pictureSize}
        onCameraReady={handleCameraReady}
      />

      <View style={styles.topBar}>
        <Pressable style={styles.topButton} onPress={onOpenSettings}>
          <Text style={styles.topButtonText}>설정</Text>
        </Pressable>
        <Pressable style={styles.topButton} onPress={onOpenList}>
          <Text style={styles.topButtonText}>목록</Text>
        </Pressable>
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.captureButton, (capturing || !cameraReady) && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={capturing || !cameraReady}
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
  topBar: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  topButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  topButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
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
