import { useCallback, useEffect, useRef, useState } from 'react';
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
import type { CaptureStampForExport } from '../services/exportStampImage';
import { StampSaveModal } from './StampSaveModal';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const micIcon = require('../../assets/mic-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const galleryButton = require('../../assets/gallery.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const captureButton = require('../../assets/capture.png');
import { saveStampsAsJpegToGallery } from '../services/exportStampImage';
import { createStampsPdf, savePdf, sharePdf } from '../services/exportPdf';
import { createStampsProjectZip, shareProjectZip } from '../services/exportProject';
import { createStampsHwpx, shareStampsHwpx } from '../services/exportHwpx';
import { createStampsXlsx, shareStampsXlsx } from '../services/exportXlsx';
import { defaultPdfFileNameFromStampTitle } from '../services/pdfTitleFormat';
import { pickImageFromLibrary } from '../services/pickStampImage';
import {
  getMemoTextAlign,
  getPdfFilenameIncludeDatetime,
  getPdfShowDatetime,
  getStampTextLayout,
  getWatermarkStyle,
  getCoordsLabelMode,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getTitleTextAlign,
  type CoordsLabelMode,
  type StampTextLayout,
  type WatermarkStyle,
  type TextAlign,
} from '../services/settingsService';
import { stampDisplayTitle } from '../services/stampFloor';
import { listStamps } from '../services/stampRepository';
import { moveStampsToTrash } from '../services/stampTrash';
import { resolveImageUri } from '../services/fileService';
import type { Stamp } from '../types/stamp';

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
  const [stampTextLayout, setStampTextLayout] = useState<StampTextLayout>('caption');
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkStyle>('solid_dark');
  const [coordsLabel, setCoordsLabel] = useState<CoordsLabelMode>('off');
  const [overlayOrgName, setOverlayOrgName] = useState('');
  const [overlayFooterPhrase, setOverlayFooterPhrase] = useState('');
  const [overlayShowOrgName, setOverlayShowOrgName] = useState(true);
  const [overlayShowFooterPhrase, setOverlayShowFooterPhrase] = useState(true);
  const [importUri, setImportUri] = useState<string | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [albumBusy, setAlbumBusy] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const listRef = useRef<FlatList<Stamp>>(null);
  const scrollOffsetRef = useRef(0);
  const skipRefreshLoadRef = useRef(false);

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
      const [rows, titleAlign, memoAlign, filenameDatetime, showDatetime, textLayout, wmStyle, coordsLabelMode, orgName, footerPhrase, showOrgName, showFooterPhrase] = await Promise.all([
        listStamps(),
        getTitleTextAlign(),
        getMemoTextAlign(),
        getPdfFilenameIncludeDatetime(),
        getPdfShowDatetime(),
        getStampTextLayout(),
        getWatermarkStyle(),
        getCoordsLabelMode(),
        getOverlayOrgName(),
        getOverlayFooterPhrase(),
        getOverlayShowOrgName(),
        getOverlayShowFooterPhrase(),
      ]);
      setStamps(rows);
      setTitleTextAlign(titleAlign);
      setMemoTextAlign(memoAlign);
      setPdfFilenameIncludeDatetime(filenameDatetime);
      setPdfShowDatetime(showDatetime);
      setStampTextLayout(textLayout);
      setWatermarkStyle(wmStyle);
      setCoordsLabel(coordsLabelMode);
      setOverlayOrgName(orgName);
      setOverlayFooterPhrase(footerPhrase);
      setOverlayShowOrgName(showOrgName);
      setOverlayShowFooterPhrase(showFooterPhrase);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipRefreshLoadRef.current) {
      skipRefreshLoadRef.current = false;
      return;
    }
    load({ silent: refreshKey > 0 });
  }, [load, refreshKey]);

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
    setSelecting(false);
    setSelectedIds(new Set());
    setPdfUri(null);
    setPdfFileName('VoiceStamp');
    setPdfReportTitle('');
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
        textLayout: stampTextLayout,
        watermarkStyle,
        coordsLabel,
        orgName: overlayOrgName,
        footerPhrase: overlayFooterPhrase,
        showOrgName: overlayShowOrgName,
        showFooterPhrase: overlayShowFooterPhrase,
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
      const result = await createStampsProjectZip(
        selected,
        pdfFileName,
        pdfReportTitle,
        { includePdf: true },
      );
      await shareProjectZip(result);
      Alert.alert(
        '프로젝트 저장 완료',
        Platform.OS === 'web'
          ? 'ZIP 파일을 다운로드했습니다. PC에서 압축을 풀거나 /report 페이지에서 편집할 수 있습니다.'
          : '프로젝트 ZIP을 공유했습니다. PC로 보낸 뒤 압축을 풀거나 voicestamp-gilt.vercel.app/report 에서 편집할 수 있습니다.',
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
    const selected = getSelectedStamps();
    if (selected.length === 0) {
      return;
    }

    Alert.alert(
      '휴지통으로 이동',
      `선택한 ${selected.length}개 스탬프를 휴지통으로 옮깁니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
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
          },
        },
      ],
    );
  };

  const selectedCount = selectedIds.size;
  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 2 : 1;
  const isGrid = numColumns > 1;

  const closeMenu = () => setMenuVisible(false);

  return (
    <View style={styles.container}>
      {menuVisible ? (
        <Pressable style={styles.menuBackdrop} onPress={closeMenu} accessibilityLabel="메뉴 닫기" />
      ) : null}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <Image source={micIcon} style={styles.headerMicIcon} resizeMode="contain" />
            <Text style={styles.title}>저장 목록</Text>
          </View>
          <View style={styles.headerActions}>
            {selecting ? (
              <Pressable onPress={exitSelection}>
                <Text style={styles.actionText}>취소</Text>
              </Pressable>
            ) : (
              stamps.length > 0 && (
                <Pressable onPress={() => setSelecting(true)}>
                  <Text style={styles.actionText}>선택</Text>
                </Pressable>
              )
            )}
            <Pressable
              style={styles.menuButton}
              onPress={() => setMenuVisible((visible) => !visible)}
              accessibilityLabel="더보기 메뉴"
            >
              <Text style={styles.menuButtonText}>⋮</Text>
            </Pressable>
          </View>
        </View>
        {menuVisible ? (
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
        <Text style={styles.countLine}>
          전체 <Text style={styles.countNumber}>{stamps.length}</Text>개
        </Text>
        <View style={styles.hintRow}>
          <Text style={styles.hintIcon}>ⓘ</Text>
          <Text style={styles.hint}>
            {selecting
              ? selectedCount > 0
                ? '탭으로 추가 선택 · PDF / 이미지 / 프로젝트 / 엑셀 저장'
                : '사진을 탭하거나 길게 눌러 선택하세요.'
              : '항목을 길게 눌러 선택하거나 내보낼 수 있습니다.'}
          </Text>
        </View>
        {selecting && selectedCount > 0 && (
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
              style={[
                styles.pdfBarButtonPrimary,
                !pdfUri && styles.pdfBarButtonDisabled,
              ]}
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
        )}
        {selecting && selectedCount > 0 && (
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
        )}
        {selecting && selectedCount > 0 && (
          <View style={styles.pdfNameRow}>
            <Text style={styles.pdfNameLabel}>PDF·이미지 파일명</Text>
            <TextInput
              style={styles.pdfNameInput}
              value={pdfFileName}
              onChangeText={setPdfFileName}
              placeholder="VoiceStamp"
              editable={!exportBusy}
            />
            <Text style={[styles.pdfNameLabel, styles.pdfReportTitleLabel]}>보고서 제목</Text>
            <TextInput
              style={styles.pdfNameInput}
              value={pdfReportTitle}
              onChangeText={setPdfReportTitle}
              placeholder="1페이지 상단 제목 (비우면 표시 안 함)"
              editable={!exportBusy}
            />
          </View>
        )}
        {selecting && selectedCount > 0 && (
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
        )}
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
        ) : (
          <FlatList
            ref={listRef}
            key={numColumns}
            data={stamps}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={isGrid ? styles.columnWrapper : undefined}
            contentContainerStyle={[styles.list, !selecting && styles.listWithBottomBar]}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            onScroll={(event) => {
              scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.id);
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
                  <Image
                    source={{ uri: resolveImageUri(item.imagePath) }}
                    style={isGrid ? styles.thumbnailGrid : styles.thumbnail}
                  />
                  <View style={styles.meta}>
                    <Text style={[styles.cardTitle, { textAlign: titleTextAlign }]} numberOfLines={1}>
                      {stampDisplayTitle(item, pdfShowDatetime) || '(제목 없음)'}
                    </Text>
                    <Text
                      style={[styles.cardMemo, { textAlign: memoTextAlign }]}
                      numberOfLines={isGrid ? 3 : 2}
                    >
                      {item.memo || '(메모 없음)'}
                    </Text>
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
      ) : null}

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
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerMicIcon: {
    width: 28,
    height: 28,
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
    marginTop: 4,
  },
  exportBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
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
  pdfNameRow: {
    gap: 4,
    marginTop: 4,
  },
  pdfNameLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  pdfReportTitleLabel: {
    marginTop: 8,
  },
  pdfNameInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#111',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
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
    padding: 16,
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
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardGrid: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 0,
  },
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  checkbox: {
    paddingLeft: 12,
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
    width: 96,
    height: 96,
    margin: 12,
    borderRadius: 12,
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
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 0,
    gap: 6,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
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
