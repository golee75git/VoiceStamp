import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { openInfoPage } from '../constants/infoUrls';

import {
  DEFAULT_CAMERA_HAND,
  DEFAULT_MEMO_TEXT_ALIGN,
  DEFAULT_PDF_FILENAME_INCLUDE_DATETIME,
  DEFAULT_PDF_IMAGE_QUALITY,
  DEFAULT_PDF_PHOTOS_PER_PAGE,
  DEFAULT_PDF_SHOW_DATETIME,
  DEFAULT_STAMPS_FOLDER,
  DEFAULT_STAMP_TEXT_LAYOUT,
  DEFAULT_TITLE_TEXT_ALIGN,
  getCameraHand,
  getMemoTextAlign,
  getPdfFilenameIncludeDatetime,
  getPdfImageQuality,
  getPdfPhotosPerPage,
  getPdfShowDatetime,
  getStampTextLayout,
  getStampsFolderName,
  getTitleTextAlign,
  type CameraHand,
  type PdfImageQuality,
  type PdfPhotosPerPage,
  setCameraHand,
  setMemoTextAlign,
  setPdfFilenameIncludeDatetime,
  setPdfImageQuality,
  setPdfPhotosPerPage,
  setPdfShowDatetime,
  setStampTextLayout,
  setStampsFolderName,
  setTitleTextAlign,
  stampTextLayoutLabel,
  TEXT_ALIGN_OPTIONS,
  type StampTextLayout,
  type TextAlign,
  textAlignLabel,
} from '../services/settingsService';
import { emptyTrash, getTrashedStampCount } from '../services/stampTrash';

const PDF_OPTIONS: PdfPhotosPerPage[] = [1, 2, 3, 4];
const PDF_QUALITY_OPTIONS: { value: PdfImageQuality; label: string }[] = [
  { value: 'original', label: '원본' },
  { value: 'standard', label: '표준' },
  { value: 'compressed', label: '압축' },
];

function pdfQualityLabel(quality: PdfImageQuality): string {
  return PDF_QUALITY_OPTIONS.find((option) => option.value === quality)?.label ?? '원본';
}

type SettingsScreenProps = {
  onBack: () => void;
  backLabel?: string;
  refreshKey?: number;
  onTrashEmptied?: () => void;
  onSettingsSaved?: () => void;
};

export function SettingsScreen({
  onBack,
  backLabel = '목록',
  refreshKey = 0,
  onTrashEmptied,
  onSettingsSaved,
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
  const [cameraHand, setCameraHandState] = useState<CameraHand>(DEFAULT_CAMERA_HAND);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [name, perPage, quality, titleAlign, memoAlign, showDatetime, filenameDatetime, textLayout, hand, trashed] =
          await Promise.all([
          getStampsFolderName(),
          getPdfPhotosPerPage(),
          getPdfImageQuality(),
          getTitleTextAlign(),
          getMemoTextAlign(),
          getPdfShowDatetime(),
          getPdfFilenameIncludeDatetime(),
          getStampTextLayout(),
          getCameraHand(),
          getTrashedStampCount(),
        ]);
        setFolderName(name);
        setPdfPhotosPerPageState(perPage);
        setPdfImageQualityState(quality);
        setTitleTextAlignState(titleAlign);
        setMemoTextAlignState(memoAlign);
        setPdfShowDatetimeState(showDatetime);
        setPdfFilenameIncludeDatetimeState(filenameDatetime);
        setStampTextLayoutState(textLayout);
        setCameraHandState(hand);
        setTrashCount(trashed);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  const handleEmptyTrash = () => {
    if (trashCount === 0) {
      Alert.alert('휴지통 비우기', '휴지통이 이미 비어 있습니다.');
      return;
    }

    Alert.alert(
      '휴지통 비우기',
      `${trashCount}개 스탬프를 영구 삭제합니다. 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '비우기',
          style: 'destructive',
          onPress: async () => {
            setEmptyingTrash(true);
            try {
              const removed = await emptyTrash();
              setTrashCount(0);
              onTrashEmptied?.();
              Alert.alert('완료', `${removed}개를 영구 삭제했습니다.`);
            } catch (e) {
              Alert.alert(
                '실패',
                e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
              );
            } finally {
              setEmptyingTrash(false);
            }
          },
        },
      ],
    );
  };

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
        savedCameraHand,
      ] = await Promise.all([
          setStampsFolderName(folderName),
          setPdfPhotosPerPage(pdfPhotosPerPage),
          setPdfImageQuality(pdfImageQuality),
          setTitleTextAlign(titleTextAlign),
          setMemoTextAlign(memoTextAlign),
          setPdfShowDatetime(pdfShowDatetime),
          setPdfFilenameIncludeDatetime(pdfFilenameIncludeDatetime),
          setStampTextLayout(stampTextLayout),
          setCameraHand(cameraHand),
        ]);
      setFolderName(savedFolder);
      setPdfPhotosPerPageState(savedPerPage);
      setPdfImageQualityState(savedQuality);
      setTitleTextAlignState(savedTitleAlign);
      setMemoTextAlignState(savedMemoAlign);
      setPdfShowDatetimeState(savedShowDatetime);
      setPdfFilenameIncludeDatetimeState(savedFilenameDatetime);
      setStampTextLayoutState(savedTextLayout);
      setCameraHandState(savedCameraHand);
      onSettingsSaved?.();
      Alert.alert(
        '저장 완료',
        `새 사진은 "${savedFolder}" 폴더에 저장됩니다.\n카메라 메뉴: ${savedCameraHand === 'left' ? '왼손(왼쪽 하단)' : '오른손(오른쪽 하단)'}.\nPDF는 페이지당 ${savedPerPage}장, 화질 ${pdfQualityLabel(savedQuality)}.\nPDF 일시 ${savedShowDatetime ? '표시' : '숨김'}, 파일명 날짜·시간 ${savedFilenameDatetime ? '포함' : '제외'}.\n제목·메모 ${stampTextLayoutLabel(savedTextLayout)}, 제목 ${textAlignLabel(savedTitleAlign)}, 메모 ${textAlignLabel(savedMemoAlign)} 정렬.`,
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

  const handleReset = () => {
    setFolderName(DEFAULT_STAMPS_FOLDER);
    setPdfPhotosPerPageState(DEFAULT_PDF_PHOTOS_PER_PAGE);
    setPdfImageQualityState(DEFAULT_PDF_IMAGE_QUALITY);
    setTitleTextAlignState(DEFAULT_TITLE_TEXT_ALIGN);
    setMemoTextAlignState(DEFAULT_MEMO_TEXT_ALIGN);
    setPdfShowDatetimeState(DEFAULT_PDF_SHOW_DATETIME);
    setPdfFilenameIncludeDatetimeState(DEFAULT_PDF_FILENAME_INCLUDE_DATETIME);
    setStampTextLayoutState(DEFAULT_STAMP_TEXT_LAYOUT);
    setCameraHandState(DEFAULT_CAMERA_HAND);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>← {backLabel}</Text>
        </Pressable>
        <Text style={styles.title}>설정</Text>
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
          <Text style={styles.label}>사진 저장 폴더 (앱 내부)</Text>
          <Text style={styles.hint}>
            앱 데이터 안의 하위 폴더 이름입니다. 변경 후 새로 찍은 사진부터 적용됩니다.
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
                왼손
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
                오른손
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
                    {option}
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
                    {option.label}
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
                표시
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
                숨김
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
                포함
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
                제외
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
                별도 영역
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
                워터마크
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
                    {textAlignLabel(option)}
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
              <Text style={styles.primaryButtonText}>저장</Text>
            )}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleReset} disabled={saving}>
            <Text style={styles.secondaryButtonText}>
              기본값 (폴더: {DEFAULT_STAMPS_FOLDER}, PDF: {DEFAULT_PDF_PHOTOS_PER_PAGE}장, 원본, 정렬 왼쪽)
            </Text>
          </Pressable>

          <Text style={[styles.label, styles.sectionGap]}>휴지통</Text>
          <Text style={styles.hint}>
            휴지통에 {trashCount}개 있습니다. 비우면 사진과 기록이 영구 삭제됩니다.
          </Text>
          <Pressable
            style={[styles.dangerButton, (saving || emptyingTrash) && styles.buttonDisabled]}
            onPress={handleEmptyTrash}
            disabled={saving || emptyingTrash}
          >
            {emptyingTrash ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.dangerButtonText}>휴지통 비우기</Text>
            )}
          </Pressable>

          <Text style={[styles.label, styles.sectionGap]}>앱 정보</Text>
          <Text style={styles.hint}>VoiceStamp {appVersion}</Text>
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
            onPress={() => void openInfoPage('/help')}
          >
            <Text style={styles.secondaryButtonText}>도움말</Text>
          </Pressable>
          <Text style={styles.copyright}>© 2026 이형우</Text>
        </ScrollView>
      )}
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
  backText: {
    color: '#2563eb',
    fontWeight: '600',
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
    paddingBottom: 32,
    gap: 12,
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
