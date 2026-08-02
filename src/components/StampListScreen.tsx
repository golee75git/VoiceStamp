import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { openInfoPage } from '../constants/infoUrls';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { confirmAlert } from '../utils/confirmAlert';
import type { CaptureStampForExport } from '../services/exportStampImage';
import { StampSaveModal } from './StampSaveModal';
import { ExportNameModal } from './ExportNameModal';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const micIcon = require('../../assets/mic-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const galleryButton = require('../../assets/gallery.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const captureButton = require('../../assets/capture.png');
import { saveStampsAsJpegToGallery } from '../services/exportStampImage';
import {
  loadStampHwpxExport,
  loadStampPdfExport,
  loadStampProjectExport,
  loadStampXlsxExport,
} from '../services/exportOnDemand';
import { fieldLabelsFromStamp, formatLabeledValue } from '../services/fieldLabels';
import { defaultPdfFileNameFromStampTitle } from '../services/pdfTitleFormat';
import { pickImageFromLibrary } from '../services/pickStampImage';
import {
  DEFAULT_STAMP_LIST_DISPLAY_MODE,
  loadSettingsForScreen,
  type CoordsLabelMode,
  type StampListDisplayMode,
  type StampTextLayout,
  type StampTextSize,
  type WatermarkStyle,
  type TextAlign,
  type CameraHand,
} from '../services/settingsService';
import { stampDisplayTitle } from '../services/stampFloor';
import { stampDisplayPlace } from '../services/stampPlace';
import { listStamps } from '../services/stampRepository';
import { scheduleStampThumbs } from '../services/stampThumb';
import { moveStampsToTrash } from '../services/stampTrash';
import { resolveImageUri } from '../services/fileService';
import type { Stamp } from '../types/stamp';
import { filterStampsByQuery } from '../utils/stampListSearch';
import { StampListThumb } from './StampListThumb';

type StampListScreenProps = {
  onBack: () => void;
  onOpenTrash: () => void;
  onOpenSettings: () => void;
  refreshKey: number;
  onChanged: () => void;
  captureStampForExport: CaptureStampForExport;
};

export function StampListScreen({
  onBack,
  onOpenTrash,
  onOpenSettings,
  refreshKey,
  onChanged,
  captureStampForExport,
}: StampListScreenProps) {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStamp, setEditingStamp] = useState<Stamp | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('VoiceStamp');
  const [pdfReportTitle, setPdfReportTitle] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [projectBusy, setProjectBusy] = useState(false);
  const [xlsxBusy, setXlsxBusy] = useState(false);
  const [hwpxBusy, setHwpxBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [titleTextAlign, setTitleTextAlign] = useState<TextAlign>('left');
  const [memoTextAlign, setMemoTextAlign] = useState<TextAlign>('left');
  const [pdfFilenameIncludeDatetime, setPdfFilenameIncludeDatetime] = useState(true);
  const [pdfShowDatetime, setPdfShowDatetime] = useState(true);
  const [exportFooterDatetime, setExportFooterDatetime] = useState(true);
  const [stampTextLayout, setStampTextLayout] = useState<StampTextLayout>('caption');
  const [stampTextSize, setStampTextSize] = useState<StampTextSize>('medium');
  const [stampListDisplayMode, setStampListDisplayMode] = useState<StampListDisplayMode>(
    DEFAULT_STAMP_LIST_DISPLAY_MODE,
  );
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkStyle>('solid_dark');
  const [coordsLabel, setCoordsLabel] = useState<CoordsLabelMode>('off');
  const [overlayOrgName, setOverlayOrgName] = useState('');
  const [overlayFooterPhrase, setOverlayFooterPhrase] = useState('');
  const [overlayShowOrgName, setOverlayShowOrgName] = useState(true);
  const [overlayShowFooterPhrase, setOverlayShowFooterPhrase] = useState(true);
  const [titleFieldLabel, setTitleFieldLabel] = useState('제목');
  const [placeFieldLabel, setPlaceFieldLabel] = useState('장소');
  const [memoFieldLabel, setMemoFieldLabel] = useState('메모');
  const [extra1FieldLabel, setExtra1FieldLabel] = useState('추가1');
  const [extra2FieldLabel, setExtra2FieldLabel] = useState('추가2');
  const [extra3FieldLabel, setExtra3FieldLabel] = useState('추가3');
  const [cameraHand, setCameraHand] = useState<CameraHand>('right');
  const [importUri, setImportUri] = useState<string | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [albumBusy, setAlbumBusy] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportNameModalVisible, setExportNameModalVisible] = useState(false);
  const [draftFileName, setDraftFileName] = useState('');
  const [draftReportTitle, setDraftReportTitle] = useState('');
  const listRef = useRef<FlatList<Stamp>>(null);
  const scrollOffsetRef = useRef(0);
  const skipRefreshLoadRef = useRef(false);

  const { listening: searchListening, available: searchSpeechAvailable, start: startSearchSpeech, stop: stopSearchSpeech } =
    useSpeechInput({
      onResult: (text) => {
        setSearchQuery(text.trim());
      },
    });

  const handleSearchMicPress = useCallback(async () => {
    if (searchListening) {
      stopSearchSpeech();
      return;
    }
    const started = await startSearchSpeech();
    if (!started) {
      Alert.alert(
        '음성 검색',
        searchSpeechAvailable
          ? '마이크 권한을 허용하거나 잠시 후 다시 시도해 주세요.'
          : '이 기기에서는 음성 검색을 사용할 수 없습니다.',
      );
    }
  }, [searchListening, searchSpeechAvailable, startSearchSpeech, stopSearchSpeech]);

  const restoreListScroll = useCallback(() => {
    const offset = scrollOffsetRef.current;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset, animated: false });
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset, animated: false });
      });
    });
  }, []);

  const removeStampsKeepScroll = useCallback(
    (ids: string[]) => {
      const trashedIds = new Set(ids);
      setStamps((prev) => prev.filter((stamp) => !trashedIds.has(stamp.id)));
      skipRefreshLoadRef.current = true;
      onChanged();
      restoreListScroll();
    },
    [onChanged, restoreListScroll],
  );

  const load = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    try {
      const rows = await listStamps();
      setStamps(rows);
      scheduleStampThumbs(rows, resolveImageUri);
    } finally {
      setLoading(false);
    }
    try {
      const settings = await loadSettingsForScreen();
      setTitleTextAlign(settings.titleTextAlign);
      setMemoTextAlign(settings.memoTextAlign);
      setPdfFilenameIncludeDatetime(settings.pdfFilenameIncludeDatetime);
      setPdfShowDatetime(settings.pdfShowDatetime);
      setExportFooterDatetime(settings.exportFooterDatetime);
      setStampTextLayout(settings.stampTextLayout);
      setStampTextSize(settings.stampTextSize);
      setStampListDisplayMode(settings.stampListDisplayMode);
      setWatermarkStyle(settings.watermarkStyle);
      setCoordsLabel(settings.coordsLabelMode);
      setOverlayOrgName(settings.overlayOrgName);
      setOverlayFooterPhrase(settings.overlayFooterPhrase);
      setOverlayShowOrgName(settings.overlayShowOrgName);
      setOverlayShowFooterPhrase(settings.overlayShowFooterPhrase);
      setTitleFieldLabel(settings.titleFieldLabel);
      setPlaceFieldLabel(settings.placeFieldLabel);
      setMemoFieldLabel(settings.memoFieldLabel);
      setExtra1FieldLabel(settings.extra1FieldLabel);
      setExtra2FieldLabel(settings.extra2FieldLabel);
      setExtra3FieldLabel(settings.extra3FieldLabel);
      setCameraHand(settings.cameraHand);
    } catch {
      // 목록은 이미 표시됨
    }
  }, []);

  useEffect(() => {
    if (skipRefreshLoadRef.current) {
      skipRefreshLoadRef.current = false;
      return;
    }
    load({ silent: refreshKey > 0 });
  }, [load, refreshKey]);

  const filteredStamps = useMemo(
    () => filterStampsByQuery(stamps, searchQuery),
    [stamps, searchQuery],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [searchQuery]);

  useEffect(() => {
    if (!selecting || selectedIds.size === 0) {
      return;
    }

    const selected = stamps.filter((s) => selectedIds.has(s.id));
    const defaultName = defaultPdfFileNameFromStampTitle(
      selected[0]?.title,
      pdfFilenameIncludeDatetime,
    );
    setPdfFileName(defaultName);
    setPdfReportTitle(defaultName);
  }, [selectedIds, stamps, selecting, pdfFilenameIncludeDatetime]);

  const exitSelection = () => {
    if (searchListening) {
      stopSearchSpeech();
    }
    setSelecting(false);
    setSelectedIds(new Set());
    setPdfUri(null);
    setPdfFileName('VoiceStamp');
    setPdfReportTitle('');
    setExportNameModalVisible(false);
    scheduleStampThumbs(stamps, resolveImageUri);
  };

  const openExportNameModal = () => {
    if (searchListening) {
      stopSearchSpeech();
    }
    setDraftFileName(pdfFileName);
    setDraftReportTitle(pdfReportTitle);
    setExportNameModalVisible(true);
  };

  const confirmExportNameModal = () => {
    setPdfFileName(draftFileName.trim() || 'VoiceStamp');
    setPdfReportTitle(draftReportTitle);
    setPdfUri(null);
    setExportNameModalVisible(false);
  };

  const cancelExportNameModal = () => {
    setExportNameModalVisible(false);
  };

  const toggleSelect = (id: string) => {
    setPdfUri(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSelectedStamps = () => stamps.filter((s) => selectedIds.has(s.id));

  const handleCardPress = (item: Stamp) => {
    if (selecting) {
      toggleSelect(item.id);
    } else {
      setEditingStamp(item);
    }
  };

  const handleCardLongPress = (item: Stamp) => {
    if (!selecting) {
      if (searchListening) {
        stopSearchSpeech();
      }
      setSelecting(true);
      setPdfUri(null);
      setSelectedIds(new Set([item.id]));
      return;
    }
    toggleSelect(item.id);
  };

  const handleCreatePdf = async () => {
    const selected = getSelectedStamps();
    if (selected.length === 0) return;

    setPdfBusy(true);
    try {
      const { createStampsPdf } = await loadStampPdfExport();
      const uri = await createStampsPdf(selected, pdfFileName, pdfReportTitle);
      setPdfUri(uri);
      Alert.alert('PDF 생성 완료', '저장 또는 공유 버튼을 눌러주세요.');
    } catch (e) {
      Alert.alert(
        'PDF 생성 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSavePdf = async () => {
    if (!pdfUri) return;

    setPdfBusy(true);
    try {
      const { savePdf } = await loadStampPdfExport();
      await savePdf(pdfUri, pdfFileName);
    } catch (e) {
      Alert.alert(
        'PDF 저장 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSharePdf = async () => {
    if (!pdfUri) return;

    setPdfBusy(true);
    try {
      const { sharePdf } = await loadStampPdfExport();
      await sharePdf(pdfUri, pdfFileName);
    } catch (e) {
      Alert.alert(
        'PDF 공유 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSaveImages = async () => {
    const selected = getSelectedStamps();
    if (selected.length === 0) {
      return;
    }

    setImageBusy(true);
    try {
      const exportOptions = {
        titleAlign: titleTextAlign,
        memoAlign: memoTextAlign,
        showDatetime: pdfShowDatetime,
        showFooterDatetime: exportFooterDatetime,
        textLayout: stampTextLayout,
        stampTextSize,
        watermarkStyle,
        coordsLabel,
        orgName: overlayOrgName,
        footerPhrase: overlayFooterPhrase,
        showOrgName: overlayShowOrgName,
        showFooterPhrase: overlayShowFooterPhrase,
        titleFieldLabel,
        placeFieldLabel,
        memoFieldLabel,
        extra1FieldLabel,
        extra2FieldLabel,
        extra3FieldLabel,
      };
      const { saved, failed } = await saveStampsAsJpegToGallery(
        selected,
        exportOptions,
        pdfFileName,
        captureStampForExport,
      );

      if (saved === 0) {
        Alert.alert('이미지 저장 실패', '선택한 스탬프를 저장하지 못했습니다.');
        return;
      }

      const failPart = failed > 0 ? `\n${failed}장은 실패했습니다.` : '';
      Alert.alert(
        '이미지 저장 완료',
        Platform.OS === 'web'
          ? `${saved}장을 다운로드했습니다.${failPart}`
          : `${saved}장을 갤러리 VoiceStamp 앨범에 저장했습니다.${failPart}`,
      );
    } catch (e) {
      Alert.alert(
        '이미지 저장 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setImageBusy(false);
    }
  };

  const exportBusy = pdfBusy || imageBusy || projectBusy || xlsxBusy || hwpxBusy;

  const handleShareProject = async () => {
    const selected = getSelectedStamps();
    if (selected.length === 0) {
      return;
    }

    setProjectBusy(true);
    try {
      // PDF는 넣지 않음 — 생성 비용이 커서 ZIP은 이미지·manifest만 포함. PDF는 목록 「PDF」로 별도 저장.
      const { createStampsProjectZip, shareProjectZip } = await loadStampProjectExport();
      const result = await createStampsProjectZip(
        selected,
        pdfFileName,
        pdfReportTitle,
        { includePdf: false },
      );
      await shareProjectZip(result);
      Alert.alert(
        '프로젝트 저장 완료',
        Platform.OS === 'web'
          ? 'ZIP(사진·메타)을 다운로드했습니다. PC /report 에서 편집·PDF 인쇄할 수 있습니다.'
          : '프로젝트 ZIP(사진·메타)을 공유했습니다. PC voicestamp-gilt.vercel.app/report 에서 편집하세요. PDF는 목록 「PDF」로 따로 저장합니다.',
      );
    } catch (e) {
      Alert.alert(
        '프로젝트 저장 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setProjectBusy(false);
    }
  };

  const handleShareXlsx = async () => {
    const selected = getSelectedStamps();
    if (selected.length === 0) {
      return;
    }

    setXlsxBusy(true);
    try {
      const { createStampsXlsx, shareStampsXlsx } = await loadStampXlsxExport();
      const result = await createStampsXlsx(selected, pdfFileName);
      await shareStampsXlsx(result);
      Alert.alert(
        '엑셀 저장 완료',
        Platform.OS === 'web'
          ? 'XLSX 파일을 다운로드했습니다. PC Excel에서 제목·메모·층을 편집할 수 있습니다.'
          : '엑셀 파일을 공유했습니다. PC Excel에서 제목·메모·층을 편집할 수 있습니다.',
      );
    } catch (e) {
      Alert.alert(
        '엑셀 저장 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setXlsxBusy(false);
    }
  };

  const handleShareHwpx = async () => {
    const selected = getSelectedStamps();
    if (selected.length === 0) {
      return;
    }

    setHwpxBusy(true);
    try {
      const { createStampsHwpx, shareStampsHwpx } = await loadStampHwpxExport();
      const result = await createStampsHwpx(selected, pdfFileName, pdfReportTitle);
      await shareStampsHwpx(result);
      Alert.alert(
        'HWPX 저장 완료',
        Platform.OS === 'web'
          ? 'HWPX 파일을 다운로드했습니다. PC에서 한컴오피스 등으로 열어 편집할 수 있습니다.'
          : 'HWPX 파일을 공유했습니다. PC로 보낸 뒤 한컴오피스 등에서 편집할 수 있습니다.',
      );
    } catch (e) {
      Alert.alert(
        'HWPX 저장 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setHwpxBusy(false);
    }
  };

  const handlePickFromLibrary = async () => {
    if (albumBusy || selecting) {
      return;
    }

    setAlbumBusy(true);
    try {
      const uri = await pickImageFromLibrary();
      if (uri) {
        setImportUri(uri);
        setImportModalVisible(true);
      }
    } catch (e) {
      Alert.alert(
        '앨범',
        e instanceof Error ? e.message : '앨범에서 선택하지 못했습니다.',
      );
    } finally {
      setAlbumBusy(false);
    }
  };

  const handleDeleteSelected = () => {
    void (async () => {
      const selected = getSelectedStamps();
      if (selected.length === 0) {
        return;
      }

      const confirmed = await confirmAlert(
        '휴지통으로 이동',
        `선택한 ${selected.length}개 스탬프를 휴지통으로 옮깁니다.`,
        { confirmText: '삭제', destructive: true },
      );
      if (!confirmed) {
        return;
      }

      setDeleteBusy(true);
      try {
        const idsToTrash = [...selectedIds];
        const moved = await moveStampsToTrash(idsToTrash);
        if (moved === 0) {
          Alert.alert('삭제 실패', '스탬프를 찾을 수 없습니다.');
          return;
        }
        exitSelection();
        removeStampsKeepScroll(idsToTrash);
      } catch (e) {
        Alert.alert(
          '삭제 실패',
          e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
        );
      } finally {
        setDeleteBusy(false);
      }
    })();
  };

  const selectedCount = selectedIds.size;
  const hasSearchQuery = searchQuery.trim().length > 0;
  const selectionCompact = selecting && selectedCount > 0;
  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 2 : 1;
  const isGrid = numColumns > 1;

  const closeMenu = () => setMenuVisible(false);

  return (
    <View style={styles.container}>
      {menuVisible ? (
        <Pressable style={styles.menuBackdrop} onPress={closeMenu} accessibilityLabel="메뉴 닫기" />
      ) : null}
      <View style={[styles.header, selectionCompact && styles.headerCompact]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.title}>
              {selectionCompact ? `${selectedCount}개 선택` : '저장 목록'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {selecting ? (
              <Pressable onPress={exitSelection}>
                <Text style={styles.actionText}>취소</Text>
              </Pressable>
            ) : (
              stamps.length > 0 && (
                <Pressable
                  onPress={() => {
                    if (searchListening) {
                      stopSearchSpeech();
                    }
                    setSelecting(true);
                  }}
                >
                  <Text style={styles.actionText}>선택</Text>
                </Pressable>
              )
            )}
            {!selectionCompact ? (
              <Pressable
                style={styles.menuButton}
                onPress={() => setMenuVisible((visible) => !visible)}
                accessibilityLabel="더보기 메뉴"
              >
                <Text style={styles.menuButtonText}>⋮</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        {!selecting ? (
          <View style={styles.searchRow}>
            <Pressable
              style={[styles.searchMicButton, searchListening && styles.searchMicButtonActive]}
              onPress={handleSearchMicPress}
              accessibilityLabel={searchListening ? '음성 검색 중지' : '음성으로 제목·메모 검색'}
            >
              {searchListening ? (
                <Text style={styles.searchMicDot}>●</Text>
              ) : (
                <Image source={micIcon} style={styles.searchMicIcon} resizeMode="contain" />
              )}
            </Pressable>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="제목·메모 검색"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              accessibilityLabel="제목과 메모 검색"
            />
            {searchQuery.length > 0 && Platform.OS === 'android' ? (
              <Pressable
                style={styles.searchClearButton}
                onPress={() => setSearchQuery('')}
                accessibilityLabel="검색어 지우기"
              >
                <Text style={styles.searchClearText}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {menuVisible && !selectionCompact ? (
          <View style={styles.menuCard}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                onOpenTrash();
              }}
            >
              <Text style={styles.menuItemText}>휴지통</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                onOpenSettings();
              }}
            >
              <Text style={styles.menuItemText}>설정</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                void openInfoPage('/help');
              }}
            >
              <Text style={styles.menuItemText}>도움말</Text>
            </Pressable>
          </View>
        ) : null}
        {!selecting ? (
          <>
            <Text style={styles.countLine}>
              {hasSearchQuery ? (
                <>
                  검색 결과 <Text style={styles.countNumber}>{filteredStamps.length}</Text>개 · 전체{' '}
                  <Text style={styles.countNumber}>{stamps.length}</Text>개
                </>
              ) : (
                <>
                  전체 <Text style={styles.countNumber}>{stamps.length}</Text>개
                </>
              )}
            </Text>
            <View style={styles.hintRow}>
              <Text style={styles.hintIcon}>ⓘ</Text>
              <Text style={styles.hint}>항목을 길게 눌러 선택하거나 내보낼 수 있습니다.</Text>
            </View>
          </>
        ) : null}
        {selecting && !selectionCompact ? (
          <View style={styles.hintRow}>
            <Text style={styles.hintIcon}>ⓘ</Text>
            <Text style={styles.hint}>사진을 탭하거나 길게 눌러 선택하세요.</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.listArea, !selecting && styles.listAreaWithBottomBar]}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : stamps.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.empty}>저장된 스탬프가 없습니다.</Text>
          </View>
        ) : filteredStamps.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.empty}>검색 결과가 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            key={numColumns}
            data={filteredStamps}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={isGrid ? styles.columnWrapper : undefined}
            contentContainerStyle={[styles.list, !selecting && styles.listWithBottomBar]}
            extraData={`${selecting}:${selectedIds.size}:${[...selectedIds].join(',')}`}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            windowSize={5}
            // 선택 UI·하단바 토글 후 Android clipped 뷰가 흰 썸네일로 남는 경우 방지
            removeClippedSubviews={false}
            onScroll={(event) => {
              scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.id);
              const labels = fieldLabelsFromStamp(item);
              const displayTitle =
                formatLabeledValue(
                  labels.titleFieldLabel,
                  stampDisplayTitle(item, pdfShowDatetime),
                ) || `(${labels.titleFieldLabel} 없음)`;
              const showFullMeta = stampListDisplayMode === 'full';
              const displayPlace = showFullMeta
                ? formatLabeledValue(labels.placeFieldLabel, stampDisplayPlace(item) ?? '')
                : '';
              const displayMemo = showFullMeta
                ? formatLabeledValue(labels.memoFieldLabel, item.memo)
                : '';
              const displayExtra1 = showFullMeta
                ? formatLabeledValue(labels.extra1FieldLabel, item.extra1 ?? '')
                : '';
              const displayExtra2 = showFullMeta
                ? formatLabeledValue(labels.extra2FieldLabel, item.extra2 ?? '')
                : '';
              const displayExtra3 = showFullMeta
                ? formatLabeledValue(labels.extra3FieldLabel, item.extra3 ?? '')
                : '';
              return (
                <Pressable
                  style={[
                    styles.card,
                    isGrid && styles.cardGrid,
                    selecting && isSelected && styles.cardSelected,
                  ]}
                  onPress={() => handleCardPress(item)}
                  onLongPress={() => handleCardLongPress(item)}
                  delayLongPress={400}
                >
                  {selecting && (
                    <View style={isGrid ? styles.checkboxGrid : styles.checkbox}>
                      <View
                        style={[
                          styles.checkboxInner,
                          isSelected && styles.checkboxChecked,
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </View>
                  )}
                  <StampListThumb
                    id={item.id}
                    imagePath={item.imagePath}
                    style={isGrid ? styles.thumbnailGrid : styles.thumbnail}
                  />
                  <View style={styles.meta}>
                    <Text style={[styles.cardTitle, { textAlign: titleTextAlign }]} numberOfLines={1}>
                      {displayTitle}
                    </Text>
                    {showFullMeta && displayPlace ? (
                      <Text style={styles.cardPlace} numberOfLines={1}>
                        {displayPlace}
                      </Text>
                    ) : null}
                    {showFullMeta && displayExtra1 ? (
                      <Text style={styles.cardPlace} numberOfLines={1}>
                        {displayExtra1}
                      </Text>
                    ) : null}
                    {showFullMeta && displayExtra2 ? (
                      <Text style={styles.cardPlace} numberOfLines={1}>
                        {displayExtra2}
                      </Text>
                    ) : null}
                    {showFullMeta && displayExtra3 ? (
                      <Text style={styles.cardPlace} numberOfLines={1}>
                        {displayExtra3}
                      </Text>
                    ) : null}
                    {showFullMeta && displayMemo ? (
                      <Text
                        style={[styles.cardMemo, { textAlign: memoTextAlign }]}
                        numberOfLines={isGrid ? 3 : 2}
                      >
                        {displayMemo}
                      </Text>
                    ) : null}
                    <Text style={styles.cardDate}>
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {!selecting ? (
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.bottomGalleryButton, albumBusy && styles.bottomButtonDisabled]}
            onPress={handlePickFromLibrary}
            disabled={albumBusy}
            accessibilityLabel="갤러리에서 사진 선택"
          >
            <Image source={galleryButton} style={styles.bottomGalleryButtonImage} resizeMode="cover" />
            {albumBusy ? (
              <View style={styles.bottomGalleryButtonBusy}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : null}
          </Pressable>
          <Pressable
            style={styles.bottomCapturePillButton}
            onPress={onBack}
            accessibilityLabel="사진 촬영"
          >
            <Image source={captureButton} style={styles.bottomCapturePillButtonImage} resizeMode="cover" />
          </Pressable>
        </View>
      ) : selectionCompact ? (
        <View style={styles.exportBottomBar}>
          <View style={styles.pdfBar}>
            <Pressable
              style={styles.pdfBarButton}
              onPress={handleCreatePdf}
              disabled={exportBusy}
            >
              {pdfBusy && !pdfUri ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text style={styles.pdfBarButtonText}>PDF 만들기</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.pdfBarButton, !pdfUri && styles.pdfBarButtonDisabled]}
              onPress={handleSavePdf}
              disabled={!pdfUri || exportBusy}
            >
              <Text
                style={[
                  styles.pdfBarButtonText,
                  !pdfUri && styles.pdfBarButtonTextDisabled,
                ]}
              >
                저장
              </Text>
            </Pressable>
            <Pressable
              style={[styles.pdfBarButton, exportBusy && styles.pdfBarButtonDisabled]}
              onPress={handleSaveImages}
              disabled={exportBusy}
            >
              {imageBusy ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text style={styles.pdfBarButtonText}>이미지 저장</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.pdfBarButtonPrimary, !pdfUri && styles.pdfBarButtonDisabled]}
              onPress={handleSharePdf}
              disabled={!pdfUri || exportBusy}
            >
              <Text
                style={[
                  styles.pdfBarButtonPrimaryText,
                  !pdfUri && styles.pdfBarButtonTextDisabled,
                ]}
              >
                공유
              </Text>
            </Pressable>
          </View>
          <View style={styles.exportBar}>
            <Pressable
              style={[styles.pdfBarButton, exportBusy && styles.pdfBarButtonDisabled]}
              onPress={handleShareProject}
              disabled={exportBusy}
            >
              {projectBusy ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text style={styles.pdfBarButtonText}>프로젝트</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.pdfBarButton, exportBusy && styles.pdfBarButtonDisabled]}
              onPress={handleShareXlsx}
              disabled={exportBusy}
            >
              {xlsxBusy ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text style={styles.pdfBarButtonText}>엑셀</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.pdfBarButton, exportBusy && styles.pdfBarButtonDisabled]}
              onPress={handleShareHwpx}
              disabled={exportBusy}
            >
              {hwpxBusy ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text style={styles.pdfBarButtonText}>HWPX</Text>
              )}
            </Pressable>
          </View>
          <Pressable
            style={styles.exportDetailsToggle}
            onPress={openExportNameModal}
            disabled={exportBusy}
          >
            <Text style={styles.exportDetailsToggleText}>파일명·보고서 제목 편집</Text>
            <Text style={styles.exportNameSummary} numberOfLines={1}>
              {pdfFileName || 'VoiceStamp'}
              {pdfReportTitle.trim() ? ` · ${pdfReportTitle.trim()}` : ''}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.deleteButton, exportBusy && styles.pdfBarButtonDisabled]}
            onPress={handleDeleteSelected}
            disabled={exportBusy || deleteBusy}
          >
            {deleteBusy ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>휴지통으로 이동 ({selectedCount})</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <ExportNameModal
        visible={exportNameModalVisible}
        fileName={draftFileName}
        reportTitle={draftReportTitle}
        onChangeFileName={setDraftFileName}
        onChangeReportTitle={setDraftReportTitle}
        onConfirm={confirmExportNameModal}
        onCancel={cancelExportNameModal}
        disabled={exportBusy}
        cameraHand={cameraHand}
      />

      <StampSaveModal
        visible={editingStamp != null}
        stamp={editingStamp}
        imageUri={editingStamp ? resolveImageUri(editingStamp.imagePath) : null}
        captureStampForExport={captureStampForExport}
        onClose={() => setEditingStamp(null)}
        onSaved={load}
        onTrashed={(id) => removeStampsKeepScroll([id])}
      />

      <StampSaveModal
        visible={importModalVisible}
        imageUri={importUri}
        captureStampForExport={captureStampForExport}
        onClose={() => {
          setImportModalVisible(false);
          setImportUri(null);
        }}
        onSaved={() => {
          onChanged();
          load();
        }}
      />
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
    zIndex: 2,
  },
  headerCompact: {
    paddingBottom: 8,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
    lineHeight: 24,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  menuCard: {
    position: 'absolute',
    top: 88,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 140,
    paddingVertical: 4,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  searchMicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  searchMicButtonActive: {
    backgroundColor: '#fee2e2',
  },
  searchMicIcon: {
    width: 22,
    height: 22,
  },
  searchMicDot: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#111',
  },
  searchClearButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  searchClearText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  countLine: {
    fontSize: 14,
    color: '#6b7280',
  },
  countNumber: {
    color: '#2563eb',
    fontWeight: '700',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  hintIcon: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 18,
  },
  hint: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  pdfBar: {
    flexDirection: 'row',
    gap: 8,
  },
  exportBar: {
    flexDirection: 'row',
    gap: 8,
  },
  exportBottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    marginBottom: Platform.OS === 'android' ? 31 : 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  exportDetailsToggle: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  exportDetailsToggleText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  exportNameSummary: {
    color: '#6b7280',
    fontSize: 12,
    maxWidth: '100%',
  },
  pdfBarButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pdfBarButtonPrimary: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pdfBarButtonDisabled: {
    opacity: 0.45,
  },
  pdfBarButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  pdfBarButtonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pdfBarButtonTextDisabled: {
    color: '#9ca3af',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  actionText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
  listArea: {
    flex: 1,
  },
  listAreaWithBottomBar: {
    paddingBottom: 111,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: '#6b7280',
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listWithBottomBar: {
    paddingBottom: 127,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 31,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomGalleryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bottomGalleryButtonImage: {
    width: '100%',
    height: 52,
  },
  bottomGalleryButtonBusy: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bottomCapturePillButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bottomCapturePillButtonImage: {
    width: '100%',
    height: 52,
  },
  bottomAttachButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    backgroundColor: '#fff',
  },
  bottomCaptureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#2563eb',
  },
  bottomButtonDisabled: {
    opacity: 0.6,
  },
  bottomAttachIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomAttachIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bottomGalleryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  bottomAttachText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomCaptureIcon: {
    fontSize: 18,
  },
  bottomCaptureText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  columnWrapper: {
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
    marginBottom: 0,
    alignItems: 'stretch',
  },
  cardGrid: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 0,
    borderBottomWidth: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  cardSelected: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  checkbox: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
  checkboxGrid: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  thumbnail: {
    width: 76,
    height: 76,
    marginVertical: 4,
    marginLeft: 8,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  thumbnailGrid: {
    width: '100%',
    height: 140,
    margin: 0,
    borderRadius: 0,
    backgroundColor: '#e5e7eb',
  },
  meta: {
    flex: 1,
    paddingVertical: 6,
    paddingRight: 12,
    paddingLeft: 0,
    gap: 3,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  cardPlace: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  cardMemo: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardDateIcon: {
    fontSize: 12,
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
