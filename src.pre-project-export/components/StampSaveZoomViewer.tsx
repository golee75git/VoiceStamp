import { StyleSheet, Text, View } from 'react-native';

import type { StampCropViewport } from '../services/stampImageCrop';
import { ZoomableImage } from './ZoomableImage';

type StampSaveZoomViewerProps = {
  imageUri: string;
  onCropChange?: (viewport: StampCropViewport) => void;
};

export function StampSaveZoomViewer({ imageUri, onCropChange }: StampSaveZoomViewerProps) {
  return (
    <View style={styles.root}>
      <ZoomableImage uri={imageUri} onCropChange={onCropChange} />
      <Text style={styles.hint}>두 손가락으로 확대·이동 후 「적용」을 누르세요.</Text>
      <Text style={styles.hintSub}>「닫기」는 변경 없이 저장 화면으로 돌아갑니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  hint: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    color: '#e5e7eb',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  hintSub: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
