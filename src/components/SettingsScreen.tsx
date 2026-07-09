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
const BACK_ICON_BOTTOM = Platform.OS === 'ios' ? 28 : 16;

import { openInfoPage } from '../constants/infoUrls';
import { APK_BUILD_FILENAME } from '../constants/apkBuildLabel';
import { invalidateStampSaveModalLayoutCache } from '../services/stampSaveModalLayoutCache';
import { WATERMARK_CHIP_COLORS } from '../services/watermarkStyle';

import {
  DEFAULT_CAMERA_HAND,
  DEFAULT_MEMO_TEXT_ALIGN,
  DEFAULT_PDF_FILENAME_INCLUDE_DATETIME,
  DEFAULT_PDF_IMAGE_QUALITY,
  DEFAULT_PDF_PHOTOS_PER_PAGE,
  DEFAULT_PDF_SHOW_DATETIME,
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
  DEFAULT_WATERMARK_STYLE,
  DEFAULT_TITLE_TEXT_ALIGN,
  DEFAULT_OVERLAY_ORG_NAME,
  DEFAULT_OVERLAY_FOOTER_PHRASE,
  DEFAULT_OVERLAY_SHOW_ORG_NAME,
  DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE,
  OVERLAY_ORG_MAX_LENGTH,
  OVERLAY_PHRASE_MAX_LENGTH,
  gallerySaveModeLabel,
  continuousCaptureCameraLabel,
  primaryCaptureCameraLabel,
  captureAfterModeLabel,
  floorPickerModeLabel,
  floorDisplayModeLabel,
  titleDatetimeModeLabel,
  coordsLabelModeLabel,
  getLocationMode,
  locationModeLabel,
  getCoordsLabelMode,
  getFloorDisplayMode,
  getFloorPickerMode,
  getTitleDatetimeMode,
  getCameraHand,
  getGallerySaveMode,
  getContinuousCaptureCamera,
  getPrimaryCaptureCamera,
  getCaptureAfterMode,
  getMemoTextAlign,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getPdfFilenameIncludeDatetime,
  getPdfImageQuality,
  getPdfPhotosPerPage,
  getPdfShowDatetime,
  getStampTextLayout,
  getWatermarkStyle,
  getStampsFolderName,
  getTitleTextAlign,
  type CameraHand,
  type CoordsLabelMode,
  type LocationMode,
  type PdfImageQuality,
  type PdfPhotosPerPage,
  setCameraHand,
  setCoordsLabelMode,
  setLocationMode,
  setFloorDisplayMode,
  setFloorPickerMode,
  setTitleDatetimeMode,
  setGallerySaveMode,
  setContinuousCaptureCamera,
  setPrimaryCaptureCamera,
  setCaptureAfterMode,
  setMemoTextAlign,
  setOverlayFooterPhrase,
  setOverlayOrgName,
  setOverlayShowFooterPhrase,
  setOverlayShowOrgName,
  setPdfFilenameIncludeDatetime,
  setPdfImageQuality,
  setPdfPhotosPerPage,
  setPdfShowDatetime,
  setStampTextLayout,
  setWatermarkStyle,
  setStampsFolderName,
  setTitleTextAlign,
  stampTextLayoutLabel,
  watermarkStyleLabel,
  WATERMARK_STYLE_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  type FloorPickerMode,
  type FloorDisplayMode,
  type TitleDatetimeMode,
  type GallerySaveMode,
  type ContinuousCaptureCamera,
  type CaptureAfterMode,
  type StampTextLayout,
  type WatermarkStyle,
  type TextAlign,
  textAlignLabel,
} from '../services/settingsService';

const FLOOR_PICKER_OPTIONS: FloorPickerMode[] = ['off', 'school_only', 'always'];
const FLOOR_DISPLAY_OPTIONS: FloorDisplayMode[] = ['suffix', 'cursor'];
const TITLE_DATETIME_OPTIONS: TitleDatetimeMode[] = ['none', 'date', 'datetime'];
const COORDS_LABEL_OPTIONS: CoordsLabelMode[] = ['gps', 'coords', 'off'];
const LOCATION_MODE_OPTIONS: LocationMode[] = ['auto', 'off'];

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
  const [pdfFilenameIncludeDatetime, setPdfFilenameIncludeDatetimeState] = useState(
    DEFAULT_PDF_FILENAME_INCLUDE_DATETIME,
  );
  const [stampTextLayout, setStampTextLayoutState] = useState<StampTextLayout>(
    DEFAULT_STAMP_TEXT_LAYOUT,
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
  const [cameraHand, setCameraHandState] = useState<CameraHand>(DEFAULT_CAMERA_HAND);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [name, perPage, quality, titleAlign, memoAlign, showDatetime, filenameDatetime, textLayout, wmStyle, galleryMode, primaryCamera, continuousCamera, afterCapture, hand, floorMode, floorDisplay, titleDatetime, coordsMode, locMode, orgName, footerPhrase, showOrgName, showFooterPhrase] =
          await Promise.all([
          getStampsFolderName(),
          getPdfPhotosPerPage(),
          getPdfImageQuality(),
          getTitleTextAlign(),
          getMemoTextAlign(),
          getPdfShowDatetime(),
          getPdfFilenameIncludeDatetime(),
          getStampTextLayout(),
          getWatermarkStyle(),
          getGallerySaveMode(),
          getPrimaryCaptureCamera(),
          getContinuousCaptureCamera(),
          getCaptureAfterMode(),
          getCameraHand(),
          getFloorPickerMode(),
          getFloorDisplayMode(),
          getTitleDatetimeMode(),
          getCoordsLabelMode(),
          getLocationMode(),
          getOverlayOrgName(),
          getOverlayFooterPhrase(),
          getOverlayShowOrgName(),
          getOverlayShowFooterPhrase(),
        ]);
        setFolderName(name);
        setPdfPhotosPerPageState(perPage);
        setPdfImageQualityState(quality);
        setTitleTextAlignState(titleAlign);
        setMemoTextAlignState(memoAlign);
        setPdfShowDatetimeState(showDatetime);
        setPdfFilenameIncludeDatetimeState(filenameDatetime);
        setStampTextLayoutState(textLayout);
        setWatermarkStyleState(wmStyle);
        setGallerySaveModeState(galleryMode);
        setPrimaryCaptureCameraState(primaryCamera);
        setContinuousCaptureCameraState(continuousCamera);
        setCaptureAfterModeState(afterCapture);
        setCameraHandState(hand);
        setFloorPickerModeState(floorMode);
        setFloorDisplayModeState(floorDisplay);
        setTitleDatetimeModeState(titleDatetime);
        setCoordsLabelModeState(coordsMode);
        setLocationModeState(locMode);
        setOverlayOrgNameState(orgName);
        setOverlayFooterPhraseState(footerPhrase);
        setOverlayShowOrgNameState(showOrgName);
        setOverlayShowFooterPhraseState(showFooterPhrase);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const [
        savedFolder,
        savedPerPage,
        savedQuality,
        savedTitleAlign,
        savedMemoAlign,
        savedShowDatetime,
        savedFilenameDatetime,
        savedTextLayout,
        savedWatermarkStyle,
        savedGalleryMode,
        savedPrimaryCaptureCamera,
        savedContinuousCaptureCamera,
        savedCaptureAfterMode,
        savedCameraHand,
        savedFloorPickerMode,
        savedFloorDisplayMode,
        savedTitleDatetimeMode,
        savedCoordsLabelMode,
        savedLocationMode,
        savedOrgName,
        savedFooterPhrase,
        savedShowOrgName,
        savedShowFooterPhrase,
      ] = await Promise.all([
          setStampsFolderName(folderName),
          setPdfPhotosPerPage(pdfPhotosPerPage),
          setPdfImageQuality(pdfImageQuality),
          setTitleTextAlign(titleTextAlign),
          setMemoTextAlign(memoTextAlign),
          setPdfShowDatetime(pdfShowDatetime),
          setPdfFilenameIncludeDatetime(pdfFilenameIncludeDatetime),
          setStampTextLayout(stampTextLayout),
          setWatermarkStyle(watermarkStyle),
          setGallerySaveMode(gallerySaveMode),
          setPrimaryCaptureCamera(primaryCaptureCamera),
          setContinuousCaptureCamera(continuousCaptureCamera),
          setCaptureAfterMode(captureAfterMode),
          setCameraHand(cameraHand),
          setFloorPickerMode(floorPickerMode),
          setFloorDisplayMode(floorDisplayMode),
          setTitleDatetimeMode(titleDatetimeMode),
          setCoordsLabelMode(coordsLabelMode),
          setLocationMode(locationMode),
          setOverlayOrgName(overlayOrgName),
          setOverlayFooterPhrase(overlayFooterPhrase),
          setOverlayShowOrgName(overlayShowOrgName),
          setOverlayShowFooterPhrase(overlayShowFooterPhrase),
        ]);
      setFolderName(savedFolder);
      setPdfPhotosPerPageState(savedPerPage);
      setPdfImageQualityState(savedQuality);
      setTitleTextAlignState(savedTitleAlign);
      setMemoTextAlignState(savedMemoAlign);
      setPdfShowDatetimeState(savedShowDatetime);
      setPdfFilenameIncludeDatetimeState(savedFilenameDatetime);
      setStampTextLayoutState(savedTextLayout);
      setWatermarkStyleState(savedWatermarkStyle);
      setGallerySaveModeState(savedGalleryMode);
      setPrimaryCaptureCameraState(savedPrimaryCaptureCamera);
      setContinuousCaptureCameraState(savedContinuousCaptureCamera);
      setCaptureAfterModeState(savedCaptureAfterMode);
      setCameraHandState(savedCameraHand);
      setFloorPickerModeState(savedFloorPickerMode);
      setFloorDisplayModeState(savedFloorDisplayMode);
      setTitleDatetimeModeState(savedTitleDatetimeMode);
      setCoordsLabelModeState(savedCoordsLabelMode);
      setLocationModeState(savedLocationMode);
      setOverlayOrgNameState(savedOrgName);
      setOverlayFooterPhraseState(savedFooterPhrase);
      setOverlayShowOrgNameState(savedShowOrgName);
      setOverlayShowFooterPhraseState(savedShowFooterPhrase);
      invalidateStampSaveModalLayoutCache();
      onSettingsSaved?.();
      Alert.alert(
        '저장 완료',
        `새 사진은 "${savedFolder}" 폴더에 저장됩니다.\n카메라 메뉴: ${savedCameraHand === 'left' ? '왼손(왼쪽 하단)' : '오른손(오른쪽 하단)'}.\n일반 촬영: ${primaryCaptureCameraLabel(savedPrimaryCaptureCamera)}.\n촬영 후: ${captureAfterModeLabel(savedCaptureAfterMode)}.\n연속 촬영: ${continuousCaptureCameraLabel(savedContinuousCaptureCamera)}.\n위치 조회: ${locationModeLabel(savedLocationMode)}.\n자동 제목: ${titleDatetimeModeLabel(savedTitleDatetimeMode)}.\nPDF는 페이지당 ${savedPerPage}장, 화질 ${pdfQualityLabel(savedQuality)}.\nPDF 일시 ${savedShowDatetime ? '표시' : '숨김'}, 파일명 날짜·시간 ${savedFilenameDatetime ? '포함' : '제외'}.\n제목·메모 ${stampTextLayoutLabel(savedTextLayout)}${savedTextLayout === 'watermark' ? ` (${watermarkStyleLabel(savedWatermarkStyle)})` : ''}, 좌표 표기 ${coordsLabelModeLabel(savedCoordsLabelMode)}, 제목 ${textAlignLabel(savedTitleAlign)}, 메모 ${textAlignLabel(savedMemoAlign)} 정렬.\n층 선택: ${floorPickerModeLabel(savedFloorPickerMode)}, 층 표기: ${floorDisplayModeLabel(savedFloorDisplayMode)}.\n저장 시 갤러리: ${gallerySaveModeLabel(savedGalleryMode)}.`,
      );
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
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
            사용 안 함이면 GPS·장소명을 조회하지 않습니다. 저장 화면의 장소란에는 직전에 입력·저장한 장소가 자동으로 채워집니다. 제목·메모·음성 입력만으로 일반 카메라처럼 촬영할 수 있습니다. 촬영 후 3버튼(연속·저장·다시 촬영)은 그대로입니다.
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
            끄면 PDF 제목의 날짜·시간(20260607_1045)과 하단 일시 줄을 표시하지 않습니다.
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
            PDF·이미지 저장 시 제목과 메모를 사진 아래(별도 영역) 또는 사진 위(워터마크)에 표시합니다.
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
            학교 근처 촬영 시 저장·수정 모달에 1~5층 칩을 표시합니다.
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
            홈에서 사진 1장을 찍을 때 사용합니다. 시스템은 화질·줌에 유리하고, 앱 내는 확인 화면 없이 빠르며 핀치·더블탭으로 확대할 수 있습니다.
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
            연속 촬영 2장째부터 사용합니다. 1장은 일반 촬영 카메라 설정으로 찍은 뒤, 「앱 내」는 카메라를 다시 열지 않아 빠르며 핀치·더블탭 확대를 지원합니다.
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

          <View style={styles.saveFooter}>
            <Pressable
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
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
      )}

      <Pressable
        style={styles.bottomBackButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={`뒤로가기, ${backLabel}`}
      >
        <Image source={backButtonImage} style={styles.bottomBackButtonImage} resizeMode="contain" />
      </Pressable>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 24,
    gap: 12,
  },
  saveFooter: {
    paddingTop: 12,
    paddingRight: 20,
    paddingLeft: 100,
    paddingBottom: BACK_ICON_BOTTOM,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  bottomBackButton: {
    position: 'absolute',
    left: 8,
    bottom: BACK_ICON_BOTTOM + BACK_ICON_SIZE * 0.5,
    backgroundColor: 'transparent',
    padding: 4,
    minWidth: BACK_ICON_SIZE,
    minHeight: BACK_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
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
