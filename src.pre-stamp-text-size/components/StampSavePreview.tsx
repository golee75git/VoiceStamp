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
import { stampDisplayPlace } from '../services/stampPlace';
import {
  overlayPhraseFontSize,
  resolveOverlayFooterPhrase,
  resolveOverlayOrgName,
} from '../services/overlayText';
import { formatLabeledValue, resolveFieldLabels } from '../services/fieldLabels';
import { buildCaptionTableRows } from '../services/captionTable';
import { WatermarkBarBackground } from './WatermarkBarBackground';
import { getWatermarkTheme } from '../services/watermarkStyle';
import type { StampTextLayout, TextAlign, CoordsLabelMode, WatermarkStyle } from '../services/settingsService';
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

type StampSavePreviewProps = {
  imageUri: string;
  imageLoading?: boolean;
  title: string;
  memo: string;
  extra1?: string;
  extra2?: string;
  placeLabel?: string | null;
  titleAlign: TextAlign;
  memoAlign: TextAlign;
  textLayout: StampTextLayout;
  watermarkStyle: WatermarkStyle;
  coordsLabel: CoordsLabelMode;
  showDatetime: boolean;
  orgName: string;
  footerPhrase: string;
  showOrgName: boolean;
  showFooterPhrase: boolean;
  titleFieldLabel?: string;
  placeFieldLabel?: string;
  memoFieldLabel?: string;
  extra1FieldLabel?: string;
  extra2FieldLabel?: string;
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
  extra1 = '',
  extra2 = '',
  placeLabel,
  titleAlign,
  memoAlign,
  textLayout,
  watermarkStyle,
  coordsLabel,
  showDatetime,
  orgName,
  footerPhrase,
  showOrgName,
  showFooterPhrase,
  titleFieldLabel,
  placeFieldLabel,
  memoFieldLabel,
  extra1FieldLabel,
  extra2FieldLabel,
  floor,
  latitude,
  longitude,
  variant,
}: StampSavePreviewProps) {
  const [aspectRatio, setAspectRatio] = useState(FALLBACK_ASPECT_RATIO);
  const labels = resolveFieldLabels({
    titleFieldLabel,
    placeFieldLabel,
    memoFieldLabel,
    extra1FieldLabel,
    extra2FieldLabel,
  });
  const displayTitle = formatLabeledValue(
    labels.titleFieldLabel,
    stampDisplayTitle({ title, floor }, showDatetime),
  );
  const displayMemo = formatLabeledValue(labels.memoFieldLabel, memo.trim());
  const displayExtra1 = formatLabeledValue(labels.extra1FieldLabel, extra1.trim());
  const displayExtra2 = formatLabeledValue(labels.extra2FieldLabel, extra2.trim());
  const displayPlaceRaw = stampDisplayPlace({ placeLabel, floor }) ?? '';
  const displayPlace = formatLabeledValue(labels.placeFieldLabel, displayPlaceRaw);
  const coords = formatStampCoordinates(latitude, longitude, coordsLabel);
  const displayOrgName = resolveOverlayOrgName({ orgName, footerPhrase, showOrgName, showFooterPhrase });
  const displayFooterPhrase = resolveOverlayFooterPhrase({ orgName, footerPhrase, showOrgName, showFooterPhrase });
  const captionTableRows = buildCaptionTableRows(
    { title, memo, floor, placeLabel, extra1, extra2, latitude, longitude },
    labels,
    { showDatetime, coordsLabel, includeCoords: true },
  );
  const isThumbnail = variant === 'thumbnail';
  const phraseFontSize = overlayPhraseFontSize(isThumbnail ? 10 : 13);
  const imageResizeMode: ImageResizeMode = textLayout === 'watermark' ? 'cover' : 'contain';

  const renderCaptionTable = (compact: boolean) => {
    if (captionTableRows.length === 0) {
      return null;
    }
    return (
      <View style={[styles.captionTable, compact && styles.captionTableCompact]}>
        {captionTableRows.map((row) => (
          <View key={`${row.label}:${row.value}`} style={styles.captionTableRow}>
            <Text
              style={[styles.captionTableLabel, compact && styles.captionTableLabelCompact]}
              numberOfLines={compact ? 1 : 3}
            >
              {row.label}
            </Text>
            <Text
              style={[
                styles.captionTableValue,
                compact && styles.captionTableValueCompact,
                { textAlign: memoAlign },
              ]}
              numberOfLines={compact ? 2 : undefined}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

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
  const placeStyle = isThumbnail ? styles.thumbnailPlace : styles.fullscreenCaptionPlace;
  const watermarkTitleStyle = isThumbnail ? styles.thumbnailWatermarkTitle : styles.fullscreenWatermarkTitle;
  const watermarkMemoStyle = isThumbnail ? styles.thumbnailWatermarkMemo : styles.fullscreenWatermarkMemo;
  const watermarkPlaceStyle = isThumbnail ? styles.thumbnailWatermarkPlace : styles.fullscreenWatermarkPlace;
  const watermarkCoordsStyle = isThumbnail ? styles.thumbnailWatermarkCoords : styles.fullscreenWatermarkCoords;
  const watermarkTheme = getWatermarkTheme(watermarkStyle);

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

  const renderThumbnailWatermarkBar = () => (
    <WatermarkBarBackground style={watermarkStyle} barStyle={styles.thumbnailWatermarkBar}>
      {displayOrgName ? (
        <Text
          style={[
            styles.thumbnailWatermarkOrg,
            { textAlign: titleAlign, color: watermarkTheme.titleColor },
          ]}
          numberOfLines={1}
        >
          {displayOrgName}
        </Text>
      ) : null}
      {displayTitle ? (
        <Text
          style={[watermarkTitleStyle, { textAlign: titleAlign, color: watermarkTheme.titleColor }]}
          numberOfLines={2}
        >
          {displayTitle}
        </Text>
      ) : null}
      {displayPlace ? (
        <Text
          style={[watermarkPlaceStyle, { textAlign: titleAlign, color: watermarkTheme.memoColor }]}
          numberOfLines={2}
        >
          {displayPlace}
        </Text>
      ) : null}
      {displayExtra1 ? (
        <Text
          style={[watermarkPlaceStyle, { textAlign: titleAlign, color: watermarkTheme.memoColor }]}
          numberOfLines={2}
        >
          {displayExtra1}
        </Text>
      ) : null}
      {displayExtra2 ? (
        <Text
          style={[watermarkPlaceStyle, { textAlign: titleAlign, color: watermarkTheme.memoColor }]}
          numberOfLines={2}
        >
          {displayExtra2}
        </Text>
      ) : null}
      {displayMemo ? (
        <Text
          style={[watermarkMemoStyle, { textAlign: memoAlign, color: watermarkTheme.memoColor }]}
          numberOfLines={3}
        >
          {displayMemo}
        </Text>
      ) : null}
      {coords ? (
        <Text
          style={[watermarkCoordsStyle, { textAlign: memoAlign, color: watermarkTheme.coordsColor }]}
          numberOfLines={1}
        >
          {coords}
        </Text>
      ) : null}
      {displayFooterPhrase ? (
        <Text
          style={[
            styles.thumbnailWatermarkPhrase,
            { textAlign: memoAlign, color: watermarkTheme.coordsColor, fontSize: phraseFontSize },
          ]}
          numberOfLines={1}
        >
          {displayFooterPhrase}
        </Text>
      ) : null}
    </WatermarkBarBackground>
  );

  if (textLayout === 'watermark' && isThumbnail) {
    return (
      <View style={styles.thumbnailCaptionCard}>
        <View style={styles.thumbnailWatermarkPhotoSlot}>
          {renderThumbnailPhoto(styles.thumbnailCaptionPhoto, 'cover')}
          {renderThumbnailWatermarkBar()}
        </View>
      </View>
    );
  }

  if (textLayout === 'watermark') {
    return (
      <View style={styles.fullscreenWrap}>
        <View style={styles.fullscreenPhotoWrap}>
          <PreviewPhoto
            uri={imageUri}
            style={[styles.fullscreenPhoto, { aspectRatio }]}
            resizeMode={imageResizeMode}
          />
          <WatermarkBarBackground style={watermarkStyle} barStyle={styles.fullscreenWatermarkBar}>
            {displayOrgName ? (
              <Text
                style={[
                  styles.fullscreenWatermarkOrg,
                  { textAlign: titleAlign, color: watermarkTheme.titleColor },
                ]}
              >
                {displayOrgName}
              </Text>
            ) : null}
            {displayTitle ? (
              <Text style={[watermarkTitleStyle, { textAlign: titleAlign, color: watermarkTheme.titleColor }]}>
                {displayTitle}
              </Text>
            ) : null}
            {displayPlace ? (
              <Text style={[watermarkPlaceStyle, { textAlign: titleAlign, color: watermarkTheme.memoColor }]}>
                {displayPlace}
              </Text>
            ) : null}
            {displayExtra1 ? (
              <Text style={[watermarkPlaceStyle, { textAlign: titleAlign, color: watermarkTheme.memoColor }]}>
                {displayExtra1}
              </Text>
            ) : null}
            {displayExtra2 ? (
              <Text style={[watermarkPlaceStyle, { textAlign: titleAlign, color: watermarkTheme.memoColor }]}>
                {displayExtra2}
              </Text>
            ) : null}
            {displayMemo ? (
              <Text style={[watermarkMemoStyle, { textAlign: memoAlign, color: watermarkTheme.memoColor }]}>
                {displayMemo}
              </Text>
            ) : null}
            {coords ? (
              <Text style={[watermarkCoordsStyle, { textAlign: memoAlign, color: watermarkTheme.coordsColor }]}>
                {coords}
              </Text>
            ) : null}
            {displayFooterPhrase ? (
              <Text
                style={[
                  styles.fullscreenWatermarkPhrase,
                  { textAlign: memoAlign, color: watermarkTheme.coordsColor, fontSize: phraseFontSize },
                ]}
              >
                {displayFooterPhrase}
              </Text>
            ) : null}
          </WatermarkBarBackground>
        </View>
      </View>
    );
  }

  if (isThumbnail) {
    return (
      <View style={styles.thumbnailCaptionCard}>
        {renderThumbnailPhoto(styles.thumbnailCaptionPhoto, 'cover')}
        <View style={styles.thumbnailCaptionText}>
          {displayOrgName ? (
            <Text style={[styles.thumbnailOrg, { textAlign: titleAlign }]} numberOfLines={1}>
              {displayOrgName}
            </Text>
          ) : null}
          {renderCaptionTable(true)}
          {displayFooterPhrase ? (
            <Text
              style={[
                styles.thumbnailCaptionPhrase,
                { textAlign: memoAlign, fontSize: phraseFontSize },
              ]}
              numberOfLines={1}
            >
              {displayFooterPhrase}
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
        {displayOrgName ? (
          <Text style={[styles.fullscreenCaptionOrg, { textAlign: titleAlign }]}>{displayOrgName}</Text>
        ) : null}
        {renderCaptionTable(false)}
        {displayFooterPhrase ? (
          <Text
            style={[
              styles.fullscreenCaptionPhrase,
              { textAlign: memoAlign, fontSize: phraseFontSize },
            ]}
          >
            {displayFooterPhrase}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnailWatermarkPhotoSlot: {
    position: 'relative',
    width: '100%',
    height: 120,
    overflow: 'hidden',
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
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  thumbnailWatermarkTopBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  thumbnailWatermarkOrg: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  thumbnailWatermarkPhrase: {
    marginTop: 3,
    lineHeight: 13,
  },
  thumbnailWatermarkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  thumbnailWatermarkPlace: {
    marginTop: 2,
    fontSize: 10,
    color: '#f3f4f6',
    lineHeight: 14,
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
  captionTable: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  captionTableCompact: {
    marginTop: 2,
  },
  captionTableRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
  },
  captionTableLabel: {
    width: '28%',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#d1d5db',
  },
  captionTableLabelCompact: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  captionTableValue: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: '#374151',
  },
  captionTableValueCompact: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  thumbnailOrg: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  thumbnailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  thumbnailPlace: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 15,
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
  thumbnailCaptionPhrase: {
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fullscreenWatermarkTopBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fullscreenWatermarkOrg: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  fullscreenWatermarkPhrase: {
    marginTop: 4,
    lineHeight: 18,
  },
  fullscreenWatermarkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  fullscreenWatermarkPlace: {
    marginTop: 4,
    fontSize: 14,
    color: '#f3f4f6',
    lineHeight: 20,
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
  fullscreenCaptionOrg: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  fullscreenCaptionPhrase: {
    color: '#6b7280',
    lineHeight: 18,
  },
  fullscreenCaptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  fullscreenCaptionPlace: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 21,
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
