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
  DEFAULT_COORDS_LABEL_MODE,
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
  floorPickerModeLabel,
  floorDisplayModeLabel,
  titleDatetimeModeLabel,
  coordsLabelModeLabel,
  getCoordsLabelMode,
  getFloorDisplayMode,
  getFloorPickerMode,
  getTitleDatetimeMode,
  getCameraHand,
  getGallerySaveMode,
  getContinuousCaptureCamera,
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
  type PdfImageQuality,
  type PdfPhotosPerPage,
  setCameraHand,
  setCoordsLabelMode,
  setFloorDisplayMode,
  setFloorPickerMode,
  setTitleDatetimeMode,
  setGallerySaveMode,
  setContinuousCaptureCamera,
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
  type StampTextLayout,
  type WatermarkStyle,
  type TextAlign,
  textAlignLabel,
} from '../services/settingsService';
import { confirmAlert, showAlert } from '../utils/confirmAlert';

const FLOOR_PICKER_OPTIONS: FloorPickerMode[] = ['off', 'school_only', 'always'];
const FLOOR_DISPLAY_OPTIONS: FloorDisplayMode[] = ['suffix', 'cursor'];
const TITLE_DATETIME_OPTIONS: TitleDatetimeMode[] = ['none', 'date', 'datetime'];
const COORDS_LABEL_OPTIONS: CoordsLabelMode[] = ['gps', 'coords', 'off'];

const PDF_OPTIONS: PdfPhotosPerPage[] = [1, 2, 3, 4];
const PDF_QUALITY_OPTIONS: { value: PdfImageQuality; label: string }[] = [
  { value: 'original', label: '?먮낯' },
  { value: 'standard', label: '?쒖?' },
  { value: 'compressed', label: '?뺤텞' },
];

function pdfQualityLabel(quality: PdfImageQuality): string {
  return PDF_QUALITY_OPTIONS.find((option) => option.value === quality)?.label ?? '?먮낯';
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
        const [name, perPage, quality, titleAlign, memoAlign, showDatetime, filenameDatetime, textLayout, wmStyle, galleryMode, continuousCamera, hand, floorMode, floorDisplay, titleDatetime, coordsMode, orgName, footerPhrase, showOrgName, showFooterPhrase] =
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
          getContinuousCaptureCamera(),
          getCameraHand(),
          getFloorPickerMode(),
          getFloorDisplayMode(),
          getTitleDatetimeMode(),
          getCoordsLabelMode(),
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
        setContinuousCaptureCameraState(continuousCamera);
        setCameraHandState(hand);
        setFloorPickerModeState(floorMode);
        setFloorDisplayModeState(floorDisplay);
        setTitleDatetimeModeState(titleDatetime);
        setCoordsLabelModeState(coordsMode);
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
        savedContinuousCaptureCamera,
        savedCameraHand,
        savedFloorPickerMode,
        savedFloorDisplayMode,
        savedTitleDatetimeMode,
        savedCoordsLabelMode,
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
          setContinuousCaptureCamera(continuousCaptureCamera),
          setCameraHand(cameraHand),
          setFloorPickerMode(floorPickerMode),
          setFloorDisplayMode(floorDisplayMode),
          setTitleDatetimeMode(titleDatetimeMode),
          setCoordsLabelMode(coordsLabelMode),
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
      setContinuousCaptureCameraState(savedContinuousCaptureCamera);
      setCameraHandState(savedCameraHand);
      setFloorPickerModeState(savedFloorPickerMode);
      setFloorDisplayModeState(savedFloorDisplayMode);
      setTitleDatetimeModeState(savedTitleDatetimeMode);
      setCoordsLabelModeState(savedCoordsLabelMode);
      setOverlayOrgNameState(savedOrgName);
      setOverlayFooterPhraseState(savedFooterPhrase);
      setOverlayShowOrgNameState(savedShowOrgName);
      setOverlayShowFooterPhraseState(savedShowFooterPhrase);
      onSettingsSaved?.();
      Alert.alert(
        '????꾨즺',
        `???ъ쭊? "${savedFolder}" ?대뜑????λ맗?덈떎.\n移대찓??硫붾돱: ${savedCameraHand === 'left' ? '?쇱넀(?쇱そ ?섎떒)' : '?ㅻⅨ???ㅻⅨ履??섎떒)'}.\n?곗냽 珥ъ쁺: ${continuousCaptureCameraLabel(savedContinuousCaptureCamera)}.\n?먮룞 ?쒕ぉ: ${titleDatetimeModeLabel(savedTitleDatetimeMode)}.\nPDF???섏씠吏??${savedPerPage}?? ?붿쭏 ${pdfQualityLabel(savedQuality)}.\nPDF ?쇱떆 ${savedShowDatetime ? '?쒖떆' : '?④?'}, ?뚯씪紐??좎쭨쨌?쒓컙 ${savedFilenameDatetime ? '?ы븿' : '?쒖쇅'}.\n?쒕ぉ쨌硫붾え ${stampTextLayoutLabel(savedTextLayout)}${savedTextLayout === 'watermark' ? ` (${watermarkStyleLabel(savedWatermarkStyle)})` : ''}, 醫뚰몴 ?쒓린 ${coordsLabelModeLabel(savedCoordsLabelMode)}, ?쒕ぉ ${textAlignLabel(savedTitleAlign)}, 硫붾え ${textAlignLabel(savedMemoAlign)} ?뺣젹.\n痢??좏깮: ${floorPickerModeLabel(savedFloorPickerMode)}, 痢??쒓린: ${floorDisplayModeLabel(savedFloorDisplayMode)}.\n?????媛ㅻ윭由? ${gallerySaveModeLabel(savedGalleryMode)}.`,
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

  const handleReset = () => {
    setFolderName(DEFAULT_STAMPS_FOLDER);
    setPdfPhotosPerPageState(DEFAULT_PDF_PHOTOS_PER_PAGE);
    setPdfImageQualityState(DEFAULT_PDF_IMAGE_QUALITY);
    setTitleTextAlignState(DEFAULT_TITLE_TEXT_ALIGN);
    setMemoTextAlignState(DEFAULT_MEMO_TEXT_ALIGN);
    setPdfShowDatetimeState(DEFAULT_PDF_SHOW_DATETIME);
    setPdfFilenameIncludeDatetimeState(DEFAULT_PDF_FILENAME_INCLUDE_DATETIME);
    setStampTextLayoutState(DEFAULT_STAMP_TEXT_LAYOUT);
    setWatermarkStyleState(DEFAULT_WATERMARK_STYLE);
    setGallerySaveModeState(DEFAULT_GALLERY_SAVE_MODE);
    setContinuousCaptureCameraState(DEFAULT_CONTINUOUS_CAPTURE_CAMERA);
    setCameraHandState(DEFAULT_CAMERA_HAND);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>?ㅼ젙</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Text style={styles.label}>?ъ쭊 ????대뜑 (???대?)</Text>
          <Text style={styles.hint}>
            ???곗씠???덉쓽 ?섏쐞 ?대뜑 ?대쫫?낅땲?? 蹂寃????덈줈 李띿? ?ъ쭊遺???곸슜?⑸땲??
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

          <Text style={[styles.label, styles.sectionGap]}>?먮룞 ?쒕ぉ</Text>
          <Text style={styles.hint}>
            ???ъ쭊 ??Β룹닔??紐⑤떖??梨꾩썙 ?ｌ쓣 ?쒕ぉ ?욌?遺꾩엯?덈떎. ?꾩튂??GPS 議고쉶 ???ㅼ뿉 遺숈뒿?덈떎.
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
                    {titleDatetimeModeLabel(option)}
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
                ?쇱넀
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
                ?ㅻⅨ??              </Text>
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
                    {option}
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
                    {option.label}
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
                ?쒖떆
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
                ?④?
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
                ?ы븿
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
                ?쒖쇅
              </Text>
            </Pressable>
          </View>

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
                ?쒖떆
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
                ?④?
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
                ?쒖떆
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
                ?④?
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, styles.sectionGap]}>?쒕ぉ쨌硫붾え ?쒖떆 諛⑹떇</Text>
          <Text style={styles.hint}>
            PDF쨌?대?吏 ??????쒕ぉ怨?硫붾え瑜??ъ쭊 ?꾨옒(蹂꾨룄 ?곸뿭) ?먮뒗 ?ъ쭊 ???뚰꽣留덊겕)???쒖떆?⑸땲??
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
                蹂꾨룄 ?곸뿭
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
                ?뚰꽣留덊겕
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
                        {watermarkStyleLabel(option)}
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
                    {coordsLabelModeLabel(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>痢??좏깮</Text>
          <Text style={styles.hint}>
            ?숆탳 洹쇱쿂 珥ъ쁺 ????Β룹닔??紐⑤떖??1~5痢?移⑹쓣 ?쒖떆?⑸땲??
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
                    {floorPickerModeLabel(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>痢??쒓린</Text>
          <Text style={styles.hint}>
            痢?移⑹쓣 ?뚮??????쒕ぉ???ｋ뒗 諛⑹떇?낅땲?? ?뚯젣紐?而ㅼ꽌???쎌엯?띿? ?쒕ぉ ?낅젰???而ㅼ꽌 ?꾩튂??3痢??깆쓣 ?ｌ뒿?덈떎.
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
                    {floorDisplayModeLabel(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>?곗냽 珥ъ쁺 移대찓??/Text>
          <Text style={styles.hint}>
            ?곗냽 珥ъ쁺 2?μ㎏遺???ъ슜?⑸땲?? 1?μ? ?쒖뒪??移대찓?쇰줈 李띿? ?? ?뚯빋 ?담띾뒗 移대찓?쇰? ?ㅼ떆 ?댁? ?딆븘 鍮좊쫭?덈떎. ?쇰컲 珥ъ쁺? ??긽 ?쒖뒪??移대찓?쇱엯?덈떎.
          </Text>
          <View style={styles.optionRow}>
            {(['in_app', 'system'] as ContinuousCaptureCamera[]).map((option) => {
              const selected = continuousCaptureCamera === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}
                  onPress={() => setContinuousCaptureCameraState(option)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}
                  >
                    {continuousCaptureCameraLabel(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.sectionGap]}>?????媛ㅻ윭由?/Text>
          <Text style={styles.hint}>
            ?ㅽ꺃???????媛ㅻ윭由??⑤쾾???ｌ쓣 ?ъ쭊?낅땲?? 罹≪뀡쨌?뚰꽣留덊겕?????뚯젣紐㈑룸찓紐??쒖떆 諛⑹떇?띿쓣 ?곕쫭?덈떎.
          </Text>
          <View style={styles.optionRow}>
            {(['original_only', 'caption_only', 'original_and_caption'] as GallerySaveMode[]).map(
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
                      {gallerySaveModeLabel(option)}
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
                    {textAlignLabel(option)}
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
                    {textAlignLabel(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.primaryButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>???/Text>
            )}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleReset} disabled={saving}>
            <Text style={styles.secondaryButtonText}>
              湲곕낯媛?(?대뜑: {DEFAULT_STAMPS_FOLDER}, PDF: {DEFAULT_PDF_PHOTOS_PER_PAGE}?? ?먮낯, ?뺣젹 ?쇱そ)
            </Text>
          </Pressable>

          <Text style={[styles.label, styles.sectionGap]}>???뺣낫</Text>
          <Text style={styles.hint}>VoiceStamp {appVersion}</Text>
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
      )}

      <Pressable
        style={styles.bottomBackButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={`?ㅻ줈媛湲? ${backLabel}`}
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
  scroll: {
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 100,
    gap: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
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
    fontSize: 10,
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
