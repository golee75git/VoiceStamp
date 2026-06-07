import { useEffect, useState } from 'react';
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

import {
  DEFAULT_MEMO_TEXT_ALIGN,
  DEFAULT_PDF_FILENAME_INCLUDE_DATETIME,
  DEFAULT_PDF_IMAGE_QUALITY,
  DEFAULT_PDF_PHOTOS_PER_PAGE,
  DEFAULT_PDF_SHOW_DATETIME,
  DEFAULT_STAMPS_FOLDER,
  DEFAULT_TITLE_TEXT_ALIGN,
  getMemoTextAlign,
  getPdfFilenameIncludeDatetime,
  getPdfImageQuality,
  getPdfPhotosPerPage,
  getPdfShowDatetime,
  getStampsFolderName,
  getTitleTextAlign,
  type PdfImageQuality,
  type PdfPhotosPerPage,
  setMemoTextAlign,
  setPdfFilenameIncludeDatetime,
  setPdfImageQuality,
  setPdfPhotosPerPage,
  setPdfShowDatetime,
  setStampsFolderName,
  setTitleTextAlign,
  TEXT_ALIGN_OPTIONS,
  type TextAlign,
  textAlignLabel,
} from '../services/settingsService';
import { emptyTrash, getTrashedStampCount } from '../services/stampTrash';

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
  onTrashEmptied?: () => void;
  onSettingsSaved?: () => void;
};

export function SettingsScreen({
  onBack,
  backLabel = '紐⑸줉',
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [emptyingTrash, setEmptyingTrash] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [name, perPage, quality, titleAlign, memoAlign, showDatetime, filenameDatetime, trashed] =
          await Promise.all([
          getStampsFolderName(),
          getPdfPhotosPerPage(),
          getPdfImageQuality(),
          getTitleTextAlign(),
          getMemoTextAlign(),
          getPdfShowDatetime(),
          getPdfFilenameIncludeDatetime(),
          getTrashedStampCount(),
        ]);
        setFolderName(name);
        setPdfPhotosPerPageState(perPage);
        setPdfImageQualityState(quality);
        setTitleTextAlignState(titleAlign);
        setMemoTextAlignState(memoAlign);
        setPdfShowDatetimeState(showDatetime);
        setPdfFilenameIncludeDatetimeState(filenameDatetime);
        setTrashCount(trashed);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  const handleEmptyTrash = () => {
    if (trashCount === 0) {
      Alert.alert('?댁???鍮꾩슦湲?, '?댁??듭씠 ?대? 鍮꾩뼱 ?덉뒿?덈떎.');
      return;
    }

    Alert.alert(
      '?댁???鍮꾩슦湲?,
      `${trashCount}媛??ㅽ꺃?꾨? ?곴뎄 ??젣?⑸땲?? ?섎룎由????놁뒿?덈떎.`,
      [
        { text: '痍⑥냼', style: 'cancel' },
        {
          text: '鍮꾩슦湲?,
          style: 'destructive',
          onPress: async () => {
            setEmptyingTrash(true);
            try {
              const removed = await emptyTrash();
              setTrashCount(0);
              onTrashEmptied?.();
              Alert.alert('?꾨즺', `${removed}媛쒕? ?곴뎄 ??젣?덉뒿?덈떎.`);
            } catch (e) {
              Alert.alert(
                '?ㅽ뙣',
                e instanceof Error ? e.message : '?????녿뒗 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.',
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
      ] = await Promise.all([
          setStampsFolderName(folderName),
          setPdfPhotosPerPage(pdfPhotosPerPage),
          setPdfImageQuality(pdfImageQuality),
          setTitleTextAlign(titleTextAlign),
          setMemoTextAlign(memoTextAlign),
          setPdfShowDatetime(pdfShowDatetime),
          setPdfFilenameIncludeDatetime(pdfFilenameIncludeDatetime),
        ]);
      setFolderName(savedFolder);
      setPdfPhotosPerPageState(savedPerPage);
      setPdfImageQualityState(savedQuality);
      setTitleTextAlignState(savedTitleAlign);
      setMemoTextAlignState(savedMemoAlign);
      setPdfShowDatetimeState(savedShowDatetime);
      setPdfFilenameIncludeDatetimeState(savedFilenameDatetime);
      onSettingsSaved?.();
      Alert.alert(
        '????꾨즺',
        `???ъ쭊? "${savedFolder}" ?대뜑????λ맗?덈떎.\nPDF???섏씠吏??${savedPerPage}?? ?붿쭏 ${pdfQualityLabel(savedQuality)}.\nPDF ?쇱떆 ${savedShowDatetime ? '?쒖떆' : '?④?'}, ?뚯씪紐??좎쭨쨌?쒓컙 ${savedFilenameDatetime ? '?ы븿' : '?쒖쇅'}.\n?쒕ぉ ${textAlignLabel(savedTitleAlign)}, 硫붾え ${textAlignLabel(savedMemoAlign)} ?뺣젹.`,
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>??{backLabel}</Text>
        </Pressable>
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

          <Text style={[styles.label, styles.sectionGap]}>?쒕ぉ ?뺣젹</Text>
          <Text style={styles.hint}>紐⑸줉쨌?낅젰쨌PDF?먯꽌 ?쒕ぉ ?띿뒪???뺣젹?낅땲??</Text>
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
          <Text style={styles.hint}>紐⑸줉쨌?낅젰쨌PDF?먯꽌 硫붾え ?띿뒪???뺣젹?낅땲??</Text>
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

          <Text style={[styles.label, styles.sectionGap]}>?댁???/Text>
          <Text style={styles.hint}>
            ?댁??듭뿉 {trashCount}媛??덉뒿?덈떎. 鍮꾩슦硫??ъ쭊怨?湲곕줉???곴뎄 ??젣?⑸땲??
          </Text>
          <Pressable
            style={[styles.dangerButton, (saving || emptyingTrash) && styles.buttonDisabled]}
            onPress={handleEmptyTrash}
            disabled={saving || emptyingTrash}
          >
            {emptyingTrash ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.dangerButtonText}>?댁???鍮꾩슦湲?/Text>
            )}
          </Pressable>
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
});
