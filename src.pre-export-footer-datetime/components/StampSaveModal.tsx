import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useSpeechInput } from '../hooks/useSpeechInput';
import { confirmAlert } from '../utils/confirmAlert';
import {
  extractStampGroupFromImagePath,
  formatDefaultStampTitle,
  formatStampGroupName,
  refreshStampGroupDate,
} from '../services/fileService';
import { getCurrentLocationSnapshot, getFastLocationSnapshot, type LocationSnapshot } from '../services/locationService';
import {
  getCurrentSiteName,
  setCurrentSiteName,
  setLastCapturePlaceCache,
  setLastPlaceLabel,
  setTitleFieldLabel as writeTitleFieldLabel,
  setPlaceFieldLabel as writePlaceFieldLabel,
  setMemoFieldLabel as writeMemoFieldLabel,
  setExtra1FieldLabel as writeExtra1FieldLabel,
  setExtra2FieldLabel as writeExtra2FieldLabel,
  setExtra3FieldLabel as writeExtra3FieldLabel,
} from '../services/settingsService';
import type { CameraHand, CoordsLabelMode, StampTextLayout, StampTextSize, TextAlign, WatermarkStyle } from '../services/settingsService';
import {
  invalidateStampSaveModalLayoutCache,
  loadStampSaveModalLayoutSettings,
  peekStampSaveModalLayoutCache,
  type StampSaveModalLayoutSettings,
} from '../services/stampSaveModalLayoutCache';
import {
  getActiveFieldPlaceholders,
  type FieldPlaceholders,
} from '../services/stampFieldTemplates';
import { fieldLabelsFromStamp } from '../services/fieldLabels';
import { prepareStampPreviewThumb, normalizeDisplayUri, type CaptureStampForExport } from '../services/exportStampImage';
import { saveStamp, updateStamp } from '../services/saveStamp';
import { listKnownStampGroupFolders } from '../services/stampFolderService';
import { moveStampsToTrash } from '../services/stampTrash';
import {
  FLOOR_OPTIONS,
  isFloorAllowedForLabels,
  isSchoolPlaceLabel,
  resolveStampFloor,
} from '../services/stampFloor';
import {
  getFloorDisplayMode,
  getFloorPickerMode,
  getLastFloor,
  inputFontSizeForStampText,
  isGpsPlaceEnabled,
  setLastFloor,
  type FloorDisplayMode,
  type FloorPickerMode,
} from '../services/settingsService';
import type { Stamp } from '../types/stamp';
import type { StampFloor } from '../types/stamp';
import { StampSavePreview } from './StampSavePreview';
import { StampSaveZoomViewer } from './StampSaveZoomViewer';
import { VoiceInputField } from './VoiceInputField';
import { PrivacyBlurModal } from './PrivacyBlurModal';
import { getPrivacyBlurEnabled } from '../services/settingsService';
import { isPrivacyBlurSupported } from '../services/privacyBlurService';

/* STAMP_PREVIEW_ZOOM_BADGE: 스탬프 저장·수정 미리보기 확대/수정 안내. 되돌리: require·wrapper·styles·aria 문구 삭제 */
const zoomEditIcon = require('../../assets/zoom.png');

type SpeechTarget = 'title' | 'memo' | 'place' | 'extra1' | 'extra2' | 'extra3' | null;

type SpeechInsertSlice = { prefix: string; suffix: string };

type TextSelection = { start: number; end: number };

function textWithTrailingGap(text: string): { text: string; selection: TextSelection } {
  if (!text) {
    return { text: '', selection: { start: 0, end: 0 } };
  }
  const withGap = text.endsWith(' ') ? text : `${text} `;
  const pos = withGap.length;
  return { text: withGap, selection: { start: pos, end: pos } };
}

function prepareSpeechTarget(
  text: string,
  selection: TextSelection,
): { text: string; selection: TextSelection } {
  if (selection.start !== selection.end) {
    return { text, selection };
  }
  const atEnd = selection.start >= text.length;
  const untouched = text.length > 0 && selection.start === 0 && selection.end === 0;
  if (untouched || atEnd) {
    return textWithTrailingGap(text);
  }
  return { text, selection };
}

function applyTextSelection(
  selection: TextSelection,
  ref: { current: TextSelection },
  setSelection: (value: TextSelection) => void,
) {
  ref.current = selection;
  setSelection(selection);
  requestAnimationFrame(() => {
    setSelection({ start: selection.start, end: selection.end });
  });
}

function insertSpeechAtCursor(prefix: string, suffix: string, spoken: string): string {
  const trimmed = spoken.trim();
  if (!trimmed) {
    return prefix + suffix;
  }
  if (!prefix && !suffix) {
    return trimmed;
  }
  if (!suffix && prefix.length > 0 && !/\s$/.test(prefix)) {
    return `${prefix} ${trimmed}`;
  }
  return prefix + trimmed + suffix;
}

function speechSliceAtSelection(text: string, start: number, end: number): SpeechInsertSlice {
  const safeStart = Math.max(0, Math.min(start, text.length));
  const safeEnd = Math.max(safeStart, Math.min(end, text.length));
  return {
    prefix: text.slice(0, safeStart),
    suffix: text.slice(safeEnd),
  };
}

function applyStampSaveModalLayoutSettings(
  settings: StampSaveModalLayoutSettings,
  apply: {
    setTitleTextAlign: (value: TextAlign) => void;
    setMemoTextAlign: (value: TextAlign) => void;
    setCameraHand: (value: CameraHand) => void;
    setStampTextLayout: (value: StampTextLayout) => void;
    setStampTextSize: (value: StampTextSize) => void;
    setWatermarkStyle: (value: WatermarkStyle) => void;
    setShowDatetime: (value: boolean) => void;
    setCoordsLabel: (value: CoordsLabelMode) => void;
    setFloorDisplayModeState: (value: FloorDisplayMode) => void;
    setOverlayOrgName: (value: string) => void;
    setOverlayFooterPhrase: (value: string) => void;
    setOverlayShowOrgName: (value: boolean) => void;
    setOverlayShowFooterPhrase: (value: boolean) => void;
    setTitleFieldLabel: (value: string) => void;
    setPlaceFieldLabel: (value: string) => void;
    setMemoFieldLabel: (value: string) => void;
    setExtra1FieldLabel: (value: string) => void;
    setExtra2FieldLabel: (value: string) => void;
    setExtra3FieldLabel: (value: string) => void;
  },
): void {
  apply.setTitleTextAlign(settings.titleTextAlign);
  apply.setMemoTextAlign(settings.memoTextAlign);
  apply.setCameraHand(settings.cameraHand);
  apply.setStampTextLayout(settings.stampTextLayout);
  apply.setStampTextSize(settings.stampTextSize);
  apply.setWatermarkStyle(settings.watermarkStyle);
  apply.setShowDatetime(settings.showDatetime);
  apply.setCoordsLabel(settings.coordsLabel);
  apply.setFloorDisplayModeState(settings.floorDisplayMode);
  apply.setOverlayOrgName(settings.overlayOrgName);
  apply.setOverlayFooterPhrase(settings.overlayFooterPhrase);
  apply.setOverlayShowOrgName(settings.overlayShowOrgName);
  apply.setOverlayShowFooterPhrase(settings.overlayShowFooterPhrase);
  apply.setTitleFieldLabel(settings.titleFieldLabel);
  apply.setPlaceFieldLabel(settings.placeFieldLabel);
  apply.setMemoFieldLabel(settings.memoFieldLabel);
  apply.setExtra1FieldLabel(settings.extra1FieldLabel);
  apply.setExtra2FieldLabel(settings.extra2FieldLabel);
  apply.setExtra3FieldLabel(settings.extra3FieldLabel);
}

type StampSaveModalProps = {
  visible: boolean;
  imageUri: string | null;
  stamp?: Stamp | null;
  captureStampForExport?: CaptureStampForExport;
  prefetchedLocationSnapshot?: LocationSnapshot | null;
  locationPrefetchLoading?: boolean;
  /** 촬영 직후 prefetch가 끝났으면 모달에서 GPS·카카오 전체 조회를 반복하지 않습니다. */
  locationPrefetchFinished?: boolean;
  onClose: () => void;
  onSaved: () => void;
  onTrashed?: (id: string) => void;
};

export function StampSaveModal({
  visible,
  imageUri,
  stamp = null,
  captureStampForExport,
  prefetchedLocationSnapshot = null,
  locationPrefetchLoading = false,
  locationPrefetchFinished = false,
  onClose,
  onSaved,
  onTrashed,
}: StampSaveModalProps) {
  const isEdit = stamp != null;
  const [siteName, setSiteName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [extra1, setExtra1] = useState('');
  const [extra2, setExtra2] = useState('');
  const [extra3, setExtra3] = useState('');
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechTarget, setSpeechTarget] = useState<SpeechTarget>(null);
  const [titleSelection, setTitleSelection] = useState<TextSelection>({ start: 0, end: 0 });
  const [placeSelection, setPlaceSelection] = useState<TextSelection>({ start: 0, end: 0 });
  const [memoSelection, setMemoSelection] = useState<TextSelection>({ start: 0, end: 0 });
  const [extra1Selection, setExtra1Selection] = useState<TextSelection>({ start: 0, end: 0 });
  const [extra2Selection, setExtra2Selection] = useState<TextSelection>({ start: 0, end: 0 });
  const [extra3Selection, setExtra3Selection] = useState<TextSelection>({ start: 0, end: 0 });
  const [titleTextAlign, setTitleTextAlign] = useState<TextAlign>('left');
  const [memoTextAlign, setMemoTextAlign] = useState<TextAlign>('left');
  const [stampTextLayout, setStampTextLayout] = useState<StampTextLayout>('caption');
  const [stampTextSize, setStampTextSize] = useState<StampTextSize>('medium');
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
  const [fieldPlaceholders, setFieldPlaceholders] = useState<FieldPlaceholders>({
    title: '',
    place: '',
    memo: '',
    extra1: '',
    extra2: '',
    extra3: '',
  });
  const [showDatetime, setShowDatetime] = useState(true);
  const [captureCoords, setCaptureCoords] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [floor, setFloor] = useState<StampFloor | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [locationLookupEnabled, setLocationLookupEnabled] = useState(true);
  const [floorPickerMode, setFloorPickerModeState] = useState<FloorPickerMode>('school_only');
  const [floorDisplayMode, setFloorDisplayModeState] = useState<FloorDisplayMode>('suffix');
  const [cameraHand, setCameraHand] = useState<CameraHand>('right');
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [folderPickerVisible, setFolderPickerVisible] = useState(false);
  const [folderOptions, setFolderOptions] = useState<string[]>([]);
  const [folderOptionsLoading, setFolderOptionsLoading] = useState(false);
  const [workingImageUri, setWorkingImageUri] = useState<string | null>(null);
  const [previewThumbUri, setPreviewThumbUri] = useState<string | null>(null);
  const [privacyBlurEnabled, setPrivacyBlurEnabled] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const speechTargetRef = useRef<SpeechTarget>(null);
  const speechInsertRef = useRef<{
    title: SpeechInsertSlice;
    memo: SpeechInsertSlice;
    place: SpeechInsertSlice;
    extra1: SpeechInsertSlice;
    extra2: SpeechInsertSlice;
    extra3: SpeechInsertSlice;
  }>({
    title: { prefix: '', suffix: '' },
    memo: { prefix: '', suffix: '' },
    place: { prefix: '', suffix: '' },
    extra1: { prefix: '', suffix: '' },
    extra2: { prefix: '', suffix: '' },
    extra3: { prefix: '', suffix: '' },
  });
  const titleSelectionRef = useRef({ start: 0, end: 0 });
  const memoSelectionRef = useRef({ start: 0, end: 0 });
  const placeSelectionRef = useRef({ start: 0, end: 0 });
  const extra1SelectionRef = useRef({ start: 0, end: 0 });
  const extra2SelectionRef = useRef({ start: 0, end: 0 });
  const extra3SelectionRef = useRef({ start: 0, end: 0 });
  const titleTouchedRef = useRef(false);
  const placeTouchedRef = useRef(false);
  const siteNameTouchedRef = useRef(false);
  const floorTouchedRef = useRef(false);
  const lastFloorRef = useRef<StampFloor | null>(null);
  const captureCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const originalCameraUriRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const scrollFieldIntoView = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    speechTargetRef.current = speechTarget;
  }, [speechTarget]);

  const handleListeningEnd = useCallback(() => {
    setSpeechTarget(null);
  }, []);

  const { listening, available, start, stop } = useSpeechInput({
    onResult: (text, isFinal) => {
      const target = speechTargetRef.current;
      if (target === 'title') {
        const { prefix, suffix } = speechInsertRef.current.title;
        const merged = insertSpeechAtCursor(prefix, suffix, text);
        if (isFinal) {
          const { text: withGap, selection } = textWithTrailingGap(merged);
          setTitle(withGap);
          applyTextSelection(selection, titleSelectionRef, setTitleSelection);
        } else {
          setTitle(merged);
        }
      } else if (target === 'memo') {
        const { prefix, suffix } = speechInsertRef.current.memo;
        const merged = insertSpeechAtCursor(prefix, suffix, text);
        if (isFinal) {
          const { text: withGap, selection } = textWithTrailingGap(merged);
          setMemo(withGap);
          applyTextSelection(selection, memoSelectionRef, setMemoSelection);
        } else {
          setMemo(merged);
        }
      } else if (target === 'place') {
        const { prefix, suffix } = speechInsertRef.current.place;
        const merged = insertSpeechAtCursor(prefix, suffix, text);
        placeTouchedRef.current = true;
        if (isFinal) {
          const { text: withGap, selection } = textWithTrailingGap(merged);
          setPlaceLabel(withGap.trim() ? withGap : null);
          applyTextSelection(selection, placeSelectionRef, setPlaceSelection);
        } else {
          setPlaceLabel(merged.trim() ? merged : null);
        }
      } else if (target === 'extra1') {
        const { prefix, suffix } = speechInsertRef.current.extra1;
        const merged = insertSpeechAtCursor(prefix, suffix, text);
        if (isFinal) {
          const { text: withGap, selection } = textWithTrailingGap(merged);
          setExtra1(withGap);
          applyTextSelection(selection, extra1SelectionRef, setExtra1Selection);
        } else {
          setExtra1(merged);
        }
      } else if (target === 'extra2') {
        const { prefix, suffix } = speechInsertRef.current.extra2;
        const merged = insertSpeechAtCursor(prefix, suffix, text);
        if (isFinal) {
          const { text: withGap, selection } = textWithTrailingGap(merged);
          setExtra2(withGap);
          applyTextSelection(selection, extra2SelectionRef, setExtra2Selection);
        } else {
          setExtra2(merged);
        }
      } else if (target === 'extra3') {
        const { prefix, suffix } = speechInsertRef.current.extra3;
        const merged = insertSpeechAtCursor(prefix, suffix, text);
        if (isFinal) {
          const { text: withGap, selection } = textWithTrailingGap(merged);
          setExtra3(withGap);
          applyTextSelection(selection, extra3SelectionRef, setExtra3Selection);
        } else {
          setExtra3(merged);
        }
      }
      if (isFinal) {
        setSpeechTarget(null);
      }
    },
    onListeningEnd: handleListeningEnd,
  });

  const stopRef = useRef(stop);
  stopRef.current = stop;

  useLayoutEffect(() => {
    if (!visible) {
      return;
    }

    const apply = {
      setTitleTextAlign,
      setMemoTextAlign,
      setCameraHand,
      setStampTextLayout,
      setStampTextSize,
      setWatermarkStyle,
      setShowDatetime,
      setCoordsLabel,
      setFloorDisplayModeState,
      setOverlayOrgName,
      setOverlayFooterPhrase,
      setOverlayShowOrgName,
      setOverlayShowFooterPhrase,
      setTitleFieldLabel,
      setPlaceFieldLabel,
      setMemoFieldLabel,
      setExtra1FieldLabel,
      setExtra2FieldLabel,
      setExtra3FieldLabel,
    };

    const cached = peekStampSaveModalLayoutCache();
    if (cached) {
      applyStampSaveModalLayoutSettings(cached, apply);
    }
    if (!stamp) {
      setFieldPlaceholders(getActiveFieldPlaceholders());
    }

    let cancelled = false;
    void loadStampSaveModalLayoutSettings().then((settings) => {
      if (cancelled) {
        return;
      }
      applyStampSaveModalLayoutSettings(settings, apply);
      if (stamp) {
        const snap = fieldLabelsFromStamp(stamp);
        setTitleFieldLabel(snap.titleFieldLabel);
        setPlaceFieldLabel(snap.placeFieldLabel);
        setMemoFieldLabel(snap.memoFieldLabel);
        setExtra1FieldLabel(snap.extra1FieldLabel);
        setExtra2FieldLabel(snap.extra2FieldLabel);
        setExtra3FieldLabel(snap.extra3FieldLabel);
        setFieldPlaceholders({
          title: '',
          place: '',
          memo: '',
          extra1: '',
          extra2: '',
          extra3: '',
        });
      } else {
        setFieldPlaceholders(getActiveFieldPlaceholders());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [visible, stamp?.id]);

  useEffect(() => {
    if (visible) {
      return;
    }
    setSiteName('');
    setGroupName('');
    setTitle('');
    setMemo('');
    setExtra1('');
    setExtra2('');
    setExtra3('');
    setSaving(false);
    setLocationLoading(false);
    setError(null);
    setSpeechTarget(null);
    setTitleSelection({ start: 0, end: 0 });
    setPlaceSelection({ start: 0, end: 0 });
    setMemoSelection({ start: 0, end: 0 });
    setExtra1Selection({ start: 0, end: 0 });
    setExtra2Selection({ start: 0, end: 0 });
    setExtra3Selection({ start: 0, end: 0 });
    titleSelectionRef.current = { start: 0, end: 0 };
    placeSelectionRef.current = { start: 0, end: 0 };
    memoSelectionRef.current = { start: 0, end: 0 };
    extra1SelectionRef.current = { start: 0, end: 0 };
    extra2SelectionRef.current = { start: 0, end: 0 };
    extra3SelectionRef.current = { start: 0, end: 0 };
    setImageViewerVisible(false);
    setFolderPickerVisible(false);
    setFolderOptions([]);
    setFolderOptionsLoading(false);
    setDeleting(false);
    titleTouchedRef.current = false;
    placeTouchedRef.current = false;
    siteNameTouchedRef.current = false;
    floorTouchedRef.current = false;
    lastFloorRef.current = null;
    captureCoordsRef.current = null;
    originalCameraUriRef.current = null;
    setWorkingImageUri(null);
    setPreviewThumbUri(null);
    setPrivacyModalOpen(false);
    setCaptureCoords(null);
    setFloor(null);
    setPlaceLabel(null);
    stopRef.current();
  }, [visible]);

  useEffect(() => {
    if (!visible || !stamp) {
      return;
    }
    setTitle(stamp.title);
    setMemo(stamp.memo);
    setExtra1(stamp.extra1 ?? '');
    setExtra2(stamp.extra2 ?? '');
    setExtra3(stamp.extra3 ?? '');
    setFloor(stamp.floor ?? null);
    setPlaceLabel(stamp.placeLabel ?? null);
    setGroupName(extractStampGroupFromImagePath(stamp.imagePath) ?? '');
    const snap = fieldLabelsFromStamp(stamp);
    setTitleFieldLabel(snap.titleFieldLabel);
    setPlaceFieldLabel(snap.placeFieldLabel);
    setMemoFieldLabel(snap.memoFieldLabel);
    setExtra1FieldLabel(snap.extra1FieldLabel);
    setExtra2FieldLabel(snap.extra2FieldLabel);
    setExtra3FieldLabel(snap.extra3FieldLabel);
    titleTouchedRef.current = true;
    placeTouchedRef.current = true;
    floorTouchedRef.current = Boolean(stamp.floor);
  }, [visible, stamp?.id]);

  useEffect(() => {
    if (!visible || !imageUri) {
      return;
    }
    setWorkingImageUri(imageUri);
    if (!isEdit) {
      originalCameraUriRef.current = imageUri;
    }
  }, [visible, imageUri, isEdit]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    void getPrivacyBlurEnabled().then((enabled) => {
      if (!cancelled) {
        setPrivacyBlurEnabled(enabled);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const sourceUri = workingImageUri ?? imageUri;
    if (!sourceUri) {
      setPreviewThumbUri(null);
      return;
    }

    let cancelled = false;
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      if (cancelled) {
        return;
      }
      prepareStampPreviewThumb(sourceUri)
        .then((uri) => {
          if (!cancelled) {
            setPreviewThumbUri(uri);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setPreviewThumbUri(normalizeDisplayUri(sourceUri));
          }
        });
    });

    return () => {
      cancelled = true;
      interactionTask.cancel();
    };
  }, [visible, workingImageUri, imageUri]);

  useEffect(() => {
    if (!visible || isEdit || !prefetchedLocationSnapshot) {
      return;
    }
    if (!placeTouchedRef.current) {
      setPlaceLabel(prefetchedLocationSnapshot.placeLabel);
    }
    const coords = {
      latitude: prefetchedLocationSnapshot.latitude,
      longitude: prefetchedLocationSnapshot.longitude,
    };
    captureCoordsRef.current = coords;
    setCaptureCoords(coords);
  }, [visible, isEdit, prefetchedLocationSnapshot]);

  useEffect(() => {
    if (!visible || isEdit || !imageUri) {
      return;
    }

    let cancelled = false;
    const capturedAt = Date.now();

    if (!titleTouchedRef.current) {
      setTitle(formatDefaultStampTitle(capturedAt));
    }

    if (!siteNameTouchedRef.current) {
      setSiteName(formatStampGroupName(capturedAt));
    }

    const applySnapshot = (snapshot: LocationSnapshot | null) => {
      if (!snapshot) {
        return;
      }
      // 빈 장소명으로 이미 채워진 값을 지우지 않음(재조회 실패 시 보호)
      if (!placeTouchedRef.current && snapshot.placeLabel?.trim()) {
        setPlaceLabel(snapshot.placeLabel);
      }
      const coords = {
        latitude: snapshot.latitude,
        longitude: snapshot.longitude,
      };
      captureCoordsRef.current = coords;
      setCaptureCoords(coords);
    };

    const loadSiteSettings = async () => {
      const [savedSiteName, pickerMode, lastFloor] = await Promise.all([
        getCurrentSiteName(),
        getFloorPickerMode(),
        getLastFloor(),
      ]);
      if (cancelled) {
        return;
      }
      setFloorPickerModeState(pickerMode);
      lastFloorRef.current = lastFloor;
      // always만 즉시 적용. school_only는 장소 확정 후 useEffect에서 적용(비학교 lastFloor 오염 방지)
      if (!floorTouchedRef.current && lastFloor && pickerMode === 'always') {
        setFloor(lastFloor);
      }
      if (!siteNameTouchedRef.current) {
        setSiteName(savedSiteName ? refreshStampGroupDate(savedSiteName, capturedAt) : formatStampGroupName(capturedAt));
      }
    };

    const applyQuickLocationCache = async () => {
      const fast = await getFastLocationSnapshot();
      if (cancelled || !fast) {
        return;
      }
      if (!placeTouchedRef.current && fast.placeLabel) {
        setPlaceLabel(fast.placeLabel);
      }
      if (!captureCoordsRef.current) {
        const coords = {
          latitude: fast.latitude,
          longitude: fast.longitude,
        };
        captureCoordsRef.current = coords;
        setCaptureCoords(coords);
      }
    };

    const fetchLocationFallback = async () => {
      setLocationLoading(true);
      try {
        await applyQuickLocationCache();

        const snapshot = await getCurrentLocationSnapshot();
        if (cancelled) {
          return;
        }
        applySnapshot(snapshot);
        if (!titleTouchedRef.current && !snapshot) {
          setTitle(formatDefaultStampTitle(capturedAt));
        }
      } catch {
        // 날짜·시간 제목은 이미 설정됨; 저장 폴더는 current_site_name 유지
      } finally {
        if (!cancelled) {
          setLocationLoading(false);
        }
      }
    };

    void loadSiteSettings();

    void (async () => {
      const gpsEnabled = await isGpsPlaceEnabled();
      if (cancelled) {
        return;
      }
      // 층 칩·로딩: GPS 장소 조회(사용/사용 안 함 모두). 카카오는 locationService에서만 분기.
      setLocationLookupEnabled(gpsEnabled);
      if (!gpsEnabled) {
        setLocationLoading(false);
        return;
      }

      if (prefetchedLocationSnapshot) {
        applySnapshot(prefetchedLocationSnapshot);
        // 장소명이 이미 있으면 중복 조회 생략. 좌표만 있거나 장소명이 비면 한 번 더 조회.
        if (prefetchedLocationSnapshot.placeLabel?.trim()) {
          setLocationLoading(false);
          return;
        }
        setLocationLoading(true);
        void (async () => {
          try {
            const refined = await getCurrentLocationSnapshot();
            if (cancelled) {
              return;
            }
            if (refined) {
              applySnapshot(refined);
            } else {
              await applyQuickLocationCache();
            }
          } catch {
            // 프리페치 좌표는 유지
          } finally {
            if (!cancelled) {
              setLocationLoading(false);
            }
          }
        })();
        return;
      }

      if (locationPrefetchLoading) {
        setLocationLoading(true);
        void applyQuickLocationCache();
        return;
      }

      if (locationPrefetchFinished) {
        // 프리페치가 장소명 없이 끝난 경우 전체 조회로 보완
        void fetchLocationFallback();
        return;
      }

      void fetchLocationFallback();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    visible,
    imageUri,
    isEdit,
    prefetchedLocationSnapshot,
    locationPrefetchLoading,
    locationPrefetchFinished,
  ]);

  useEffect(() => {
    if (!visible || !isEdit) {
      return;
    }
    let cancelled = false;
    (async () => {
      const pickerMode = await getFloorPickerMode();
      if (!cancelled) {
        setFloorPickerModeState(pickerMode);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, isEdit]);

  // school_only: 장소·폴더가 학교일 때만 lastFloor 적용, 아니면 층 제거
  useEffect(() => {
    if (!visible || isEdit || floorTouchedRef.current) {
      return;
    }
    if (floorPickerMode === 'off') {
      setFloor(null);
      return;
    }
    if (floorPickerMode === 'always') {
      if (lastFloorRef.current) {
        setFloor(lastFloorRef.current);
      }
      return;
    }
    const allowed = isFloorAllowedForLabels(
      'school_only',
      placeLabel,
      siteName,
      groupName,
    );
    if (allowed) {
      if (lastFloorRef.current) {
        setFloor(lastFloorRef.current);
      }
    } else {
      setFloor(null);
    }
  }, [visible, isEdit, floorPickerMode, placeLabel, siteName, groupName]);

  const handleMicPress = async (target: SpeechTarget) => {
    if (listening && speechTarget === target) {
      stop();
      setSpeechTarget(null);
      return;
    }

    if (listening) {
      stop();
    }

    if (target === 'title') {
      titleTouchedRef.current = true;
      const { text: prepared, selection } = prepareSpeechTarget(title, titleSelectionRef.current);
      setTitle(prepared);
      applyTextSelection(selection, titleSelectionRef, setTitleSelection);
      speechInsertRef.current.title = speechSliceAtSelection(
        prepared,
        selection.start,
        selection.end,
      );
    } else if (target === 'memo') {
      const { text: prepared, selection } = prepareSpeechTarget(memo, memoSelectionRef.current);
      setMemo(prepared);
      applyTextSelection(selection, memoSelectionRef, setMemoSelection);
      speechInsertRef.current.memo = speechSliceAtSelection(
        prepared,
        selection.start,
        selection.end,
      );
    } else if (target === 'place') {
      placeTouchedRef.current = true;
      const placeText = placeLabel ?? '';
      const { text: prepared, selection } = prepareSpeechTarget(placeText, placeSelectionRef.current);
      setPlaceLabel(prepared.trim() ? prepared : null);
      applyTextSelection(selection, placeSelectionRef, setPlaceSelection);
      speechInsertRef.current.place = speechSliceAtSelection(
        prepared,
        selection.start,
        selection.end,
      );
    } else if (target === 'extra1') {
      const { text: prepared, selection } = prepareSpeechTarget(extra1, extra1SelectionRef.current);
      setExtra1(prepared);
      applyTextSelection(selection, extra1SelectionRef, setExtra1Selection);
      speechInsertRef.current.extra1 = speechSliceAtSelection(
        prepared,
        selection.start,
        selection.end,
      );
    } else if (target === 'extra2') {
      const { text: prepared, selection } = prepareSpeechTarget(extra2, extra2SelectionRef.current);
      setExtra2(prepared);
      applyTextSelection(selection, extra2SelectionRef, setExtra2Selection);
      speechInsertRef.current.extra2 = speechSliceAtSelection(
        prepared,
        selection.start,
        selection.end,
      );
    } else if (target === 'extra3') {
      const { text: prepared, selection } = prepareSpeechTarget(extra3, extra3SelectionRef.current);
      setExtra3(prepared);
      applyTextSelection(selection, extra3SelectionRef, setExtra3Selection);
      speechInsertRef.current.extra3 = speechSliceAtSelection(
        prepared,
        selection.start,
        selection.end,
      );
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
      if (onTrashed) {
        onTrashed(stamp.id);
      } else {
        onSaved();
      }
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
    void (async () => {
      if (saving || deleting) {
        return;
      }

      if (isEdit && stamp) {
        const confirmed = await confirmAlert(
          '휴지통으로 이동',
          '이 스탬프를 휴지통으로 옮깁니다.',
          { confirmText: '삭제', destructive: true },
        );
        if (confirmed) {
          void confirmTrashDelete();
        }
        return;
      }

      const confirmed = await confirmAlert('사진 버리기', '저장하지 않은 사진을 버립니다.', {
        confirmText: '버리기',
        destructive: true,
      });
      if (confirmed) {
        setImageViewerVisible(false);
        onClose();
      }
    })();
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

  const handleCloseViewer = () => {
    setImageViewerVisible(false);
  };

  const persistFieldLabel = useCallback(
    async (
      field: 'title' | 'place' | 'memo' | 'extra1' | 'extra2' | 'extra3',
      nextLabel: string,
    ) => {
      try {
        if (field === 'title') {
          const safe = await writeTitleFieldLabel(nextLabel);
          setTitleFieldLabel(safe);
        } else if (field === 'place') {
          const safe = await writePlaceFieldLabel(nextLabel);
          setPlaceFieldLabel(safe);
        } else if (field === 'memo') {
          const safe = await writeMemoFieldLabel(nextLabel);
          setMemoFieldLabel(safe);
        } else if (field === 'extra1') {
          const safe = await writeExtra1FieldLabel(nextLabel);
          setExtra1FieldLabel(safe);
        } else if (field === 'extra2') {
          const safe = await writeExtra2FieldLabel(nextLabel);
          setExtra2FieldLabel(safe);
        } else {
          const safe = await writeExtra3FieldLabel(nextLabel);
          setExtra3FieldLabel(safe);
        }
        invalidateStampSaveModalLayoutCache();
      } catch (err) {
        setError(err instanceof Error ? err.message : '표시명 저장에 실패했습니다.');
      }
    },
    [],
  );

  const handleOpenViewer = () => {
    const source = workingImageUri ?? imageUri;
    if (!source || saving) {
      return;
    }
    // View-only zoom: do not re-encode / crop (Apply disabled).
    setImageViewerVisible(true);
  };

  const handleSave = async () => {
    const photoUri = workingImageUri ?? imageUri;
    if (!photoUri || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const folderLabel = isEdit ? groupName : siteName;
      const effectiveFloor = resolveStampFloor(
        floorPickerMode,
        floor,
        placeLabel,
        folderLabel,
      );
      if (isEdit && stamp) {
        const croppedImageUri = photoUri !== imageUri ? photoUri : undefined;
        await updateStamp({
          id: stamp.id,
          title,
          memo,
          extra1,
          extra2,
          extra3,
          groupName,
          floor: effectiveFloor,
          placeLabel,
          croppedImageUri,
          captureForExport: captureStampForExport,
          fieldLabels: {
            titleFieldLabel,
            placeFieldLabel,
            memoFieldLabel,
            extra1FieldLabel,
            extra2FieldLabel,
            extra3FieldLabel,
          },
        });
      } else {
        await setCurrentSiteName(siteName);
        if (effectiveFloor) {
          await setLastFloor(effectiveFloor);
        }
        const originalTempUri =
          originalCameraUriRef.current && photoUri !== originalCameraUriRef.current
            ? originalCameraUriRef.current
            : undefined;
        await saveStamp({
          tempImageUri: photoUri,
          originalTempUri,
          title,
          memo,
          extra1,
          extra2,
          extra3,
          groupName: siteName,
          latitude: captureCoordsRef.current?.latitude ?? null,
          longitude: captureCoordsRef.current?.longitude ?? null,
          floor: effectiveFloor,
          placeLabel,
          captureForExport: captureStampForExport,
          fieldLabels: {
            titleFieldLabel,
            placeFieldLabel,
            memoFieldLabel,
            extra1FieldLabel,
            extra2FieldLabel,
            extra3FieldLabel,
          },
        });
        if (placeLabel?.trim()) {
          await setLastPlaceLabel(placeLabel);
        }
        const coords = captureCoordsRef.current;
        if (coords && placeLabel) {
          await setLastCapturePlaceCache({
            latitude: coords.latitude,
            longitude: coords.longitude,
            placeLabel,
          });
        }
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

  const photoUri = workingImageUri ?? imageUri;
  const handleFloorChipPress = useCallback(
    (value: StampFloor | null) => {
      floorTouchedRef.current = true;
      setFloor(value);
      if (floorDisplayMode !== 'cursor' || !value) {
        return;
      }
      const placeText = placeLabel ?? '';
      const { prefix, suffix } = speechSliceAtSelection(
        placeText,
        placeSelectionRef.current.start,
        placeSelectionRef.current.end,
      );
      placeTouchedRef.current = true;
      const merged = insertSpeechAtCursor(prefix, suffix, `${value}층`);
      setPlaceLabel(merged.trim() ? merged : null);
    },
    [floorDisplayMode, placeLabel],
  );

  const showFloorPicker =
    (locationLookupEnabled &&
      floorPickerMode !== 'off' &&
      (floorPickerMode === 'always' ||
        isSchoolPlaceLabel(placeLabel) ||
        isSchoolPlaceLabel(siteName) ||
        isSchoolPlaceLabel(groupName) ||
        Boolean(isEdit && stamp?.floor))) ||
    Boolean(isEdit && stamp?.floor);

  return (
    <>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        <View style={styles.sheet}>
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            style={styles.scroll}
            bounces={false}
          >
            <View style={styles.card}>
            <Text style={styles.heading}>{isEdit ? '스탬프 수정' : '스탬프 저장'}</Text>

            {photoUri ? (
              <Pressable
                onPress={handleOpenViewer}
                disabled={saving}
                accessibilityLabel="사진 크게 보기"
                accessibilityHint="탭하면 확대 화면이 열립니다. 자르기는 지원하지 않습니다."
              >
                <View style={styles.previewWrap}>
                  <StampSavePreview
                    imageUri={previewThumbUri ?? normalizeDisplayUri(photoUri)}
                    imageLoading={false}
                    title={title}
                    memo={memo}
                    extra1={extra1}
                    extra2={extra2}
                    extra3={extra3}
                    placeLabel={placeLabel}
                    titleAlign={titleTextAlign}
                    memoAlign={memoTextAlign}
                    textLayout={stampTextLayout}
                    stampTextSize={stampTextSize}
                    watermarkStyle={watermarkStyle}
                    coordsLabel={coordsLabel}
                    showDatetime={showDatetime}
                    orgName={overlayOrgName}
                    footerPhrase={overlayFooterPhrase}
                    showOrgName={overlayShowOrgName}
                    showFooterPhrase={overlayShowFooterPhrase}
                    titleFieldLabel={titleFieldLabel}
                    placeFieldLabel={placeFieldLabel}
                    memoFieldLabel={memoFieldLabel}
                    extra1FieldLabel={extra1FieldLabel}
                    extra2FieldLabel={extra2FieldLabel}
                    extra3FieldLabel={extra3FieldLabel}
                    floor={floor}
                    latitude={isEdit && stamp ? stamp.latitude : captureCoords?.latitude}
                    longitude={isEdit && stamp ? stamp.longitude : captureCoords?.longitude}
                    variant="thumbnail"
                  />
                  <Image
                      source={zoomEditIcon}
                      style={[
                        styles.zoomEditBadge,
                        cameraHand === 'left' ? styles.zoomEditBadgeLeft : styles.zoomEditBadgeRight,
                      ]}
                      resizeMode="contain"
                      pointerEvents="none"
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                    />
                </View>
              </Pressable>
            ) : null}

            {photoUri && privacyBlurEnabled && isPrivacyBlurSupported() ? (
              <Pressable
                style={[styles.privacyBlurBtn, saving ? { opacity: 0.5 } : null]}
                onPress={() => setPrivacyModalOpen(true)}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="개인정보 가리기"
              >
                <Text style={styles.privacyBlurBtnText}>개인정보 가리기</Text>
              </Pressable>
            ) : null}

            {!isEdit ? (
              <View style={styles.siteField}>
                <Text style={styles.siteLabel}>저장 폴더(앨범)</Text>
                <View style={styles.folderInputRow}>
                  {cameraHand === 'left' ? (
                    <Pressable style={styles.folderPickButton} onPress={() => void openFolderPicker()}>
                      <Text style={styles.folderPickButtonText}>선택</Text>
                    </Pressable>
                  ) : null}
                  <TextInput
                    style={styles.folderInput}
                    value={siteName}
                    onChangeText={(text) => {
                      siteNameTouchedRef.current = true;
                      setSiteName(text);
                    }}
                    placeholder="예: 20260609_역삼동 (비우면 기본)"
                    onFocus={scrollFieldIntoView}
                    maxLength={80}
                  />
                  {cameraHand === 'right' ? (
                    <Pressable style={styles.folderPickButton} onPress={() => void openFolderPicker()}>
                      <Text style={styles.folderPickButtonText}>선택</Text>
                    </Pressable>
                  ) : null}
                </View>
                {locationLookupEnabled && locationLoading ? (
                  <Text style={styles.locationHint}>위치 확인 중…</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.siteField}>
                <Text style={styles.siteLabel}>저장 폴더(앨범)</Text>
                <View style={styles.folderInputRow}>
                  {cameraHand === 'left' ? (
                    <Pressable style={styles.folderPickButton} onPress={() => void openFolderPicker()}>
                      <Text style={styles.folderPickButtonText}>선택</Text>
                    </Pressable>
                  ) : null}
                  <TextInput
                    style={styles.folderInput}
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="예: 20260608_OO초 (비우면 기본)"
                    onFocus={scrollFieldIntoView}
                    maxLength={80}
                  />
                  {cameraHand === 'right' ? (
                    <Pressable style={styles.folderPickButton} onPress={() => void openFolderPicker()}>
                      <Text style={styles.folderPickButtonText}>선택</Text>
                    </Pressable>
                  ) : null}
                </View>
                <Text style={styles.locationHint}>
                  선택한 스탬프만 이동합니다. 앱 폴더와 갤러리 앨범이 함께 변경됩니다.
                </Text>
              </View>
            )}

            <View>
              <VoiceInputField
                label={titleFieldLabel}
                labelEditable
                onLabelCommit={(next) => void persistFieldLabel('title', next)}
                value={title}
                onChangeText={(text) => {
                  titleTouchedRef.current = true;
                  setTitle(text);
                }}
                onMicPress={() => handleMicPress('title')}
                listening={listening && speechTarget === 'title'}
                speechAvailable={available}
                onFocus={scrollFieldIntoView}
                selection={titleSelection}
                onSelectionChange={(selection) => {
                  titleSelectionRef.current = selection;
                  setTitleSelection(selection);
                }}
                textAlign={titleTextAlign}
                cameraHand={cameraHand}
                fontSize={inputFontSizeForStampText(stampTextSize)}
                placeholderHint={fieldPlaceholders.title}
              />
            </View>

            <VoiceInputField
              label={placeFieldLabel}
              labelEditable
              onLabelCommit={(next) => void persistFieldLabel('place', next)}
              value={placeLabel ?? ''}
              onChangeText={(text) => {
                placeTouchedRef.current = true;
                setPlaceLabel(text.trim() ? text : null);
              }}
              onMicPress={() => handleMicPress('place')}
              listening={listening && speechTarget === 'place'}
              speechAvailable={available}
              onFocus={scrollFieldIntoView}
              selection={placeSelection}
              onSelectionChange={(selection) => {
                placeSelectionRef.current = selection;
                setPlaceSelection(selection);
              }}
              textAlign="left"
              cameraHand={cameraHand}
              fontSize={inputFontSizeForStampText(stampTextSize)}
              placeholderHint={fieldPlaceholders.place}
            />

            {showFloorPicker ? (
              <View style={styles.siteField}>
                <Text style={styles.siteLabel}>층</Text>
                <View style={styles.floorRow}>
                  {FLOOR_OPTIONS.map((option) => {
                    const selected = floor === option.value;
                    return (
                      <Pressable
                        key={option.label}
                        style={[styles.floorChip, selected && styles.floorChipSelected]}
                        onPress={() => handleFloorChipPress(option.value)}
                      >
                        <Text
                          style={[styles.floorChipText, selected && styles.floorChipTextSelected]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <VoiceInputField
              label={extra1FieldLabel}
              labelEditable
              onLabelCommit={(next) => void persistFieldLabel('extra1', next)}
              value={extra1}
              onChangeText={setExtra1}
              onMicPress={() => handleMicPress('extra1')}
              listening={listening && speechTarget === 'extra1'}
              speechAvailable={available}
              onFocus={scrollFieldIntoView}
              selection={extra1Selection}
              onSelectionChange={(selection) => {
                extra1SelectionRef.current = selection;
                setExtra1Selection(selection);
              }}
              textAlign={titleTextAlign}
              cameraHand={cameraHand}
              fontSize={inputFontSizeForStampText(stampTextSize)}
              placeholderHint={fieldPlaceholders.extra1}
            />

            <VoiceInputField
              label={extra2FieldLabel}
              labelEditable
              onLabelCommit={(next) => void persistFieldLabel('extra2', next)}
              value={extra2}
              onChangeText={setExtra2}
              onMicPress={() => handleMicPress('extra2')}
              listening={listening && speechTarget === 'extra2'}
              speechAvailable={available}
              onFocus={scrollFieldIntoView}
              selection={extra2Selection}
              onSelectionChange={(selection) => {
                extra2SelectionRef.current = selection;
                setExtra2Selection(selection);
              }}
              textAlign={titleTextAlign}
              cameraHand={cameraHand}
              fontSize={inputFontSizeForStampText(stampTextSize)}
              placeholderHint={fieldPlaceholders.extra2}
            />

            <VoiceInputField
              label={extra3FieldLabel}
              labelEditable
              onLabelCommit={(next) => void persistFieldLabel('extra3', next)}
              value={extra3}
              onChangeText={setExtra3}
              onMicPress={() => handleMicPress('extra3')}
              listening={listening && speechTarget === 'extra3'}
              speechAvailable={available}
              onFocus={scrollFieldIntoView}
              selection={extra3Selection}
              onSelectionChange={(selection) => {
                extra3SelectionRef.current = selection;
                setExtra3Selection(selection);
              }}
              textAlign={titleTextAlign}
              cameraHand={cameraHand}
              fontSize={inputFontSizeForStampText(stampTextSize)}
              placeholderHint={fieldPlaceholders.extra3}
            />

            <VoiceInputField
              label={memoFieldLabel}
              labelEditable
              onLabelCommit={(next) => void persistFieldLabel('memo', next)}
              value={memo}
              onChangeText={setMemo}
              onMicPress={() => handleMicPress('memo')}
              listening={listening && speechTarget === 'memo'}
              speechAvailable={available}
              multiline
              onFocus={scrollFieldIntoView}
              selection={memoSelection}
              onSelectionChange={(selection) => {
                memoSelectionRef.current = selection;
                setMemoSelection(selection);
              }}
              textAlign={memoTextAlign}
              cameraHand={cameraHand}
              fontSize={inputFontSizeForStampText(stampTextSize)}
              placeholderHint={fieldPlaceholders.memo}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          </ScrollView>
          <View style={styles.actionsFooter}>
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
        </View>
      </KeyboardAvoidingView>
    </Modal>

    <Modal
      visible={imageViewerVisible && (workingImageUri ?? imageUri) != null}
      transparent
      animationType="fade"
      onRequestClose={handleCloseViewer}
    >
      <GestureHandlerRootView style={styles.imageViewerRoot}>
        <View style={styles.imageViewerOverlay}>
          {workingImageUri ?? imageUri ? (
            <View style={styles.imageViewerContent}>
              <StampSaveZoomViewer
                imageUri={workingImageUri ?? imageUri!}
              />
            </View>
          ) : null}
          {/* VIEWER_ACTION_HAND: 닫기를 카메라 손잡이 쪽 하단(사진버리기 위)에 배치. 자르기 적용은 비활성(A). */}
          <View
            style={[
              styles.imageViewerActionBar,
              cameraHand === 'left'
                ? styles.imageViewerActionBarLeft
                : styles.imageViewerActionBarRight,
            ]}
          >
            <Pressable
              style={styles.imageViewerCloseButton}
              onPress={handleCloseViewer}
              accessibilityLabel="저장 화면으로 돌아가기"
            >
              <Text style={styles.imageViewerCloseText}>닫기</Text>
            </Pressable>
          </View>
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
      </GestureHandlerRootView>
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
                    if (isEdit) {
                      setGroupName(item);
                    } else {
                      siteNameTouchedRef.current = true;
                      setSiteName(item);
                    }
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

    <PrivacyBlurModal
      visible={privacyModalOpen}
      imageUri={photoUri}
      onClose={() => setPrivacyModalOpen(false)}
      onApplied={(blurredUri) => {
        setWorkingImageUri(blurredUri);
        setPrivacyModalOpen(false);
      }}
    />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 14,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  /* STAMP_PREVIEW_ZOOM_BADGE — 손잡이 쪽 상단(왼손=좌, 오른손=우) */
  previewWrap: {
    position: 'relative',
  },
  zoomEditBadge: {
    position: 'absolute',
    top: 8,
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
  },
  zoomEditBadgeLeft: {
    left: 8,
  },
  zoomEditBadgeRight: {
    right: 8,
  },
  privacyBlurBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  privacyBlurBtnText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
  },
  viewerPreparingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
  },
  imageViewerRoot: {
    flex: 1,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageViewerActionBar: {
    position: 'absolute',
    bottom: 108,
    zIndex: 2,
    gap: 8,
  },
  imageViewerActionBarLeft: {
    left: 20,
    alignItems: 'flex-start',
  },
  imageViewerActionBarRight: {
    right: 20,
    alignItems: 'flex-end',
  },
  imageViewerCloseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  imageViewerApplyButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.92)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  imageViewerApplyButtonDisabled: {
    opacity: 0.7,
  },
  imageViewerApplyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  imageViewerCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  imageViewerContent: {
    flex: 1,
    width: '100%',
    paddingTop: 48,
    paddingBottom: 168,
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
  floorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  floorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  floorChipSelected: {
    backgroundColor: '#2563eb',
  },
  floorChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  floorChipTextSelected: {
    color: '#fff',
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
  actionsFooter: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 56 : 20,
    backgroundColor: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
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
