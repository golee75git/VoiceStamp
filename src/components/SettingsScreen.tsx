import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const backButtonImage = require('../../assets/back-icon.png');

const BACK_ICON_SIZE = 83;
const BOTTOM_BAR_OFFSET = 31;
const SCROLL_BOTTOM_INSET = BOTTOM_BAR_OFFSET + 12 + BACK_ICON_SIZE + (Platform.OS === 'ios' ? 28 : 16);

import { openInfoPage } from '../constants/infoUrls';
import { APK_BUILD_FILENAME } from '../constants/apkBuildLabel';
import { invalidateStampSaveModalLayoutCache } from '../services/stampSaveModalLayoutCache';
import { WATERMARK_CHIP_COLORS } from '../services/watermarkStyle';

import {
  DEFAULT_CAMERA_HAND,
  DEFAULT_CAMERA_HOME_BG,
  CAMERA_HOME_BG_OPTIONS,
  DEFAULT_MEMO_TEXT_ALIGN,
  DEFAULT_PDF_FILENAME_INCLUDE_DATETIME,
  DEFAULT_PDF_IMAGE_QUALITY,
  DEFAULT_PDF_PHOTOS_PER_PAGE,
  DEFAULT_PDF_SHOW_DATETIME,
  DEFAULT_EXPORT_FOOTER_DATETIME,
  DEFAULT_STAMPS_FOLDER,
  DEFAULT_GALLERY_SAVE_MODE,
  DEFAULT_CONTINUOUS_CAPTURE_CAMERA,
  DEFAULT_PRIMARY_CAPTURE_CAMERA,
  DEFAULT_CAPTURE_AFTER_MODE,
  DEFAULT_COORDS_LABEL_MODE,
  DEFAULT_LOCATION_MODE,
  DEFAULT_FLOOR_PICKER_MODE,
  DEFAULT_FLOOR_DISPLAY_MODE,
  DEFAULT_TITLE_DATETIME_MODE,
  DEFAULT_STAMP_TEXT_LAYOUT,
  DEFAULT_STAMP_TEXT_SIZE,
  DEFAULT_STAMP_LIST_DISPLAY_MODE,
  DEFAULT_WATERMARK_STYLE,
  DEFAULT_TITLE_TEXT_ALIGN,
  DEFAULT_OVERLAY_ORG_NAME,
  DEFAULT_OVERLAY_FOOTER_PHRASE,
  DEFAULT_OVERLAY_SHOW_ORG_NAME,
  DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE,
  DEFAULT_FIELD_TITLE_LABEL,
  DEFAULT_FIELD_PLACE_LABEL,
  DEFAULT_FIELD_MEMO_LABEL,
  DEFAULT_FIELD_EXTRA1_LABEL,
  DEFAULT_FIELD_EXTRA2_LABEL,
  DEFAULT_FIELD_EXTRA3_LABEL,
  DEFAULT_SHUTTER_SOUND,
  DEFAULT_PRIVACY_BLUR_ENABLED,
  DEFAULT_OCR_TITLE_MEMO_ENABLED,
  DEFAULT_QR_CAPTION_ENABLED,
  DEFAULT_MLKIT_SCENE_LABEL_ENABLED,
  OVERLAY_ORG_MAX_LENGTH,
  OVERLAY_PHRASE_MAX_LENGTH,
  FIELD_LABEL_MAX_LENGTH,
  gallerySaveModeLabel,
  continuousCaptureCameraLabel,
  primaryCaptureCameraLabel,
  captureAfterModeLabel,
  shutterSoundLabel,
  privacyBlurEnabledLabel,
  ocrTitleMemoEnabledLabel,
  qrCaptionEnabledLabel,
  mlkitSceneLabelEnabledLabel,
  floorPickerModeLabel,
  floorDisplayModeLabel,
  titleDatetimeModeLabel,
  coordsLabelModeLabel,
  locationModeLabel,
  loadSettingsForScreen,
  saveSettingsForScreen,
  cameraHomeBgLabel,
  type CameraHand,
  type CameraHomeBg,
  type CoordsLabelMode,
  type LocationMode,
  type PdfImageQuality,
  type PdfPhotosPerPage,
  stampTextLayoutLabel,
  stampTextSizeLabel,
  stampListDisplayModeLabel,
  watermarkStyleLabel,
  WATERMARK_STYLE_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  STAMP_TEXT_SIZE_OPTIONS,
  type FloorPickerMode,
  type FloorDisplayMode,
  type TitleDatetimeMode,
  type GallerySaveMode,
  type ContinuousCaptureCamera,
  type CaptureAfterMode,
  type StampTextLayout,
  type StampTextSize,
  type StampListDisplayMode,
  type WatermarkStyle,
  type TextAlign,
  textAlignLabel,
} from '../services/settingsService';

const FLOOR_PICKER_OPTIONS: FloorPickerMode[] = ['off', 'school_only', 'always'];
const FLOOR_DISPLAY_OPTIONS: FloorDisplayMode[] = ['suffix', 'cursor'];
const TITLE_DATETIME_OPTIONS: TitleDatetimeMode[] = ['none', 'date', 'datetime'];
const COORDS_LABEL_OPTIONS: CoordsLabelMode[] = ['gps', 'coords', 'off'];
const LOCATION_MODE_OPTIONS: LocationMode[] = ['auto', 'off'];
const STAMP_LIST_DISPLAY_OPTIONS: StampListDisplayMode[] = ['title_date', 'full'];

const PDF_OPTIONS: PdfPhotosPerPage[] = [1, 2, 3, 4];
const PDF_QUALITY_OPTIONS: { value: PdfImageQuality; label: string }[] = [
  { value: 'original', label: '원본' },
  { value: 'standard', label: '표준' },
  { value: 'compressed', label: '압축' },
];

function pdfQualityLabel(quality: PdfImageQuality): string {
  return PDF_QUALITY_OPTIONS.find((option) => option.value === quality)?.label ?? '원본';
}

function chipLabel(label: string, isDefault: boolean): string {
  return isDefault ? `${label} · 기본` : label;
}

type SettingsScreenProps = {
  onBack: () => void;
  backLabel?: string;
  refreshKey?: number;
  onSettingsSaved?: () => void;
  onShowOnboarding?: () => void;
  onOpenOssLicenses?: () => void;
};

export function SettingsScreen({
  onBack,
  backLabel = '목록',
  refreshKey = 0,
  onSettingsSaved,
  onShowOnboarding,
  onOpenOssLicenses,
}: SettingsScreenProps) {
  const [folderName, setFolderName] = useState(DEFAULT_STAMPS_FOLDER);
  const [pdfPhotosPerPage, setPdfPhotosPerPageState] = useState<PdfPhotosPerPage>(
    DEFAULT_PDF_PHOTOS_PER_PAGE,
  );
  const [pdfImageQuality, setPdfImageQualityState] = useState<PdfImageQuality>(
    DEFAULT_PDF_IMAGE_QUALITY,
  );
  const [titleTextAlign, setTitleTextAlignState] = useState<TextAlign>(DEFAULT_TITLE_TEXT_ALIGN);
  const [memoTextAlign, setMemoTextAlignState] = useState<TextAlign>(DEFAULT_MEMO_TEXT_ALIGN);
  const [pdfShowDatetime, setPdfShowDatetimeState] = useState(DEFAULT_PDF_SHOW_DATETIME);
  const [exportFooterDatetime, setExportFooterDatetimeState] = useState(
    DEFAULT_EXPORT_FOOTER_DATETIME,
  );
  const [pdfFilenameIncludeDatetime, setPdfFilenameIncludeDatetimeState] = useState(
    DEFAULT_PDF_FILENAME_INCLUDE_DATETIME,
  );
  const [stampTextLayout, setStampTextLayoutState] = useState<StampTextLayout>(
    DEFAULT_STAMP_TEXT_LAYOUT,
  );
  const [stampTextSize, setStampTextSizeState] = useState<StampTextSize>(DEFAULT_STAMP_TEXT_SIZE);
  const [stampListDisplayMode, setStampListDisplayModeState] = useState<StampListDisplayMode>(
    DEFAULT_STAMP_LIST_DISPLAY_MODE,
  );
  const [watermarkStyle, setWatermarkStyleState] = useState<WatermarkStyle>(
    DEFAULT_WATERMARK_STYLE,
  );
  const [gallerySaveMode, setGallerySaveModeState] = useState<GallerySaveMode>(
    DEFAULT_GALLERY_SAVE_MODE,
  );
  const [continuousCaptureCamera, setContinuousCaptureCameraState] = useState<ContinuousCaptureCamera>(
    DEFAULT_CONTINUOUS_CAPTURE_CAMERA,
  );
  const [primaryCaptureCamera, setPrimaryCaptureCameraState] = useState<ContinuousCaptureCamera>(
    DEFAULT_PRIMARY_CAPTURE_CAMERA,
  );
  const [captureAfterMode, setCaptureAfterModeState] = useState<CaptureAfterMode>(
    DEFAULT_CAPTURE_AFTER_MODE,
  );
  const [shutterSound, setShutterSoundState] = useState(DEFAULT_SHUTTER_SOUND);
  const [privacyBlurEnabled, setPrivacyBlurEnabledState] = useState(DEFAULT_PRIVACY_BLUR_ENABLED);
  const [ocrTitleMemoEnabled, setOcrTitleMemoEnabledState] = useState(DEFAULT_OCR_TITLE_MEMO_ENABLED);
  const [qrCaptionEnabled, setQrCaptionEnabledState] = useState(DEFAULT_QR_CAPTION_ENABLED);
  const [mlkitSceneLabelEnabled, setMlkitSceneLabelEnabledState] = useState(
    DEFAULT_MLKIT_SCENE_LABEL_ENABLED,
  );
  const [cameraHand, setCameraHandState] = useState<CameraHand>(DEFAULT_CAMERA_HAND);
  const [cameraHomeBg, setCameraHomeBgState] = useState<CameraHomeBg>(DEFAULT_CAMERA_HOME_BG);
  const [floorPickerMode, setFloorPickerModeState] = useState<FloorPickerMode>(
    DEFAULT_FLOOR_PICKER_MODE,
  );
  const [floorDisplayMode, setFloorDisplayModeState] = useState<FloorDisplayMode>(
    DEFAULT_FLOOR_DISPLAY_MODE,
  );
  const [titleDatetimeMode, setTitleDatetimeModeState] = useState<TitleDatetimeMode>(
    DEFAULT_TITLE_DATETIME_MODE,
  );
  const [coordsLabelMode, setCoordsLabelModeState] = useState<CoordsLabelMode>(
    DEFAULT_COORDS_LABEL_MODE,
  );
  const [locationMode, setLocationModeState] = useState<LocationMode>(DEFAULT_LOCATION_MODE);
  const [overlayOrgName, setOverlayOrgNameState] = useState(DEFAULT_OVERLAY_ORG_NAME);
  const [overlayFooterPhrase, setOverlayFooterPhraseState] = useState(DEFAULT_OVERLAY_FOOTER_PHRASE);
  const [overlayShowOrgName, setOverlayShowOrgNameState] = useState(DEFAULT_OVERLAY_SHOW_ORG_NAME);
  const [overlayShowFooterPhrase, setOverlayShowFooterPhraseState] = useState(
    DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE,
  );
  const [titleFieldLabel, setTitleFieldLabelState] = useState(DEFAULT_FIELD_TITLE_LABEL);
  const [placeFieldLabel, setPlaceFieldLabelState] = useState(DEFAULT_FIELD_PLACE_LABEL);
  const [memoFieldLabel, setMemoFieldLabelState] = useState(DEFAULT_FIELD_MEMO_LABEL);
  const [extra1FieldLabel, setExtra1FieldLabelState] = useState(DEFAULT_FIELD_EXTRA1_LABEL);
  const [extra2FieldLabel, setExtra2FieldLabelState] = useState(DEFAULT_FIELD_EXTRA2_LABEL);
  const [extra3FieldLabel, setExtra3FieldLabelState] = useState(DEFAULT_FIELD_EXTRA3_LABEL);
  const [saving, setSaving] = useState(false);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    let cancelled = false;
    void loadSettingsForScreen().then((snapshot) => {
      if (cancelled) {
        return;
      }
      setFolderName(snapshot.folderName);
      setPdfPhotosPerPageState(snapshot.pdfPhotosPerPage);
      setPdfImageQualityState(snapshot.pdfImageQuality);
      setTitleTextAlignState(snapshot.titleTextAlign);
      setMemoTextAlignState(snapshot.memoTextAlign);
      setPdfShowDatetimeState(snapshot.pdfShowDatetime);
      setExportFooterDatetimeState(snapshot.exportFooterDatetime);
      setPdfFilenameIncludeDatetimeState(snapshot.pdfFilenameIncludeDatetime);
      setStampTextLayoutState(snapshot.stampTextLayout);
      setStampTextSizeState(snapshot.stampTextSize);
      setStampListDisplayModeState(snapshot.stampListDisplayMode);
      setWatermarkStyleState(snapshot.watermarkStyle);
      setGallerySaveModeState(snapshot.gallerySaveMode);
      setPrimaryCaptureCameraState(snapshot.primaryCaptureCamera);
      setContinuousCaptureCameraState(snapshot.continuousCaptureCamera);
      setCaptureAfterModeState(snapshot.captureAfterMode);
      setShutterSoundState(snapshot.shutterSound);
      setPrivacyBlurEnabledState(snapshot.privacyBlurEnabled);
      setOcrTitleMemoEnabledState(snapshot.ocrTitleMemoEnabled);
      setQrCaptionEnabledState(snapshot.qrCaptionEnabled);
      setMlkitSceneLabelEnabledState(snapshot.mlkitSceneLabelEnabled);
      setCameraHandState(snapshot.cameraHand);
      setCameraHomeBgState(snapshot.cameraHomeBg);
      setFloorPickerModeState(snapshot.floorPickerMode);
      setFloorDisplayModeState(snapshot.floorDisplayMode);
      setTitleDatetimeModeState(snapshot.titleDatetimeMode);
      setCoordsLabelModeState(snapshot.coordsLabelMode);
      setLocationModeState(snapshot.locationMode);
      setOverlayOrgNameState(snapshot.overlayOrgName);
      setOverlayFooterPhraseState(snapshot.overlayFooterPhrase);
      setOverlayShowOrgNameState(snapshot.overlayShowOrgName);
      setOverlayShowFooterPhraseState(snapshot.overlayShowFooterPhrase);
      setTitleFieldLabelState(snapshot.titleFieldLabel);
      setPlaceFieldLabelState(snapshot.placeFieldLabel);
      setMemoFieldLabelState(snapshot.memoFieldLabel);
      setExtra1FieldLabelState(snapshot.extra1FieldLabel);
      setExtra2FieldLabelState(snapshot.extra2FieldLabel);
      setExtra3FieldLabelState(snapshot.extra3FieldLabel);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveSettingsForScreen({
        folderName,
        pdfPhotosPerPage,
        pdfImageQuality,
        titleTextAlign,
        memoTextAlign,
        pdfShowDatetime,
        exportFooterDatetime,
        pdfFilenameIncludeDatetime,
        stampTextLayout,
        stampTextSize,
        stampListDisplayMode,
        watermarkStyle,
        gallerySaveMode,
        primaryCaptureCamera,
        continuousCaptureCamera,
        captureAfterMode,
        shutterSound,
        privacyBlurEnabled,
        ocrTitleMemoEnabled,
        qrCaptionEnabled,
        mlkitSceneLabelEnabled,
        cameraHand,
        cameraHomeBg,
        floorPickerMode,
        floorDisplayMode,
        titleDatetimeMode,
        coordsLabelMode,
        locationMode,
        overlayOrgName,
        overlayFooterPhrase,
        overlayShowOrgName,
        overlayShowFooterPhrase,
        titleFieldLabel,
        placeFieldLabel,
        memoFieldLabel,
        extra1FieldLabel,
        extra2FieldLabel,
        extra3FieldLabel,
      });
      setFolderName(saved.folderName);
      setPdfPhotosPerPageState(saved.pdfPhotosPerPage);
      setPdfImageQualityState(saved.pdfImageQuality);
      setTitleTextAlignState(saved.titleTextAlign);
      setMemoTextAlignState(saved.memoTextAlign);
      setPdfShowDatetimeState(saved.pdfShowDatetime);
      setExportFooterDatetimeState(saved.exportFooterDatetime);
      setPdfFilenameIncludeDatetimeState(saved.pdfFilenameIncludeDatetime);
      setStampTextLayoutState(saved.stampTextLayout);
      setStampTextSizeState(saved.stampTextSize);
      setStampListDisplayModeState(saved.stampListDisplayMode);
      setWatermarkStyleState(saved.watermarkStyle);
      setGallerySaveModeState(saved.gallerySaveMode);
      setPrimaryCaptureCameraState(saved.primaryCaptureCamera);
      setContinuousCaptureCameraState(saved.continuousCaptureCamera);
      setCaptureAfterModeState(saved.captureAfterMode);
      setShutterSoundState(saved.shutterSound);
      setPrivacyBlurEnabledState(saved.privacyBlurEnabled);
      setOcrTitleMemoEnabledState(saved.ocrTitleMemoEnabled);
      setQrCaptionEnabledState(saved.qrCaptionEnabled);
      setMlkitSceneLabelEnabledState(saved.mlkitSceneLabelEnabled);
      setCameraHandState(saved.cameraHand);
      setCameraHomeBgState(saved.cameraHomeBg);
      setFloorPickerModeState(saved.floorPickerMode);
      setFloorDisplayModeState(saved.floorDisplayMode);
      setTitleDatetimeModeState(saved.titleDatetimeMode);
      setCoordsLabelModeState(saved.coordsLabelMode);
      setLocationModeState(saved.locationMode);
      setOverlayOrgNameState(saved.overlayOrgName);
      setOverlayFooterPhraseState(saved.overlayFooterPhrase);
      setOverlayShowOrgNameState(saved.overlayShowOrgName);
      setOverlayShowFooterPhraseState(saved.overlayShowFooterPhrase);
      setTitleFieldLabelState(saved.titleFieldLabel);
      setPlaceFieldLabelState(saved.placeFieldLabel);
      setMemoFieldLabelState(saved.memoFieldLabel);
      setExtra1FieldLabelState(saved.extra1FieldLabel);
      setExtra2FieldLabelState(saved.extra2FieldLabel);
      setExtra3FieldLabelState(saved.extra3FieldLabel);
      invalidateStampSaveModalLayoutCache();
      // 저장 직후 refreshKey bump 생략 — 설정 화면 재로드를 피함. 카메라/목록은 복귀 시 remount로 반영.
      Alert.alert('저장 완료', '설정을 저장했습니다.');
    } catch (e) {
      Alert.alert(
        '저장 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, styles.bodyWithBottomBar]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
          <Text style={styles.label}>사진 저장 폴더 (앱 내부)</Text>
          <Text style={styles.hint}>
            앱 데이터 안의 하위 폴더 이름입니다. 변경 후 새로 찍은 사진부터 적용됩니다. 기본값: {DEFAULT_STAMPS_FOLDER}
          </Text>
          {Platform.OS === 'web' && (
            <Text style={styles.webNote}>웹에서는 사진이 DB에 저장되어 이 설정이 적용되지 않습니다.</Text>
          )}
          <TextInput
            style={styles.input}
            value={folderName}
            onChangeText={setFolderName}
            placeholder={DEFAULT_STAMPS_FOLDER}
            autoCapitalize="none"
            editable={!saving}
          />

          <Text style={[styles.label, styles.sectionGap]}>위치 조회</Text>
          <Text style={styles.hint}>
            사용: GPS·로컬 학교 DB·카카오 주소/POI로 장소를 채웁니다. 사용 안 함: GPS와 로컬 학교 DB만 비교해 학교 근처면 학교명을 넣고, 카카오(네트워크) 조회는 하지 않습니다. 학교 밖이면 장소란을 비웁니다. 촬영 후 3버튼(연속·저장·다시 촬영)은 그대로입니다.
          </Text>
          <View style={styles.optionRow}>
            {LOCATION_MODE_OPTIONS.map((option) => {
              const selected = locationMode === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setLocationModeState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(locationModeLabel(option), option === DEFAULT_LOCATION_MODE)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>자동 제목</Text>
          <Text style={styles.hint}>
            새 사진 저장·수정 모달에 채워 넣을 제목 앞부분입니다. 위치 조회를 사용할 때는 장소 필드에 GPS·장소명이 따로 채워집니다.
          </Text>
          <View style={styles.optionRow}>
            {TITLE_DATETIME_OPTIONS.map((option) => {
              const selected = titleDatetimeMode === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setTitleDatetimeModeState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(titleDatetimeModeLabel(option), option === DEFAULT_TITLE_DATETIME_MODE)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>카메라 메뉴 위치 (손잡이)</Text>
          <Text style={styles.hint}>
            목록·설정·카메라 버튼을 왼손은 왼쪽 하단, 오른손은 오른쪽 하단에 배치합니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, cameraHand === 'left' && styles.optionButtonSelected]}
              onPress={() => setCameraHandState('left')}
              disabled={saving}
            >
              <Text
                style={[styles.optionButtonText, cameraHand === 'left' && styles.optionButtonTextSelected]}
              >
                {chipLabel('왼손', DEFAULT_CAMERA_HAND === 'left')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, cameraHand === 'right' && styles.optionButtonSelected]}
              onPress={() => setCameraHandState('right')}
              disabled={saving}
            >
              <Text
                style={[styles.optionButtonText, cameraHand === 'right' && styles.optionButtonTextSelected]}
              >
                {chipLabel('오른손', DEFAULT_CAMERA_HAND === 'right')}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>카메라 홈 배경</Text>
          <Text style={styles.hint}>
            촬영 전 화면 키비주얼입니다. 「기본」은 검정 뒤 배경, 「스타일 2」는 흰색 뒤 배경입니다. 앱에 포함된 이미지만 선택할 수 있습니다.
          </Text>
          <View style={styles.optionRow}>
            {CAMERA_HOME_BG_OPTIONS.map((option) => {
              const selected = cameraHomeBg === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setCameraHomeBgState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(cameraHomeBgLabel(option), option === DEFAULT_CAMERA_HOME_BG)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>PDF 페이지당 사진 수</Text>
          <Text style={styles.hint}>PDF보내기 시 한 페이지에 배치할 사진 개수입니다.</Text>
          <View style={styles.optionRow}>
            {PDF_OPTIONS.map((option) => {
              const selected = pdfPhotosPerPage === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setPdfPhotosPerPageState(option)}
                  disabled={saving}
                >
                  <Text style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
                    {chipLabel(String(option), option === DEFAULT_PDF_PHOTOS_PER_PAGE)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>PDF 화질(용량)</Text>
          <Text style={styles.hint}>PDF보내기 시 사진 압축 수준입니다. 원본 스탬프 사진은 바뀌지 않습니다.</Text>
          <View style={styles.optionRow}>
            {PDF_QUALITY_OPTIONS.map((option) => {
              const selected = pdfImageQuality === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setPdfImageQualityState(option.value)}
                  disabled={saving}
                >
                  <Text style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
                    {chipLabel(option.label, option.value === DEFAULT_PDF_IMAGE_QUALITY)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>PDF 촬영 일시 표시</Text>
          <Text style={styles.hint}>
            끄면 PDF·이미지·미리보기 제목의 날짜·시간 접두어(20260607_1045)를 표시하지 않습니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, pdfShowDatetime && styles.optionButtonSelected]}
              onPress={() => setPdfShowDatetimeState(true)}
              disabled={saving}
            >
              <Text
                style={[styles.optionButtonText, pdfShowDatetime && styles.optionButtonTextSelected]}
              >
                {chipLabel('표시', DEFAULT_PDF_SHOW_DATETIME)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, !pdfShowDatetime && styles.optionButtonSelected]}
              onPress={() => setPdfShowDatetimeState(false)}
              disabled={saving}
            >
              <Text
                style={[styles.optionButtonText, !pdfShowDatetime && styles.optionButtonTextSelected]}
              >
                {chipLabel('숨김', !DEFAULT_PDF_SHOW_DATETIME)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>하단 촬영 일시</Text>
          <Text style={styles.hint}>
            PDF·이미지의 「사진 아래(별도 영역)」맨 아래에 촬영(저장) 일시를 표시합니다. 워터마크 모드에는
            적용되지 않습니다. 제목 접두어와는 별개입니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, exportFooterDatetime && styles.optionButtonSelected]}
              onPress={() => setExportFooterDatetimeState(true)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  exportFooterDatetime && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('표시', DEFAULT_EXPORT_FOOTER_DATETIME)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, !exportFooterDatetime && styles.optionButtonSelected]}
              onPress={() => setExportFooterDatetimeState(false)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !exportFooterDatetime && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('숨김', !DEFAULT_EXPORT_FOOTER_DATETIME)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>PDF 파일명 날짜·시간</Text>
          <Text style={styles.hint}>PDF보내기 시 파일명 기본값에 날짜·시간 포함 여부입니다.</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, pdfFilenameIncludeDatetime && styles.optionButtonSelected]}
              onPress={() => setPdfFilenameIncludeDatetimeState(true)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  pdfFilenameIncludeDatetime && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('포함', DEFAULT_PDF_FILENAME_INCLUDE_DATETIME)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, !pdfFilenameIncludeDatetime && styles.optionButtonSelected]}
              onPress={() => setPdfFilenameIncludeDatetimeState(false)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !pdfFilenameIncludeDatetime && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('제외', !DEFAULT_PDF_FILENAME_INCLUDE_DATETIME)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>필드 표시명</Text>
          <Text style={styles.hint}>
            저장 화면 라벨과 PDF·워터마크에 「표시명: 내용」으로 붙습니다. 저장 화면에서 칸 이름을 탭해도 여기와 같이 저장됩니다. 비우면 기본값(제목·장소·메모·추가1·추가2·추가3)으로 돌아갑니다. DB 저장 구조는 바뀌지 않습니다.
          </Text>
          <Text style={styles.label}>제목 칸 이름</Text>
          <TextInput
            style={styles.input}
            value={titleFieldLabel}
            onChangeText={setTitleFieldLabelState}
            placeholder={DEFAULT_FIELD_TITLE_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>장소 칸 이름</Text>
          <TextInput
            style={styles.input}
            value={placeFieldLabel}
            onChangeText={setPlaceFieldLabelState}
            placeholder={DEFAULT_FIELD_PLACE_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>메모 칸 이름</Text>
          <TextInput
            style={styles.input}
            value={memoFieldLabel}
            onChangeText={setMemoFieldLabelState}
            placeholder={DEFAULT_FIELD_MEMO_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>추가1 칸 이름</Text>
          <TextInput
            style={styles.input}
            value={extra1FieldLabel}
            onChangeText={setExtra1FieldLabelState}
            placeholder={DEFAULT_FIELD_EXTRA1_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>추가2 칸 이름</Text>
          <TextInput
            style={styles.input}
            value={extra2FieldLabel}
            onChangeText={setExtra2FieldLabelState}
            placeholder={DEFAULT_FIELD_EXTRA2_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>추가3 칸 이름</Text>
          <TextInput
            style={styles.input}
            value={extra3FieldLabel}
            onChangeText={setExtra3FieldLabelState}
            placeholder={DEFAULT_FIELD_EXTRA3_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />

          <Text style={[styles.label, styles.sectionGap]}>사진 오버레이 문구</Text>
          <Text style={styles.hint}>
            PDF·이미지·미리보기에 표시할 기관명(상단)과 하단 문구입니다. 저장 폴더명과 별도입니다.
          </Text>
          <Text style={styles.label}>기관명</Text>
          <TextInput
            style={styles.input}
            value={overlayOrgName}
            onChangeText={setOverlayOrgNameState}
            placeholder="예: ○○초등학교"
            maxLength={OVERLAY_ORG_MAX_LENGTH}
            editable={!saving}
          />
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, overlayShowOrgName && styles.optionButtonSelected]}
              onPress={() => setOverlayShowOrgNameState(true)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  overlayShowOrgName && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('표시', DEFAULT_OVERLAY_SHOW_ORG_NAME)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, !overlayShowOrgName && styles.optionButtonSelected]}
              onPress={() => setOverlayShowOrgNameState(false)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !overlayShowOrgName && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('숨김', !DEFAULT_OVERLAY_SHOW_ORG_NAME)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>하단 문구</Text>
          <TextInput
            style={styles.input}
            value={overlayFooterPhrase}
            onChangeText={setOverlayFooterPhraseState}
            placeholder="예: 촬영일 기준 현장 기록"
            maxLength={OVERLAY_PHRASE_MAX_LENGTH}
            editable={!saving}
          />
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, overlayShowFooterPhrase && styles.optionButtonSelected]}
              onPress={() => setOverlayShowFooterPhraseState(true)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  overlayShowFooterPhrase && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('표시', DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, !overlayShowFooterPhrase && styles.optionButtonSelected]}
              onPress={() => setOverlayShowFooterPhraseState(false)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !overlayShowFooterPhrase && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('숨김', !DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>제목·메모 표시 방식</Text>
          <Text style={styles.hint}>
            PDF·이미지 저장 시 제목과 메모를 사진 아래(별도 영역·표) 또는 사진 위(워터마크·줄글)에 표시합니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, stampTextLayout === 'caption' && styles.optionButtonSelected]}
              onPress={() => setStampTextLayoutState('caption')}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  stampTextLayout === 'caption' && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('별도 영역', DEFAULT_STAMP_TEXT_LAYOUT === 'caption')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, stampTextLayout === 'watermark' && styles.optionButtonSelected]}
              onPress={() => setStampTextLayoutState('watermark')}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  stampTextLayout === 'watermark' && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel('워터마크', DEFAULT_STAMP_TEXT_LAYOUT === 'watermark')}
              </Text>
            </Pressable>
          </View>

          {stampTextLayout === 'watermark' ? (
            <>
              <Text style={[styles.label, styles.sectionGap]}>워터마크 스타일</Text>
              <Text style={styles.hint}>
                사진 바 배경 색입니다. 미리보기·PDF·이미지 저장에 적용됩니다.
              </Text>
              <View style={styles.paletteGrid}>
                {WATERMARK_STYLE_OPTIONS.map((option) => {
                  const selected = watermarkStyle === option;
                  const chipColor = WATERMARK_CHIP_COLORS[option];
                  return (
                    <Pressable
                      key={option}
                      style={styles.paletteItem}
                      onPress={() => setWatermarkStyleState(option)}
                      disabled={saving}
                      accessibilityLabel={watermarkStyleLabel(option)}
                      accessibilityState={{ selected }}
                    >
                      <View
                        style={[
                          styles.paletteChip,
                          { backgroundColor: chipColor },
                          option === 'solid_light' && styles.paletteChipLightBorder,
                          selected && styles.paletteChipSelected,
                        ]}
                      />
                      <Text
                        style={[styles.paletteLabel, selected && styles.paletteLabelSelected]}
                        numberOfLines={1}
                      >
                        {chipLabel(watermarkStyleLabel(option), option === DEFAULT_WATERMARK_STYLE)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <Text style={[styles.label, styles.sectionGap]}>좌표 표기</Text>
          <Text style={styles.hint}>
            캡션·PDF·이미지에 GPS 좌표를 넣을 때 앞에 붙는 말입니다. 없음은 좌표를 표시하지 않습니다.
          </Text>
          <View style={styles.optionRow}>
            {COORDS_LABEL_OPTIONS.map((option) => {
              const selected = coordsLabelMode === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setCoordsLabelModeState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(coordsLabelModeLabel(option), option === DEFAULT_COORDS_LABEL_MODE)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>층 선택</Text>
          <Text style={styles.hint}>
            「학교일 때만」은 장소·폴더명에 학교가 있을 때만 층 칩을 보이고, 직전 층도 학교에만 이어집니다. 비학교에는 층을 저장하지 않습니다.
          </Text>
          <View style={styles.optionRow}>
            {FLOOR_PICKER_OPTIONS.map((option) => {
              const selected = floorPickerMode === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setFloorPickerModeState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(floorPickerModeLabel(option), option === DEFAULT_FLOOR_PICKER_MODE)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>층 표기</Text>
          <Text style={styles.hint}>
            층 칩을 눌렀을 때 장소에 넣는 방식입니다. 「장소 커서에 삽입」은 장소 입력란의 커서 위치에 3층 등을 넣습니다.
          </Text>
          <View style={styles.optionRow}>
            {FLOOR_DISPLAY_OPTIONS.map((option) => {
              const selected = floorDisplayMode === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setFloorDisplayModeState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(floorDisplayModeLabel(option), option === DEFAULT_FLOOR_DISPLAY_MODE)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>일반 촬영 카메라</Text>
          <Text style={styles.hint}>
            홈에서 사진 1장을 찍을 때 사용합니다. 시스템은 화질·줌에 유리하고, 앱 내는 확인 화면 없이 빠르며 1x·3x·5x 배율과 핀치·더블탭으로 확대할 수 있습니다.
          </Text>
          <View style={styles.optionRow}>
            {(['system', 'in_app'] as ContinuousCaptureCamera[]).map((option) => {
              const selected = primaryCaptureCamera === option;
              return (
                <Pressable
                  key={`primary-${option}`}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setPrimaryCaptureCameraState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(primaryCaptureCameraLabel(option), option === DEFAULT_PRIMARY_CAPTURE_CAMERA)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>촬영 후</Text>
          <Text style={styles.hint}>
            「선택 화면」은 연속 촬영·저장·다시 촬영 중 고릅니다. 「저장 화면 바로」는 런처 없이 제목·메모 입력 화면으로 바로 갑니다.
          </Text>
          <View style={styles.optionRow}>
            {(['action_sheet', 'save_modal'] as CaptureAfterMode[]).map((option) => {
              const selected = captureAfterMode === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setCaptureAfterModeState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(captureAfterModeLabel(option), option === DEFAULT_CAPTURE_AFTER_MODE)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>연속 촬영 카메라</Text>
          <Text style={styles.hint}>
            연속 촬영 2장째부터 사용합니다. 1장은 일반 촬영 카메라 설정으로 찍은 뒤, 「앱 내」는 카메라를 다시 열지 않아 빠르며 1x·3x·5x 배율과 핀치·더블탭 확대를 지원합니다.
          </Text>
          <View style={styles.optionRow}>
            {(['in_app', 'system'] as ContinuousCaptureCamera[]).map((option) => {
              const selected = continuousCaptureCamera === option;
              return (
                <Pressable
                  key={`continuous-${option}`}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setContinuousCaptureCameraState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {chipLabel(continuousCaptureCameraLabel(option), option === DEFAULT_CONTINUOUS_CAPTURE_CAMERA)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>앱 내 촬영음</Text>
          <Text style={styles.hint}>
            앱 내 카메라로 찍을 때만 적용됩니다. 시스템 카메라는 기기 설정을 따릅니다. 일부 기기에서는 OS 정책으로 끌 수 없을 수 있습니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, shutterSound && styles.optionButtonSelected]}
              onPress={() => setShutterSoundState(true)}
              disabled={saving}
            >
              <Text
                style={[styles.optionButtonText, shutterSound && styles.optionButtonTextSelected]}
              >
                {chipLabel('켜기', DEFAULT_SHUTTER_SOUND)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, !shutterSound && styles.optionButtonSelected]}
              onPress={() => setShutterSoundState(false)}
              disabled={saving}
            >
              <Text
                style={[styles.optionButtonText, !shutterSound && styles.optionButtonTextSelected]}
              >
                {chipLabel('끄기', !DEFAULT_SHUTTER_SOUND)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>저장 시 갤러리</Text>
          <Text style={styles.hint}>
            스탬프는 항상 앱 목록에 저장됩니다. 앱만: 갤러리에 넣지 않습니다 (연속 촬영에 가장 빠름). 그 외는
            갤러리 앨범에 저장하며, 캡션·워터마크는 위 「제목·메모 표시 방식」을 따릅니다.
          </Text>
          <View style={styles.optionRow}>
            {(['app_only', 'original_only', 'caption_only', 'original_and_caption'] as GallerySaveMode[]).map(
              (option) => {
                const selected = gallerySaveMode === option;
                return (
                  <Pressable
                    key={option}
                    style={[styles.optionButton, selected && styles.optionButtonSelected]}
                    onPress={() => setGallerySaveModeState(option)}
                    disabled={saving}
                  >
                    <Text
                      style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                    >
                      {chipLabel(gallerySaveModeLabel(option), option === DEFAULT_GALLERY_SAVE_MODE)}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>개인정보 가리기</Text>
          <Text style={styles.hint}>
            사용: 저장 화면에서 얼굴·숫자 영역을 폰 안에서만 흐리게 할 수 있습니다. 서버로 보내지 않습니다.
            (Android) 기본은 끔이며, 버튼을 눌러 확인 후 적용합니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, !privacyBlurEnabled && styles.optionButtonSelected]}
              onPress={() => setPrivacyBlurEnabledState(false)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !privacyBlurEnabled && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel(privacyBlurEnabledLabel(false), !DEFAULT_PRIVACY_BLUR_ENABLED)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, privacyBlurEnabled && styles.optionButtonSelected]}
              onPress={() => setPrivacyBlurEnabledState(true)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  privacyBlurEnabled && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel(privacyBlurEnabledLabel(true), DEFAULT_PRIVACY_BLUR_ENABLED)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>사진 글자로 제목·메모</Text>
          <Text style={styles.hint}>
            사용: 저장 화면에서 「글자 읽어 채우기」로 사진 속 글자를 폰 안에서만 읽어 제목·메모 초안을
            만듭니다. 긴 글은 메모 칸·저장 시트에서 스크롤됩니다. 서버로 보내지 않으며, AI로 문장을
            새로 쓰지 않습니다. (Android) 기본은 끔입니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, !ocrTitleMemoEnabled && styles.optionButtonSelected]}
              onPress={() => setOcrTitleMemoEnabledState(false)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !ocrTitleMemoEnabled && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel(ocrTitleMemoEnabledLabel(false), !DEFAULT_OCR_TITLE_MEMO_ENABLED)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, ocrTitleMemoEnabled && styles.optionButtonSelected]}
              onPress={() => setOcrTitleMemoEnabledState(true)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  ocrTitleMemoEnabled && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel(ocrTitleMemoEnabledLabel(true), DEFAULT_OCR_TITLE_MEMO_ENABLED)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>사진 URL → QR (별도 영역)</Text>
          <Text style={styles.hint}>
            사용: 저장 화면에서 URL을 확인·수정한 뒤, 「사진 아래(별도 영역)」이미지에 QR을
            넣습니다. 자동 찾기는 Android에서 사진 글자(OCR)로만 하며 서버로 보내지 않습니다.
            http(s)만 허용합니다. 워터마크 모드에는 아직 적용되지 않습니다. 기본은 끔입니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, !qrCaptionEnabled && styles.optionButtonSelected]}
              onPress={() => setQrCaptionEnabledState(false)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !qrCaptionEnabled && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel(qrCaptionEnabledLabel(false), !DEFAULT_QR_CAPTION_ENABLED)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, qrCaptionEnabled && styles.optionButtonSelected]}
              onPress={() => setQrCaptionEnabledState(true)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  qrCaptionEnabled && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel(qrCaptionEnabledLabel(true), DEFAULT_QR_CAPTION_ENABLED)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>촬영 후 장면 키워드 자동 입력</Text>
          <Text style={styles.hint}>
            사용: 저장 화면이 열리면 사진을 폰 안에서만 분석해 메모에 장면 키워드 초안을 넣습니다.
            서버로 보내지 않으며, 긴 문장 설명이 아닙니다. (Android) 기본은 끔입니다.
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionButton, !mlkitSceneLabelEnabled && styles.optionButtonSelected]}
              onPress={() => setMlkitSceneLabelEnabledState(false)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !mlkitSceneLabelEnabled && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel(mlkitSceneLabelEnabledLabel(false), !DEFAULT_MLKIT_SCENE_LABEL_ENABLED)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionButton, mlkitSceneLabelEnabled && styles.optionButtonSelected]}
              onPress={() => setMlkitSceneLabelEnabledState(true)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  mlkitSceneLabelEnabled && styles.optionButtonTextSelected,
                ]}
              >
                {chipLabel(mlkitSceneLabelEnabledLabel(true), DEFAULT_MLKIT_SCENE_LABEL_ENABLED)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>제목 정렬</Text>
          <Text style={styles.hint}>목록·입력·PDF·이미지 저장에서 제목 텍스트 정렬입니다.</Text>
          <View style={styles.optionRow}>
            {TEXT_ALIGN_OPTIONS.map((option) => {
              const selected = titleTextAlign === option;
              return (
                <Pressable
                  key={`title-${option}`}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setTitleTextAlignState(option)}
                  disabled={saving}
                >
                  <Text style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
                    {chipLabel(textAlignLabel(option), option === DEFAULT_TITLE_TEXT_ALIGN)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>메모 정렬</Text>
          <Text style={styles.hint}>목록·입력·PDF·이미지 저장에서 메모 텍스트 정렬입니다.</Text>
          <View style={styles.optionRow}>
            {TEXT_ALIGN_OPTIONS.map((option) => {
              const selected = memoTextAlign === option;
              return (
                <Pressable
                  key={`memo-${option}`}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setMemoTextAlignState(option)}
                  disabled={saving}
                >
                  <Text style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
                    {chipLabel(textAlignLabel(option), option === DEFAULT_MEMO_TEXT_ALIGN)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>저장 목록 표시</Text>
          <Text style={styles.hint}>
            목록 카드에 제목·날짜만 보일지, 장소·추가·메모까지 모두 보일지 선택합니다. PDF·이미지 내보내기에는
            영향 없습니다.
          </Text>
          <View style={styles.optionRow}>
            {STAMP_LIST_DISPLAY_OPTIONS.map((option) => {
              const selected = stampListDisplayMode === option;
              return (
                <Pressable
                  key={`list-display-${option}`}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setStampListDisplayModeState(option)}
                  disabled={saving}
                >
                  <Text style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
                    {chipLabel(
                      stampListDisplayModeLabel(option),
                      option === DEFAULT_STAMP_LIST_DISPLAY_MODE,
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>글자 크기</Text>
          <Text style={styles.hint}>
            저장·수정 입력칸과 미리보기·워터마크·PDF·갤러리 이미지 저장에 적용됩니다. 시스템 글꼴만 사용합니다.
          </Text>
          <View style={styles.optionRow}>
            {STAMP_TEXT_SIZE_OPTIONS.map((option) => {
              const selected = stampTextSize === option;
              return (
                <Pressable
                  key={`text-size-${option}`}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setStampTextSizeState(option)}
                  disabled={saving}
                >
                  <Text style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
                    {chipLabel(stampTextSizeLabel(option), option === DEFAULT_STAMP_TEXT_SIZE)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>앱 정보</Text>
          <Text style={styles.hint}>
            VoiceStamp {appVersion}
            {Platform.OS === 'android' && APK_BUILD_FILENAME ? ` · ${APK_BUILD_FILENAME}` : ''}
          </Text>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void openInfoPage('/privacy')}
          >
            <Text style={styles.secondaryButtonText}>개인정보 처리 안내</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void openInfoPage('/license')}
          >
            <Text style={styles.secondaryButtonText}>라이선스</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => onOpenOssLicenses?.()}
            disabled={!onOpenOssLicenses}
          >
            <Text style={styles.secondaryButtonText}>오픈소스 라이선스</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => onShowOnboarding?.()}
            disabled={!onShowOnboarding}
          >
            <Text style={styles.secondaryButtonText}>온보딩 다시 보기</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void openInfoPage('/help')}
          >
            <Text style={styles.secondaryButtonText}>도움말</Text>
          </Pressable>
          <Text style={styles.copyright}>© 2026 이형우</Text>
      </ScrollView>

      <View style={styles.bottomBar}>
          <Pressable
            style={styles.bottomBackSlot}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={`뒤로가기, ${backLabel}`}
          >
            <Image source={backButtonImage} style={styles.bottomBackButtonImage} resizeMode="contain" />
          </Pressable>
          <Pressable
            style={[styles.primaryButton, styles.saveInBar, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>저장</Text>
            )}
          </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 24,
    gap: 12,
  },
  bodyWithBottomBar: {
    paddingBottom: SCROLL_BOTTOM_INSET,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: BOTTOM_BAR_OFFSET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomBackSlot: {
    width: BACK_ICON_SIZE,
    height: BACK_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveInBar: {
    flex: 1,
    marginTop: 0,
  },
  bottomBackButtonImage: {
    width: BACK_ICON_SIZE,
    height: BACK_ICON_SIZE,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  sectionGap: {
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  webNote: {
    fontSize: 13,
    color: '#b45309',
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
  optionButtonTextSelected: {
    color: '#2563eb',
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  paletteItem: {
    width: '18%',
    minWidth: 52,
    alignItems: 'center',
    gap: 4,
  },
  paletteChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  paletteChipLightBorder: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  paletteChipSelected: {
    borderWidth: 3,
    borderColor: '#2563eb',
  },
  paletteLabel: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  paletteLabelSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  copyright: {
    marginTop: 4,
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
