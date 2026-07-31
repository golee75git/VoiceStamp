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
      // ???吏곹썑 refreshKey bump ?앸왂 ???ㅼ젙 ?붾㈃ ?щ줈?쒕? ?쇳븿. 移대찓??紐⑸줉? 蹂듦? ??remount濡?諛섏쁺.
      Alert.alert('????꾨즺', '?ㅼ젙????ν뻽?듬땲??');
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

          <Text style={[styles.label, styles.sectionGap]}>移대찓????諛곌꼍</Text>
          <Text style={styles.hint}>
            珥ъ쁺 ???붾㈃ ?ㅻ퉬二쇱뼹?낅땲?? ?뚭린蹂멥띿? 寃????諛곌꼍, ?뚯뒪???2?띾뒗 ?곗깋 ??諛곌꼍?낅땲?? ?깆뿉
            ?ы븿???대?吏留??좏깮?????덉뒿?덈떎.
            {cameraHand === 'left'
              ? ' ?쇱넀?먯꽌??諛앹? ?뚮쭏(諛곌꼍쨌?꾩씠肄?媛 怨좎젙?섎ŉ, ???ㅼ젙? ?ㅻⅨ?먯씪 ?뚮쭔 ?붾㈃???곸슜?⑸땲??'
              : ''}
          </Text>
          <View style={styles.optionRow}>
            {CAMERA_HOME_BG_OPTIONS.map((option) => {
              const selected = cameraHomeBg === option;
              const bgDisabled = saving || cameraHand === 'left';
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setCameraHomeBgState(option)}
                  disabled={bgDisabled}
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
            ?꾨㈃ PDF쨌?대?吏쨌誘몃━蹂닿린 ?쒕ぉ???좎쭨쨌?쒓컙 ?묐몢??20260607_1045)瑜??쒖떆?섏? ?딆뒿?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>?섎떒 珥ъ쁺 ?쇱떆</Text>
          <Text style={styles.hint}>
            PDF쨌?대?吏???뚯궗吏??꾨옒(蹂꾨룄 ?곸뿭)?띾㎤ ?꾨옒??珥ъ쁺(??? ?쇱떆瑜??쒖떆?⑸땲?? ?뚰꽣留덊겕 紐⑤뱶?먮뒗
            ?곸슜?섏? ?딆뒿?덈떎. ?쒕ぉ ?묐몢?댁???蹂꾧컻?낅땲??
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
                {chipLabel('?쒖떆', DEFAULT_EXPORT_FOOTER_DATETIME)}
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
                {chipLabel('?④?', !DEFAULT_EXPORT_FOOTER_DATETIME)}
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
            ????붾㈃ ?쇰꺼怨?PDF쨌?뚰꽣留덊겕???뚰몴?쒕챸: ?댁슜?띿쑝濡?遺숈뒿?덈떎. ????붾㈃?먯꽌 移??대쫫????빐???ш린? 媛숈씠 ??λ맗?덈떎. 鍮꾩슦硫?湲곕낯媛??쒕ぉ쨌?μ냼쨌硫붾え쨌異붽?1쨌異붽?2쨌異붽?3)?쇰줈 ?뚯븘媛묐땲?? DB ???援ъ“??諛붾뚯? ?딆뒿?덈떎.
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
          <Text style={styles.label}>異붽?3 移??대쫫</Text>
          <TextInput
            style={styles.input}
            value={extra3FieldLabel}
            onChangeText={setExtra3FieldLabelState}
            placeholder={DEFAULT_FIELD_EXTRA3_LABEL}
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

          <Text style={[styles.label, styles.sectionGap]}>媛쒖씤?뺣낫 媛由ш린</Text>
          <Text style={styles.hint}>
            ?ъ슜: ????붾㈃?먯꽌 ?쇨뎬쨌?レ옄 ?곸뿭?????덉뿉?쒕쭔 ?먮━寃??????덉뒿?덈떎. ?쒕쾭濡?蹂대궡吏 ?딆뒿?덈떎.
            (Android) 湲곕낯? ?붿씠硫? 踰꾪듉???뚮윭 ?뺤씤 ???곸슜?⑸땲??
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

          <Text style={[styles.label, styles.sectionGap]}>?ъ쭊 湲?먮줈 ?쒕ぉ쨌硫붾え</Text>
          <Text style={styles.hint}>
            ?ъ슜: ????붾㈃?먯꽌 ?뚭????쎌뼱 梨꾩슦湲겹띾줈 ?ъ쭊 ??湲?먮? ???덉뿉?쒕쭔 ?쎌뼱 ?쒕ぉ쨌硫붾え 珥덉븞??            留뚮벊?덈떎. 湲?湲? 硫붾え 移맞룹????쒗듃?먯꽌 ?ㅽ겕濡ㅻ맗?덈떎. ?쒕쾭濡?蹂대궡吏 ?딆쑝硫? AI濡?臾몄옣??            ?덈줈 ?곗? ?딆뒿?덈떎. (Android) 湲곕낯? ?붿엯?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>?ъ쭊 URL ??QR (蹂꾨룄 ?곸뿭)</Text>
          <Text style={styles.hint}>
            ?ъ슜: ????붾㈃?먯꽌 URL???뺤씤쨌?섏젙???? ?뚯궗吏??꾨옒(蹂꾨룄 ?곸뿭)?띿씠誘몄???QR??            ?ｌ뒿?덈떎. ?먮룞 李얘린??Android?먯꽌 ?ъ쭊 湲??OCR)濡쒕쭔 ?섎ŉ ?쒕쾭濡?蹂대궡吏 ?딆뒿?덈떎.
            http(s)留??덉슜?⑸땲?? ?뚰꽣留덊겕 紐⑤뱶?먮뒗 ?꾩쭅 ?곸슜?섏? ?딆뒿?덈떎. 湲곕낯? ?붿엯?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>珥ъ쁺 ???λ㈃ ?ㅼ썙???먮룞 ?낅젰</Text>
          <Text style={styles.hint}>
            ?ъ슜: ????붾㈃???대━硫??ъ쭊?????덉뿉?쒕쭔 遺꾩꽍??硫붾え???λ㈃ ?ㅼ썙??珥덉븞???ｌ뒿?덈떎.
            ?쒕쾭濡?蹂대궡吏 ?딆쑝硫? 湲?臾몄옣 ?ㅻ챸???꾨떃?덈떎. (Android) 湲곕낯? ?붿엯?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>???紐⑸줉 ?쒖떆</Text>
          <Text style={styles.hint}>
            紐⑸줉 移대뱶???쒕ぉ쨌?좎쭨留?蹂댁씪吏, ?μ냼쨌異붽?쨌硫붾え源뚯? 紐⑤몢 蹂댁씪吏 ?좏깮?⑸땲?? PDF쨌?대?吏 ?대낫?닿린?먮뒗
            ?곹뼢 ?놁뒿?덈떎.
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

          <Text style={[styles.label, styles.sectionGap]}>湲???ш린</Text>
          <Text style={styles.hint}>
            ??Β룹닔???낅젰移멸낵 誘몃━蹂닿린쨌?뚰꽣留덊겕쨌PDF쨌媛ㅻ윭由??대?吏 ??μ뿉 ?곸슜?⑸땲?? ?쒖뒪??湲瑗대쭔 ?ъ슜?⑸땲??
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
