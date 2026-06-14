import { memo, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

import { normalizeDisplayUri } from '../services/exportStampImage';

import { formatStampCoordinates } from '../services/stampCoords';
import { stampDisplayTitle } from '../services/stampFloor';
import type { StampTextLayout, TextAlign, CoordsLabelMode } from '../services/settingsService';
import type { StampFloor } from '../types/stamp';

const FALLBACK_ASPECT_RATIO = 4 / 3;

const PreviewPhoto = memo(function PreviewPhoto({
  uri,
  style,
  resizeMode,
}: {
  uri: string;
  style: StyleProp<ImageStyle>;
  resizeMode: ImageResizeMode;
}) {
  const [displayUri, setDisplayUri] = useState(() => normalizeDisplayUri(uri));

  useEffect(() => {
    setDisplayUri(normalizeDisplayUri(uri));
  }, [uri]);

  return (
    <View style={style} collapsable={false}>
      <Image
        source={{ uri: displayUri }}
        style={styles.previewPhotoImage}
        resizeMode={resizeMode}
        onError={() => {
          const fallback = normalizeDisplayUri(uri);
          if (fallback !== displayUri) {
            setDisplayUri(fallback);
          }
        }}
      />
    </View>
  );
});

const WatermarkThumbnailPhoto = memo(function WatermarkThumbnailPhoto({ uri }: { uri: string }) {
  const [displayUri, setDisplayUri] = useState(() => normalizeDisplayUri(uri));

  useEffect(() => {
    setDisplayUri(normalizeDisplayUri(uri));
  }, [uri]);

  return (
    <Image
      source={{ uri: displayUri }}
      style={StyleSheet.absoluteFillObject}
      resizeMode="cover"
      onError={() => {
        const fallback = normalizeDisplayUri(uri);
        if (fallback !== displayUri) {
          setDisplayUri(fallback);
        }
      }}
    />
  );
});

type StampSavePreviewProps = {
  imageUri: string;
  imageLoading?: boolean;
  title: string;
  memo: string;
  titleAlign: TextAlign;
  memoAlign: TextAlign;
  textLayout: StampTextLayout;
  coordsLabel: CoordsLabelMode;
  showDatetime: boolean;
  floor?: StampFloor | null;
  latitude?: number | null;
  longitude?: number | null;
  variant: 'thumbnail' | 'fullscreen';
};

export function StampSavePreview({
  imageUri,
  imageLoading = false,
  title,
  memo,
  titleAlign,
  memoAlign,
  textLayout,
  coordsLabel,
  showDatetime,
  floor,
  latitude,
  longitude,
  variant,
}: StampSavePreviewProps) {
  const [aspectRatio, setAspectRatio] = useState(FALLBACK_ASPECT_RATIO);
  const displayTitle = stampDisplayTitle({ title, floor }, showDatetime);
  const displayMemo = memo.trim();
  const coords = formatStampCoordinates(latitude, longitude, coordsLabel);
  const isThumbnail = variant === 'thumbnail';
  const imageResizeMode: ImageResizeMode = textLayout === 'watermark' ? 'cover' : 'contain';

  useEffect(() => {
    let cancelled = false;
    Image.getSize(
      imageUri,
      (width, height) => {
        if (!cancelled && width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        // Keep fallback aspect ratio.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [imageUri]);

  const titleStyle = isThumbnail ? styles.thumbnailTitle : styles.fullscreenCaptionTitle;
  const memoStyle = isThumbnail ? styles.thumbnailMemo : styles.fullscreenCaptionMemo;
  const coordsStyle = isThumbnail ? styles.thumbnailCoords : styles.fullscreenCaptionCoords;
  const watermarkTitleStyle = isThumbnail ? styles.thumbnailWatermarkTitle : styles.fullscreenWatermarkTitle;
  const watermarkMemoStyle = isThumbnail ? styles.thumbnailWatermarkMemo : styles.fullscreenWatermarkMemo;
  const watermarkCoordsStyle = isThumbnail ? styles.thumbnailWatermarkCoords : styles.fullscreenWatermarkCoords;

  const renderThumbnailPhoto = (photoStyle: StyleProp<ImageStyle>, resizeMode: ImageResizeMode) => {
    if (imageLoading || !imageUri) {
      return (
        <View style={[photoStyle, styles.thumbnailPhotoLoading]}>
          <ActivityIndicator color="#6b7280" />
        </View>
      );
    }
    return <PreviewPhoto uri={imageUri} style={photoStyle} resizeMode={resizeMode} />;
  };

  if (textLayout === 'watermark') {
    const photoStyle = isThumbnail
      ? styles.thumbnailWatermarkPhoto
      : [styles.fullscreenPhoto, { aspectRatio }];

    return (
      <View style={isThumbnail ? styles.thumbnailWrap : styles.fullscreenWrap}>
        <View style={isThumbnail ? styles.thumbnailPhotoWrap : styles.fullscreenPhotoWrap}>
          {isThumbnail ? (
            renderThumbnailPhoto(photoStyle, imageResizeMode)
          ) : (
            <PreviewPhoto uri={imageUri} style={photoStyle} resizeMode={imageResizeMode} />
          )}
          <View style={isThumbnail ? styles.thumbnailWatermarkBar : styles.fullscreenWatermarkBar}>
            <Text style={[watermarkTitleStyle, { textAlign: titleAlign }]} numberOfLines={isThumbnail ? 2 : undefined}>
              {displayTitle}
            </Text>
            {displayMemo ? (
              <Text style={[watermarkMemoStyle, { textAlign: memoAlign }]} numberOfLines={isThumbnail ? 3 : undefined}>
                {displayMemo}
              </Text>
            ) : null}
            {coords ? (
              <Text style={[watermarkCoordsStyle, { textAlign: memoAlign }]} numberOfLines={1}>
                {coords}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  if (isThumbnail) {
    return (
      <View style={styles.thumbnailCaptionCard}>
        {renderThumbnailPhoto(styles.thumbnailCaptionPhoto, 'cover')}
        <View style={styles.thumbnailCaptionText}>
          <Text style={[titleStyle, { textAlign: titleAlign }]} numberOfLines={2}>
            {displayTitle}
          </Text>
          {displayMemo ? (
            <Text style={[memoStyle, { textAlign: memoAlign }]} numberOfLines={2}>
              {displayMemo}
            </Text>
          ) : null}
          {coords ? (
            <Text style={[coordsStyle, { textAlign: memoAlign }]} numberOfLines={1}>
              {coords}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullscreenCaptionCard}>
      <View style={[styles.fullscreenPhotoWrap, { width: '100%' }]}>
        <PreviewPhoto
          uri={imageUri}
          style={[styles.fullscreenPhoto, { aspectRatio }]}
          resizeMode="contain"
        />
      </View>
      <View style={styles.fullscreenCaptionText}>
        <Text style={[titleStyle, { textAlign: titleAlign }]}>{displayTitle}</Text>
        {displayMemo ? (
          <Text style={[memoStyle, { textAlign: memoAlign }]}>{displayMemo}</Text>
        ) : null}
        {coords ? (
          <Text style={[coordsStyle, { textAlign: memoAlign }]}>{coords}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnailWrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  thumbnailPhotoWrap: {
    position: 'relative',
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  thumbnailPhoto: {
    width: '100%',
    height: '100%',
  },
  thumbnailWatermarkPhoto: {
    width: '100%',
    height: 180,
  },
  previewPhotoImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPhotoLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  thumbnailWatermarkBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  thumbnailWatermarkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  thumbnailWatermarkMemo: {
    marginTop: 4,
    fontSize: 11,
    color: '#f3f4f6',
    lineHeight: 15,
  },
  thumbnailWatermarkCoords: {
    marginTop: 3,
    fontSize: 10,
    color: '#e5e7eb',
    lineHeight: 13,
  },
  thumbnailCaptionCard: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  thumbnailCaptionPhoto: {
    width: '100%',
    height: 120,
  },
  thumbnailCaptionText: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  thumbnailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  thumbnailMemo: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 15,
  },
  thumbnailCoords: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 13,
  },
  fullscreenWrap: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  fullscreenPhotoWrap: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  fullscreenPhoto: {
    width: '100%',
  },
  fullscreenWatermarkBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fullscreenWatermarkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  fullscreenWatermarkMemo: {
    marginTop: 6,
    fontSize: 15,
    color: '#f3f4f6',
    lineHeight: 21,
  },
  fullscreenWatermarkCoords: {
    marginTop: 4,
    fontSize: 13,
    color: '#e5e7eb',
    lineHeight: 18,
  },
  fullscreenCaptionCard: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  fullscreenCaptionText: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  fullscreenCaptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  fullscreenCaptionMemo: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 21,
  },
  fullscreenCaptionCoords: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});
