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
  DEFAULT_FIELD_TITLE_LABEL,
  DEFAULT_FIELD_PLACE_LABEL,
  DEFAULT_FIELD_MEMO_LABEL,
  DEFAULT_FIELD_EXTRA1_LABEL,
  DEFAULT_FIELD_EXTRA2_LABEL,
  DEFAULT_SHUTTER_SOUND,
  OVERLAY_ORG_MAX_LENGTH,
  OVERLAY_PHRASE_MAX_LENGTH,
  FIELD_LABEL_MAX_LENGTH,
  gallerySaveModeLabel,
  continuousCaptureCameraLabel,
  primaryCaptureCameraLabel,
  captureAfterModeLabel,
  shutterSoundLabel,
  floorPickerModeLabel,
  floorDisplayModeLabel,
  titleDatetimeModeLabel,
  coordsLabelModeLabel,
  locationModeLabel,
  loadSettingsForScreen,
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
  setShutterSoundEnabled,
  setMemoTextAlign,
  setOverlayFooterPhrase,
  setOverlayOrgName,
  setOverlayShowFooterPhrase,
  setOverlayShowOrgName,
  setTitleFieldLabel,
  setPlaceFieldLabel,
  setMemoFieldLabel,
  setExtra1FieldLabel,
  setExtra2FieldLabel,
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
  { value: 'original', label: '?먮낯' },
  { value: 'standard', label: '?쒖?' },
  { value: 'compressed', label: '?뺤텞' },
];

function pdfQualityLabel(quality: PdfImageQuality): string {
  return PDF_QUALITY_OPTIONS.find((option) => option.value === quality)?.label ?? '?먮낯';
}

function chipLabel(label: string, isDefault: boolean): string {
  return isDefault ? `${label} 쨌 湲곕낯` : label;
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
  backLabel = '紐⑸줉',
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
  const [shutterSound, setShutterSoundState] = useState(DEFAULT_SHUTTER_SOUND);
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
  const [titleFieldLabel, setTitleFieldLabelState] = useState(DEFAULT_FIELD_TITLE_LABEL);
  const [placeFieldLabel, setPlaceFieldLabelState] = useState(DEFAULT_FIELD_PLACE_LABEL);
  const [memoFieldLabel, setMemoFieldLabelState] = useState(DEFAULT_FIELD_MEMO_LABEL);
  const [extra1FieldLabel, setExtra1FieldLabelState] = useState(DEFAULT_FIELD_EXTRA1_LABEL);
  const [extra2FieldLabel, setExtra2FieldLabelState] = useState(DEFAULT_FIELD_EXTRA2_LABEL);
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
      setPdfFilenameIncludeDatetimeState(snapshot.pdfFilenameIncludeDatetime);
      setStampTextLayoutState(snapshot.stampTextLayout);
      setWatermarkStyleState(snapshot.watermarkStyle);
      setGallerySaveModeState(snapshot.gallerySaveMode);
      setPrimaryCaptureCameraState(snapshot.primaryCaptureCamera);
      setContinuousCaptureCameraState(snapshot.continuousCaptureCamera);
      setCaptureAfterModeState(snapshot.captureAfterMode);
      setShutterSoundState(snapshot.shutterSound);
      setCameraHandState(snapshot.cameraHand);
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
    });
    return () => {
      cancelled = true;
    };
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
        savedShutterSound,
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
        savedTitleFieldLabel,
        savedPlaceFieldLabel,
        savedMemoFieldLabel,
        savedExtra1FieldLabel,
        savedExtra2FieldLabel,
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
          setShutterSoundEnabled(shutterSound),
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
          setTitleFieldLabel(titleFieldLabel),
          setPlaceFieldLabel(placeFieldLabel),
          setMemoFieldLabel(memoFieldLabel),
          setExtra1FieldLabel(extra1FieldLabel),
          setExtra2FieldLabel(extra2FieldLabel),
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
      setShutterSoundState(savedShutterSound);
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
      setTitleFieldLabelState(savedTitleFieldLabel);
      setPlaceFieldLabelState(savedPlaceFieldLabel);
      setMemoFieldLabelState(savedMemoFieldLabel);
      setExtra1FieldLabelState(savedExtra1FieldLabel);
      setExtra2FieldLabelState(savedExtra2FieldLabel);
      invalidateStampSaveModalLayoutCache();
      onSettingsSaved?.();
      Alert.alert(
        '????꾨즺',
        `???ъ쭊? "${savedFolder}" ?대뜑????λ맗?덈떎.\n移대찓??硫붾돱: ${savedCameraHand === 'left' ? '?쇱넀(?쇱そ ?섎떒)' : '?ㅻⅨ???ㅻⅨ履??섎떒)'}.\n?쇰컲 珥ъ쁺: ${primaryCaptureCameraLabel(savedPrimaryCaptureCamera)}.\n珥ъ쁺 ?? ${captureAfterModeLabel(savedCaptureAfterMode)}.\n?곗냽 珥ъ쁺: ${continuousCaptureCameraLabel(savedContinuousCaptureCamera)}.\n????珥ъ쁺?? ${shutterSoundLabel(savedShutterSound)}.\n?꾩튂 議고쉶: ${locationModeLabel(savedLocationMode)}.\n?먮룞 ?쒕ぉ: ${titleDatetimeModeLabel(savedTitleDatetimeMode)}.\n?꾨뱶 ?쒖떆紐? ${savedTitleFieldLabel}/${savedPlaceFieldLabel}/${savedMemoFieldLabel}/${savedExtra1FieldLabel}/${savedExtra2FieldLabel}.\nPDF???섏씠吏??${savedPerPage}?? ?붿쭏 ${pdfQualityLabel(savedQuality)}.\nPDF ?쇱떆 ${savedShowDatetime ? '?쒖떆' : '?④?'}, ?뚯씪紐??좎쭨쨌?쒓컙 ${savedFilenameDatetime ? '?ы븿' : '?쒖쇅'}.\n?쒕ぉ쨌硫붾え ${stampTextLayoutLabel(savedTextLayout)}${savedTextLayout === 'watermark' ? ` (${watermarkStyleLabel(savedWatermarkStyle)})` : ''}, 醫뚰몴 ?쒓린 ${coordsLabelModeLabel(savedCoordsLabelMode)}, ?쒕ぉ ${textAlignLabel(savedTitleAlign)}, 硫붾え ${textAlignLabel(savedMemoAlign)} ?뺣젹.\n痢??좏깮: ${floorPickerModeLabel(savedFloorPickerMode)}, 痢??쒓린: ${floorDisplayModeLabel(savedFloorDisplayMode)}.\n?????媛ㅻ윭由? ${gallerySaveModeLabel(savedGalleryMode)}.`,
      );
    } catch (e) {
      Alert.alert(
        '????ㅽ뙣',
        e instanceof Error ? e.message : '?????녿뒗 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>?ㅼ젙</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, styles.bodyWithBottomBar]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
          <Text style={styles.label}>?ъ쭊 ????대뜑 (???대?)</Text>
          <Text style={styles.hint}>
            ???곗씠???덉쓽 ?섏쐞 ?대뜑 ?대쫫?낅땲?? 蹂寃????덈줈 李띿? ?ъ쭊遺???곸슜?⑸땲?? 湲곕낯媛? {DEFAULT_STAMPS_FOLDER}
          </Text>
          {Platform.OS === 'web' && (
            <Text style={styles.webNote}>?뱀뿉?쒕뒗 ?ъ쭊??DB????λ릺?????ㅼ젙???곸슜?섏? ?딆뒿?덈떎.</Text>
          )}
          <TextInput
            style={styles.input}
            value={folderName}
            onChangeText={setFolderName}
            placeholder={DEFAULT_STAMPS_FOLDER}
            autoCapitalize="none"
            editable={!saving}
          />

          <Text style={[styles.label, styles.sectionGap]}>?꾩튂 議고쉶</Text>
          <Text style={styles.hint}>
            ?ъ슜: GPS쨌濡쒖뺄 ?숆탳 DB쨌移댁뭅??二쇱냼/POI濡??μ냼瑜?梨꾩썎?덈떎. ?ъ슜 ???? GPS? 濡쒖뺄 ?숆탳 DB留?鍮꾧탳???숆탳 洹쇱쿂硫??숆탳紐낆쓣 ?ｊ퀬, 移댁뭅???ㅽ듃?뚰겕) 議고쉶???섏? ?딆뒿?덈떎. ?숆탳 諛뽰씠硫??μ냼???鍮꾩썎?덈떎. 珥ъ쁺 ??3踰꾪듉(?곗냽쨌??Β룸떎??珥ъ쁺)? 洹몃?濡쒖엯?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>?먮룞 ?쒕ぉ</Text>
          <Text style={styles.hint}>
            ???ъ쭊 ??Β룹닔??紐⑤떖??梨꾩썙 ?ｌ쓣 ?쒕ぉ ?욌?遺꾩엯?덈떎. ?꾩튂 議고쉶瑜??ъ슜???뚮뒗 ?μ냼 ?꾨뱶??GPS쨌?μ냼紐낆씠 ?곕줈 梨꾩썙吏묐땲??
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

          <Text style={[styles.label, styles.sectionGap]}>移대찓??硫붾돱 ?꾩튂 (?먯옟??</Text>
          <Text style={styles.hint}>
            紐⑸줉쨌?ㅼ젙쨌移대찓??踰꾪듉???쇱넀? ?쇱そ ?섎떒, ?ㅻⅨ?먯? ?ㅻⅨ履??섎떒??諛곗튂?⑸땲??
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
                {chipLabel('?쇱넀', DEFAULT_CAMERA_HAND === 'left')}
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
                {chipLabel('?ㅻⅨ??, DEFAULT_CAMERA_HAND === 'right')}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>PDF ?섏씠吏???ъ쭊 ??/Text>
          <Text style={styles.hint}>PDF蹂대궡湲??????섏씠吏??諛곗튂???ъ쭊 媛쒖닔?낅땲??</Text>
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

          <Text style={[styles.label, styles.sectionGap]}>PDF ?붿쭏(?⑸웾)</Text>
          <Text style={styles.hint}>PDF蹂대궡湲????ъ쭊 ?뺤텞 ?섏??낅땲?? ?먮낯 ?ㅽ꺃???ъ쭊? 諛붾뚯? ?딆뒿?덈떎.</Text>
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

          <Text style={[styles.label, styles.sectionGap]}>PDF 珥ъ쁺 ?쇱떆 ?쒖떆</Text>
          <Text style={styles.hint}>
            ?꾨㈃ PDF ?쒕ぉ???좎쭨쨌?쒓컙(20260607_1045)怨??섎떒 ?쇱떆 以꾩쓣 ?쒖떆?섏? ?딆뒿?덈떎.
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
                {chipLabel('?쒖떆', DEFAULT_PDF_SHOW_DATETIME)}
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
                {chipLabel('?④?', !DEFAULT_PDF_SHOW_DATETIME)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>PDF ?뚯씪紐??좎쭨쨌?쒓컙</Text>
          <Text style={styles.hint}>PDF蹂대궡湲????뚯씪紐?湲곕낯媛믪뿉 ?좎쭨쨌?쒓컙 ?ы븿 ?щ??낅땲??</Text>
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
                {chipLabel('?ы븿', DEFAULT_PDF_FILENAME_INCLUDE_DATETIME)}
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
                {chipLabel('?쒖쇅', !DEFAULT_PDF_FILENAME_INCLUDE_DATETIME)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>?꾨뱶 ?쒖떆紐?/Text>
          <Text style={styles.hint}>
            ????붾㈃ ?쇰꺼怨?PDF쨌?뚰꽣留덊겕???뚰몴?쒕챸: ?댁슜?띿쑝濡?遺숈뒿?덈떎. 鍮꾩슦硫?湲곕낯媛??쒕ぉ쨌?μ냼쨌硫붾え쨌異붽?1쨌異붽?2)?쇰줈 ?뚯븘媛묐땲?? DB ???援ъ“??諛붾뚯? ?딆뒿?덈떎.
          </Text>
          <Text style={styles.label}>?쒕ぉ 移??대쫫</Text>
          <TextInput
            style={styles.input}
            value={titleFieldLabel}
            onChangeText={setTitleFieldLabelState}
            placeholder={DEFAULT_FIELD_TITLE_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>?μ냼 移??대쫫</Text>
          <TextInput
            style={styles.input}
            value={placeFieldLabel}
            onChangeText={setPlaceFieldLabelState}
            placeholder={DEFAULT_FIELD_PLACE_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>硫붾え 移??대쫫</Text>
          <TextInput
            style={styles.input}
            value={memoFieldLabel}
            onChangeText={setMemoFieldLabelState}
            placeholder={DEFAULT_FIELD_MEMO_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>異붽?1 移??대쫫</Text>
          <TextInput
            style={styles.input}
            value={extra1FieldLabel}
            onChangeText={setExtra1FieldLabelState}
            placeholder={DEFAULT_FIELD_EXTRA1_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />
          <Text style={styles.label}>異붽?2 移??대쫫</Text>
          <TextInput
            style={styles.input}
            value={extra2FieldLabel}
            onChangeText={setExtra2FieldLabelState}
            placeholder={DEFAULT_FIELD_EXTRA2_LABEL}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            editable={!saving}
          />

          <Text style={[styles.label, styles.sectionGap]}>?ъ쭊 ?ㅻ쾭?덉씠 臾멸뎄</Text>
          <Text style={styles.hint}>
            PDF쨌?대?吏쨌誘몃━蹂닿린???쒖떆??湲곌?紐??곷떒)怨??섎떒 臾멸뎄?낅땲?? ????대뜑紐낃낵 蹂꾨룄?낅땲??
          </Text>
          <Text style={styles.label}>湲곌?紐?/Text>
          <TextInput
            style={styles.input}
            value={overlayOrgName}
            onChangeText={setOverlayOrgNameState}
            placeholder="?? ?뗢뿃珥덈벑?숆탳"
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
                {chipLabel('?쒖떆', DEFAULT_OVERLAY_SHOW_ORG_NAME)}
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
                {chipLabel('?④?', !DEFAULT_OVERLAY_SHOW_ORG_NAME)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>?섎떒 臾멸뎄</Text>
          <TextInput
            style={styles.input}
            value={overlayFooterPhrase}
            onChangeText={setOverlayFooterPhraseState}
            placeholder="?? 珥ъ쁺??湲곗? ?꾩옣 湲곕줉"
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
                {chipLabel('?쒖떆', DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE)}
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
                {chipLabel('?④?', !DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>?쒕ぉ쨌硫붾え ?쒖떆 諛⑹떇</Text>
          <Text style={styles.hint}>
            PDF쨌?대?吏 ??????쒕ぉ怨?硫붾え瑜??ъ쭊 ?꾨옒(蹂꾨룄 ?곸뿭쨌?? ?먮뒗 ?ъ쭊 ???뚰꽣留덊겕쨌以꾧?)???쒖떆?⑸땲??
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
                {chipLabel('蹂꾨룄 ?곸뿭', DEFAULT_STAMP_TEXT_LAYOUT === 'caption')}
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
                {chipLabel('?뚰꽣留덊겕', DEFAULT_STAMP_TEXT_LAYOUT === 'watermark')}
              </Text>
            </Pressable>
          </View>

          {stampTextLayout === 'watermark' ? (
            <>
              <Text style={[styles.label, styles.sectionGap]}>?뚰꽣留덊겕 ?ㅽ???/Text>
              <Text style={styles.hint}>
                ?ъ쭊 諛?諛곌꼍 ?됱엯?덈떎. 誘몃━蹂닿린쨌PDF쨌?대?吏 ??μ뿉 ?곸슜?⑸땲??
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

          <Text style={[styles.label, styles.sectionGap]}>醫뚰몴 ?쒓린</Text>
          <Text style={styles.hint}>
            罹≪뀡쨌PDF쨌?대?吏??GPS 醫뚰몴瑜??ｌ쓣 ???욎뿉 遺숇뒗 留먯엯?덈떎. ?놁쓬? 醫뚰몴瑜??쒖떆?섏? ?딆뒿?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>痢??좏깮</Text>
          <Text style={styles.hint}>
            ?뚰븰援먯씪 ?뚮쭔?띿? ?μ냼쨌?대뜑紐낆뿉 ?숆탳媛 ?덉쓣 ?뚮쭔 痢?移⑹쓣 蹂댁씠怨? 吏곸쟾 痢듬룄 ?숆탳?먮쭔 ?댁뼱吏묐땲?? 鍮꾪븰援먯뿉??痢듭쓣 ??ν븯吏 ?딆뒿?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>痢??쒓린</Text>
          <Text style={styles.hint}>
            痢?移⑹쓣 ?뚮??????μ냼???ｋ뒗 諛⑹떇?낅땲?? ?뚯옣??而ㅼ꽌???쎌엯?띿? ?μ냼 ?낅젰???而ㅼ꽌 ?꾩튂??3痢??깆쓣 ?ｌ뒿?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>?쇰컲 珥ъ쁺 移대찓??/Text>
          <Text style={styles.hint}>
            ?덉뿉???ъ쭊 1?μ쓣 李띿쓣 ???ъ슜?⑸땲?? ?쒖뒪?쒖? ?붿쭏쨌以뚯뿉 ?좊━?섍퀬, ???대뒗 ?뺤씤 ?붾㈃ ?놁씠 鍮좊Ⅴ硫?1x쨌3x쨌5x 諛곗쑉怨??移샕룸뜑釉뷀꺆?쇰줈 ?뺣??????덉뒿?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>珥ъ쁺 ??/Text>
          <Text style={styles.hint}>
            ?뚯꽑???붾㈃?띿? ?곗냽 珥ъ쁺쨌??Β룸떎??珥ъ쁺 以?怨좊쫭?덈떎. ?뚯????붾㈃ 諛붾줈?띾뒗 ?곗쿂 ?놁씠 ?쒕ぉ쨌硫붾え ?낅젰 ?붾㈃?쇰줈 諛붾줈 媛묐땲??
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

          <Text style={[styles.label, styles.sectionGap]}>?곗냽 珥ъ쁺 移대찓??/Text>
          <Text style={styles.hint}>
            ?곗냽 珥ъ쁺 2?μ㎏遺???ъ슜?⑸땲?? 1?μ? ?쇰컲 珥ъ쁺 移대찓???ㅼ젙?쇰줈 李띿? ?? ?뚯빋 ?담띾뒗 移대찓?쇰? ?ㅼ떆 ?댁? ?딆븘 鍮좊Ⅴ硫?1x쨌3x쨌5x 諛곗쑉怨??移샕룸뜑釉뷀꺆 ?뺣?瑜?吏?먰빀?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>????珥ъ쁺??/Text>
          <Text style={styles.hint}>
            ????移대찓?쇰줈 李띿쓣 ?뚮쭔 ?곸슜?⑸땲?? ?쒖뒪??移대찓?쇰뒗 湲곌린 ?ㅼ젙???곕쫭?덈떎. ?쇰? 湲곌린?먯꽌??OS ?뺤콉?쇰줈 ?????놁쓣 ???덉뒿?덈떎.
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
                {chipLabel('耳쒓린', DEFAULT_SHUTTER_SOUND)}
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
                {chipLabel('?꾧린', !DEFAULT_SHUTTER_SOUND)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>?????媛ㅻ윭由?/Text>
          <Text style={styles.hint}>
            ?ㅽ꺃?꾨뒗 ??긽 ??紐⑸줉????λ맗?덈떎. ?깅쭔: 媛ㅻ윭由ъ뿉 ?ｌ? ?딆뒿?덈떎 (?곗냽 珥ъ쁺??媛??鍮좊쫫). 洹??몃뒗
            媛ㅻ윭由??⑤쾾????ν븯硫? 罹≪뀡쨌?뚰꽣留덊겕?????뚯젣紐㈑룸찓紐??쒖떆 諛⑹떇?띿쓣 ?곕쫭?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>?쒕ぉ ?뺣젹</Text>
          <Text style={styles.hint}>紐⑸줉쨌?낅젰쨌PDF쨌?대?吏 ??μ뿉???쒕ぉ ?띿뒪???뺣젹?낅땲??</Text>
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

          <Text style={[styles.label, styles.sectionGap]}>硫붾え ?뺣젹</Text>
          <Text style={styles.hint}>紐⑸줉쨌?낅젰쨌PDF쨌?대?吏 ??μ뿉??硫붾え ?띿뒪???뺣젹?낅땲??</Text>
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

          <Text style={[styles.label, styles.sectionGap]}>???뺣낫</Text>
          <Text style={styles.hint}>
            VoiceStamp {appVersion}
            {Platform.OS === 'android' && APK_BUILD_FILENAME ? ` 쨌 ${APK_BUILD_FILENAME}` : ''}
          </Text>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void openInfoPage('/privacy')}
          >
            <Text style={styles.secondaryButtonText}>媛쒖씤?뺣낫 泥섎━ ?덈궡</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void openInfoPage('/license')}
          >
            <Text style={styles.secondaryButtonText}>?쇱씠?좎뒪</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => onOpenOssLicenses?.()}
            disabled={!onOpenOssLicenses}
          >
            <Text style={styles.secondaryButtonText}>?ㅽ뵂?뚯뒪 ?쇱씠?좎뒪</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => onShowOnboarding?.()}
            disabled={!onShowOnboarding}
          >
            <Text style={styles.secondaryButtonText}>?⑤낫???ㅼ떆 蹂닿린</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void openInfoPage('/help')}
          >
            <Text style={styles.secondaryButtonText}>?꾩?留?/Text>
          </Pressable>
          <Text style={styles.copyright}>짤 2026 ?댄삎??/Text>
      </ScrollView>

      <View style={styles.bottomBar}>
          <Pressable
            style={styles.bottomBackSlot}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={`?ㅻ줈媛湲? ${backLabel}`}
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
              <Text style={styles.primaryButtonText}>???/Text>
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
