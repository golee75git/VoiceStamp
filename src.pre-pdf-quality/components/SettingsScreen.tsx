import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  DEFAULT_PDF_PHOTOS_PER_PAGE,
  DEFAULT_STAMPS_FOLDER,
  getPdfPhotosPerPage,
  getStampsFolderName,
  type PdfPhotosPerPage,
  setPdfPhotosPerPage,
  setStampsFolderName,
} from '../services/settingsService';

const PDF_OPTIONS: PdfPhotosPerPage[] = [1, 2, 3, 4];

type SettingsScreenProps = {
  onBack: () => void;
  backLabel?: string;
};

export function SettingsScreen({ onBack, backLabel = '목록' }: SettingsScreenProps) {
  const [folderName, setFolderName] = useState(DEFAULT_STAMPS_FOLDER);
  const [pdfPhotosPerPage, setPdfPhotosPerPageState] = useState<PdfPhotosPerPage>(
    DEFAULT_PDF_PHOTOS_PER_PAGE,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [name, perPage] = await Promise.all([getStampsFolderName(), getPdfPhotosPerPage()]);
        setFolderName(name);
        setPdfPhotosPerPageState(perPage);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const [savedFolder, savedPerPage] = await Promise.all([
        setStampsFolderName(folderName),
        setPdfPhotosPerPage(pdfPhotosPerPage),
      ]);
      setFolderName(savedFolder);
      setPdfPhotosPerPageState(savedPerPage);
      Alert.alert(
        '저장 완료',
        `새 사진은 "${savedFolder}" 폴더에 저장됩니다.\nPDF는 페이지당 ${savedPerPage}장으로 보냅니다.`,
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
        <View style={styles.body}>
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
              기본값 (폴더: {DEFAULT_STAMPS_FOLDER}, PDF: {DEFAULT_PDF_PHOTOS_PER_PAGE}장)
            </Text>
          </Pressable>
        </View>
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
  body: {
    padding: 20,
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
});
