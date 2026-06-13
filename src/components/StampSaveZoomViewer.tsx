import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import { renderStampPreviewJpegUri, type StampImageExportOptions } from '../services/exportStampImage';
import type { StampTextLayout, TextAlign } from '../services/settingsService';
import type { Stamp } from '../types/stamp';
import { StampSavePreview } from './StampSavePreview';
import { ZoomableImage } from './ZoomableImage';

type StampSaveZoomViewerProps = {
  imageUri: string;
  title: string;
  memo: string;
  titleAlign: TextAlign;
  memoAlign: TextAlign;
  textLayout: StampTextLayout;
  showDatetime: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export function StampSaveZoomViewer({
  imageUri,
  title,
  memo,
  titleAlign,
  memoAlign,
  textLayout,
  showDatetime,
  latitude,
  longitude,
}: StampSaveZoomViewerProps) {
  const [compositeUri, setCompositeUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(Platform.OS === 'web');

  const exportOptions = useMemo<StampImageExportOptions>(
    () => ({
      titleAlign,
      memoAlign,
      showDatetime,
      textLayout,
    }),
    [titleAlign, memoAlign, showDatetime, textLayout],
  );

  const draftStamp = useMemo<Stamp>(
    () => ({
      id: 'save-preview',
      title,
      memo,
      imagePath: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    }),
    [title, memo, latitude, longitude],
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      setUseFallback(true);
      setCompositeUri(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setUseFallback(false);
    setCompositeUri(null);

    (async () => {
      try {
        const uri = await renderStampPreviewJpegUri(draftStamp, exportOptions, imageUri);
        if (!cancelled) {
          setCompositeUri(uri);
        }
      } catch {
        if (!cancelled) {
          setUseFallback(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [draftStamp, exportOptions, imageUri]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.loadingText}>미리보기 생성 중…</Text>
      </View>
    );
  }

  if (useFallback || !compositeUri) {
    return (
      <View style={styles.fallback}>
        <StampSavePreview
          imageUri={imageUri}
          title={title}
          memo={memo}
          titleAlign={titleAlign}
          memoAlign={memoAlign}
          textLayout={textLayout}
          showDatetime={showDatetime}
          latitude={latitude}
          longitude={longitude}
          variant="fullscreen"
        />
      </View>
    );
  }

  return <ZoomableImage uri={compositeUri} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  fallback: {
    flex: 1,
    width: '100%',
  },
});
