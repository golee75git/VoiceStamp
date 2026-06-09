import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSpeechInput } from '../hooks/useSpeechInput';
import {
  extractStampGroupFromImagePath,
  formatDefaultStampTitle,
  formatStampGroupName,
  refreshStampGroupDate,
} from '../services/fileService';
import { getCurrentPlaceLabel } from '../services/locationService';
import {
  getCameraHand,
  getCurrentSiteName,
  getMemoTextAlign,
  getTitleTextAlign,
  setCurrentSiteName,
  type CameraHand,
  type TextAlign,
} from '../services/settingsService';
import { saveStamp, updateStamp } from '../services/saveStamp';
import { listKnownStampGroupFolders } from '../services/stampFolderService';
import { moveStampsToTrash } from '../services/stampTrash';
import type { Stamp } from '../types/stamp';
import { VoiceInputField } from './VoiceInputField';

type SpeechTarget = 'title' | 'memo' | null;

function appendSpeech(base: string, spoken: string): string {
  const trimmed = spoken.trim();
  if (!trimmed) {
    return base;
  }
  if (!base.trim()) {
    return trimmed;
  }
  return `${base.trimEnd()} ${trimmed}`;
}

type StampSaveModalProps = {
  visible: boolean;
  imageUri: string | null;
  stamp?: Stamp | null;
  onClose: () => void;
  onSaved: () => void;
};

export function StampSaveModal({
  visible,
  imageUri,
  stamp = null,
  onClose,
  onSaved,
}: StampSaveModalProps) {
  const isEdit = stamp != null;
  const [siteName, setSiteName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechTarget, setSpeechTarget] = useState<SpeechTarget>(null);
  const [titleTextAlign, setTitleTextAlign] = useState<TextAlign>('left');
  const [memoTextAlign, setMemoTextAlign] = useState<TextAlign>('left');
  const [cameraHand, setCameraHand] = useState<CameraHand>('right');
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [folderPickerVisible, setFolderPickerVisible] = useState(false);
  const [folderOptions, setFolderOptions] = useState<string[]>([]);
  const [folderOptionsLoading, setFolderOptionsLoading] = useState(false);
  const speechTargetRef = useRef<SpeechTarget>(null);
  const speechBaseRef = useRef({ title: '', memo: '' });
  const titleTouchedRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollFieldIntoView = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    speechTargetRef.current = speechTarget;
  }, [speechTarget]);

  const { listening, available, start, stop } = useSpeechInput({
    onResult: (text, isFinal) => {
      const target = speechTargetRef.current;
      if (target === 'title') {
        setTitle(appendSpeech(speechBaseRef.current.title, text));
      } else if (target === 'memo') {
        setMemo(appendSpeech(speechBaseRef.current.memo, text));
      }
      if (isFinal) {
        setSpeechTarget(null);
      }
    },
  });

  useEffect(() => {
    if (!visible) {
      return;
    }

    let cancelled = false;
    (async () => {
      const [titleAlign, memoAlign, hand] = await Promise.all([
        getTitleTextAlign(),
        getMemoTextAlign(),
        getCameraHand(),
      ]);
      if (!cancelled) {
        setTitleTextAlign(titleAlign);
        setMemoTextAlign(memoAlign);
        setCameraHand(hand);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setSiteName('');
      setGroupName('');
      setTitle('');
      setMemo('');
      setSaving(false);
      setLocationLoading(false);
      setError(null);
      setSpeechTarget(null);
      setImageViewerVisible(false);
      setFolderPickerVisible(false);
      setFolderOptions([]);
      setFolderOptionsLoading(false);
      setDeleting(false);
      titleTouchedRef.current = false;
      stop();
    } else if (stamp) {
      setTitle(stamp.title);
      setMemo(stamp.memo);
      setGroupName(extractStampGroupFromImagePath(stamp.imagePath) ?? '');
      titleTouchedRef.current = true;
    }
  }, [visible, stamp, stop]);

  useEffect(() => {
    if (!visible || isEdit || !imageUri) {
      return;
    }

    let cancelled = false;
    const capturedAt = Date.now();

    if (!titleTouchedRef.current) {
      setTitle(formatDefaultStampTitle(capturedAt));
    }

    setLocationLoading(true);

    (async () => {
      const savedSiteName = await getCurrentSiteName();
      if (!cancelled) {
        setSiteName(savedSiteName);
      }

      try {
        const place = await getCurrentPlaceLabel();
        if (cancelled || titleTouchedRef.current) {
          return;
        }
        setTitle(formatDefaultStampTitle(capturedAt, place ?? undefined));
      } catch {
        // 날짜·시간 제목은 이미 설정됨
      } finally {
        if (!cancelled) {
          setLocationLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, isEdit, imageUri]);

  const handleMicPress = async (target: SpeechTarget) => {
    if (listening && speechTarget === target) {
      stop();
      setSpeechTarget(null);
      return;
    }

    if (target === 'title') {
      titleTouchedRef.current = true;
      speechBaseRef.current.title = title;
    } else if (target === 'memo') {
      speechBaseRef.current.memo = memo;
    }

    setSpeechTarget(target);
    const started = await start();
    if (!started) {
      setSpeechTarget(null);
    }
  };

  const confirmTrashDelete = async () => {
    if (!stamp) {
      return;
    }

    setDeleting(true);
    try {
      const moved = await moveStampsToTrash([stamp.id]);
      if (moved === 0) {
        Alert.alert('삭제 실패', '스탬프를 찾을 수 없습니다.');
        return;
      }
      setImageViewerVisible(false);
      onSaved();
      onClose();
    } catch (err) {
      Alert.alert(
        '삭제 실패',
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleImageDeletePress = () => {
    if (saving || deleting) {
      return;
    }

    if (isEdit && stamp) {
      Alert.alert('휴지통으로 이동', '이 스탬프를 휴지통으로 옮깁니다.', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => void confirmTrashDelete() },
      ]);
      return;
    }

    Alert.alert('사진 버리기', '저장하지 않은 사진을 버립니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '버리기',
        style: 'destructive',
        onPress: () => {
          setImageViewerVisible(false);
          onClose();
        },
      },
    ]);
  };

  const openFolderPicker = async () => {
    setFolderPickerVisible(true);
    setFolderOptionsLoading(true);
    try {
      const folders = await listKnownStampGroupFolders();
      setFolderOptions(folders);
    } catch {
      setFolderOptions([]);
    } finally {
      setFolderOptionsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUri || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit && stamp) {
        await updateStamp({ id: stamp.id, title, memo, groupName });
      } else {
        await setCurrentSiteName(siteName);
        await saveStamp({
          tempImageUri: imageUri,
          title,
          memo,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? '수정에 실패했습니다.'
            : '저장에 실패했습니다.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          bounces={false}
        >
          <View style={styles.card}>
            <Text style={styles.heading}>{isEdit ? '스탬프 수정' : '스탬프 저장'}</Text>

            {imageUri ? (
              <Pressable onPress={() => setImageViewerVisible(true)} accessibilityLabel="사진 전체 보기">
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              </Pressable>
            ) : null}

            {!isEdit ? (
              <View style={styles.siteField}>
                <Text style={styles.siteLabel}>장소명(앨범에 날짜_장소명 폴더저장)</Text>
                <TextInput
                  style={styles.siteInput}
                  value={siteName}
                  onChangeText={setSiteName}
                  placeholder="예: OO초 (비우면 날짜만 분류)"
                  onFocus={scrollFieldIntoView}
                  maxLength={80}
                />
              </View>
            ) : (
              <View style={styles.siteField}>
                <Text style={styles.siteLabel}>저장 폴더(앨범)</Text>
                <View style={styles.folderInputRow}>
                  <TextInput
                    style={styles.folderInput}
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="예: 20260608_OO초 (비우면 기본)"
                    onFocus={scrollFieldIntoView}
                    maxLength={80}
                  />
                  <Pressable style={styles.folderPickButton} onPress={() => void openFolderPicker()}>
                    <Text style={styles.folderPickButtonText}>선택</Text>
                  </Pressable>
                </View>
                <Text style={styles.locationHint}>
                  선택한 스탬프만 이동합니다. 앱 폴더와 갤러리 앨범이 함께 변경됩니다.
                </Text>
              </View>
            )}

            <View>
              <VoiceInputField
                label="제목"
                value={title}
                onChangeText={(text) => {
                  titleTouchedRef.current = true;
                  setTitle(text);
                }}
                onMicPress={() => handleMicPress('title')}
                listening={listening && speechTarget === 'title'}
                speechAvailable={available}
                onFocus={scrollFieldIntoView}
                textAlign={titleTextAlign}
                cameraHand={cameraHand}
              />
              {!isEdit && locationLoading ? (
                <Text style={styles.locationHint}>위치 확인 중…</Text>
              ) : null}
            </View>

            <VoiceInputField
              label="메모"
              value={memo}
              onChangeText={setMemo}
              onMicPress={() => handleMicPress('memo')}
              listening={listening && speechTarget === 'memo'}
              speechAvailable={available}
              multiline
              onFocus={scrollFieldIntoView}
              textAlign={memoTextAlign}
              cameraHand={cameraHand}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>{isEdit ? '수정' : '저장'}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>

    <Modal
      visible={imageViewerVisible && imageUri != null}
      transparent
      animationType="fade"
      onRequestClose={() => setImageViewerVisible(false)}
    >
      <View style={styles.imageViewerOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setImageViewerVisible(false)}
          accessibilityLabel="전체 보기 닫기"
        />
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.imageViewerImage}
            resizeMode="contain"
            pointerEvents="none"
          />
        ) : null}
        <View style={styles.imageViewerDeleteBar}>
          <Pressable
            style={[styles.imageViewerDeleteButton, deleting && styles.imageViewerDeleteButtonDisabled]}
            onPress={handleImageDeletePress}
            disabled={deleting || saving}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.imageViewerDeleteText}>
                {isEdit ? '휴지통으로 이동' : '사진 버리기'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>

    <Modal
      visible={folderPickerVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setFolderPickerVisible(false)}
    >
      <Pressable style={styles.folderPickerOverlay} onPress={() => setFolderPickerVisible(false)}>
        <Pressable style={styles.folderPickerCard} onPress={() => {}}>
          <Text style={styles.folderPickerTitle}>저장 폴더 선택</Text>
          {folderOptionsLoading ? (
            <ActivityIndicator style={styles.folderPickerLoading} color="#2563eb" />
          ) : (
            <FlatList
              data={['', ...folderOptions]}
              keyExtractor={(item) => item || '__default__'}
              style={styles.folderPickerList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.folderPickerEmpty}>저장된 폴더가 없습니다. 직접 입력해 주세요.</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={styles.folderPickerItem}
                  onPress={() => {
                    setGroupName(item);
                    setFolderPickerVisible(false);
                  }}
                >
                  <Text style={styles.folderPickerItemText}>{item || '(기본 폴더)'}</Text>
                </Pressable>
              )}
            />
          )}
          <Pressable style={styles.folderPickerClose} onPress={() => setFolderPickerVisible(false)}>
            <Text style={styles.folderPickerCloseText}>닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  scroll: {
    maxHeight: '90%',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 14,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  imageViewerImage: {
    width: '100%',
    height: '100%',
  },
  imageViewerDeleteBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  imageViewerDeleteButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  imageViewerDeleteButtonDisabled: {
    opacity: 0.7,
  },
  imageViewerDeleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  siteField: {
    gap: 8,
  },
  siteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  siteInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111',
  },
  folderInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  folderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111',
  },
  folderPickButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
  },
  folderPickButtonText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 15,
  },
  folderPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  folderPickerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '70%',
    gap: 12,
  },
  folderPickerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  folderPickerLoading: {
    marginVertical: 24,
  },
  folderPickerList: {
    maxHeight: 320,
  },
  folderPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  folderPickerItemText: {
    fontSize: 16,
    color: '#111',
  },
  folderPickerEmpty: {
    color: '#6b7280',
    fontSize: 14,
    paddingVertical: 16,
    textAlign: 'center',
  },
  folderPickerClose: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  folderPickerCloseText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  locationHint: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
