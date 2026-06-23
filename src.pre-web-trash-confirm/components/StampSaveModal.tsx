import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useSpeechInput } from '../hooks/useSpeechInput';
import {
  extractStampGroupFromImagePath,
  formatDefaultStampTitle,
  formatStampGroupName,
  refreshStampGroupDate,
} from '../services/fileService';
import { getCurrentLocationSnapshot, getNearbyCachedPlaceLabel, getQuickLastKnownCoords, type LocationSnapshot } from '../services/locationService';
import {
  getCameraHand,
  getCurrentSiteName,
  getMemoTextAlign,
  getPdfShowDatetime,
  getStampTextLayout,
  getWatermarkStyle,
  getCoordsLabelMode,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getTitleTextAlign,
  setCurrentSiteName,
  setLastCapturePlaceCache,
  type CameraHand,
  type CoordsLabelMode,
  type StampTextLayout,
  type WatermarkStyle,
  type TextAlign,
} from '../services/settingsService';
import { prepareStampPreviewThumb, normalizeDisplayUri, type CaptureStampForExport } from '../services/exportStampImage';
import {
  cropStampImage,
  isStampCropActive,
  type StampCropViewport,
} from '../services/stampImageCrop';
import { saveStamp, updateStamp } from '../services/saveStamp';
import { listKnownStampGroupFolders } from '../services/stampFolderService';
import { moveStampsToTrash } from '../services/stampTrash';
import { FLOOR_OPTIONS, isSchoolPlaceLabel } from '../services/stampFloor';
import {
  getFloorDisplayMode,
  getFloorPickerMode,
  getLastFloor,
  setLastFloor,
  type FloorDisplayMode,
  type FloorPickerMode,
} from '../services/settingsService';
import type { Stamp } from '../types/stamp';
import type { StampFloor } from '../types/stamp';
import { StampSavePreview } from './StampSavePreview';
import { StampSaveZoomViewer } from './StampSaveZoomViewer';
import { VoiceInputField } from './VoiceInputField';

type SpeechTarget = 'title' | 'memo' | null;

type SpeechInsertSlice = { prefix: string; suffix: string };

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

type StampSaveModalProps = {
  visible: boolean;
  imageUri: string | null;
  stamp?: Stamp | null;
  captureStampForExport?: CaptureStampForExport;
  prefetchedLocationSnapshot?: LocationSnapshot | null;
  locationPrefetchLoading?: boolean;
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
  onClose,
  onSaved,
  onTrashed,
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
  const [stampTextLayout, setStampTextLayout] = useState<StampTextLayout>('caption');
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkStyle>('solid_dark');
  const [coordsLabel, setCoordsLabel] = useState<CoordsLabelMode>('off');
  const [overlayOrgName, setOverlayOrgName] = useState('');
  const [overlayFooterPhrase, setOverlayFooterPhrase] = useState('');
  const [overlayShowOrgName, setOverlayShowOrgName] = useState(true);
  const [overlayShowFooterPhrase, setOverlayShowFooterPhrase] = useState(true);
  const [showDatetime, setShowDatetime] = useState(true);
  const [captureCoords, setCaptureCoords] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [floor, setFloor] = useState<StampFloor | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
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
  const [layoutSettingsLoaded, setLayoutSettingsLoaded] = useState(false);
  const [applyingCrop, setApplyingCrop] = useState(false);
  const speechTargetRef = useRef<SpeechTarget>(null);
  const speechInsertRef = useRef<{ title: SpeechInsertSlice; memo: SpeechInsertSlice }>({
    title: { prefix: '', suffix: '' },
    memo: { prefix: '', suffix: '' },
  });
  const titleSelectionRef = useRef({ start: 0, end: 0 });
  const memoSelectionRef = useRef({ start: 0, end: 0 });
  const titleTouchedRef = useRef(false);
  const siteNameTouchedRef = useRef(false);
  const floorTouchedRef = useRef(false);
  const captureCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const cropViewportRef = useRef<StampCropViewport | null>(null);
  const originalCameraUriRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handleCropChange = useCallback((viewport: StampCropViewport) => {
    cropViewportRef.current = viewport;
  }, []);

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
        const { prefix, suffix } = speechInsertRef.current.title;
        setTitle(insertSpeechAtCursor(prefix, suffix, text));
      } else if (target === 'memo') {
        const { prefix, suffix } = speechInsertRef.current.memo;
        setMemo(insertSpeechAtCursor(prefix, suffix, text));
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
    setLayoutSettingsLoaded(false);
    (async () => {
      const [titleAlign, memoAlign, hand, textLayout, wmStyle, datetimeVisible, coordsLabelMode, displayMode, orgName, footerPhrase, showOrgName, showFooterPhrase] =
        await Promise.all([
        getTitleTextAlign(),
        getMemoTextAlign(),
        getCameraHand(),
        getStampTextLayout(),
        getWatermarkStyle(),
        getPdfShowDatetime(),
        getCoordsLabelMode(),
        getFloorDisplayMode(),
        getOverlayOrgName(),
        getOverlayFooterPhrase(),
        getOverlayShowOrgName(),
        getOverlayShowFooterPhrase(),
      ]);
      if (!cancelled) {
        setTitleTextAlign(titleAlign);
        setMemoTextAlign(memoAlign);
        setCameraHand(hand);
        setStampTextLayout(textLayout);
        setWatermarkStyle(wmStyle);
        setShowDatetime(datetimeVisible);
        setCoordsLabel(coordsLabelMode);
        setFloorDisplayModeState(displayMode);
        setOverlayOrgName(orgName);
        setOverlayFooterPhrase(footerPhrase);
        setOverlayShowOrgName(showOrgName);
        setOverlayShowFooterPhrase(showFooterPhrase);
        setLayoutSettingsLoaded(true);
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
      siteNameTouchedRef.current = false;
      floorTouchedRef.current = false;
      captureCoordsRef.current = null;
      cropViewportRef.current = null;
      originalCameraUriRef.current = null;
      setWorkingImageUri(null);
      setPreviewThumbUri(null);
      setLayoutSettingsLoaded(false);
      setApplyingCrop(false);
      setCaptureCoords(null);
      setFloor(null);
      setPlaceLabel(null);
      stop();
    } else if (stamp) {
      setTitle(stamp.title);
      setMemo(stamp.memo);
      setFloor(stamp.floor ?? null);
      setGroupName(extractStampGroupFromImagePath(stamp.imagePath) ?? '');
      titleTouchedRef.current = true;
      floorTouchedRef.current = Boolean(stamp.floor);
    }
  }, [visible, stamp, stop]);

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
    const sourceUri = workingImageUri ?? imageUri;
    if (!sourceUri) {
      setPreviewThumbUri(null);
      return;
    }

    let cancelled = false;
    setPreviewThumbUri(null);

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

    return () => {
      cancelled = true;
    };
  }, [visible, workingImageUri, imageUri]);

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
      setPlaceLabel(snapshot.placeLabel);
      const coords = {
        latitude: snapshot.latitude,
        longitude: snapshot.longitude,
      };
      captureCoordsRef.current = coords;
      setCaptureCoords(coords);
      if (!titleTouchedRef.current) {
        setTitle(formatDefaultStampTitle(capturedAt, snapshot.placeLabel ?? undefined));
      }
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
      if (!floorTouchedRef.current && lastFloor) {
        setFloor(lastFloor);
      }
      if (!siteNameTouchedRef.current) {
        setSiteName(savedSiteName ? refreshStampGroupDate(savedSiteName, capturedAt) : formatStampGroupName(capturedAt));
      }
    };

    const fetchLocationFallback = async () => {
      setLocationLoading(true);
      try {
        const quickCoords = await getQuickLastKnownCoords();
        if (!cancelled && quickCoords && !titleTouchedRef.current) {
          const cachedPlace = await getNearbyCachedPlaceLabel(quickCoords);
          if (cachedPlace) {
            setPlaceLabel(cachedPlace);
            setTitle(formatDefaultStampTitle(capturedAt, cachedPlace));
          }
        }

        const snapshot = await getCurrentLocationSnapshot();
        if (cancelled) {
          return;
        }
        applySnapshot(snapshot);
        if (!titleTouchedRef.current && !snapshot) {
          setTitle(formatDefaultStampTitle(capturedAt));
        }
      } catch {
        // ?좎쭨쨌?쒓컙 ?쒕ぉ? ?대? ?ㅼ젙?? ????대뜑??current_site_name ?좎?
      } finally {
        if (!cancelled) {
          setLocationLoading(false);
        }
      }
    };

    void loadSiteSettings();

    if (prefetchedLocationSnapshot) {
      applySnapshot(prefetchedLocationSnapshot);
      setLocationLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (locationPrefetchLoading) {
      setLocationLoading(true);
      void (async () => {
        const quickCoords = await getQuickLastKnownCoords();
        if (cancelled || !quickCoords || titleTouchedRef.current) {
          return;
        }
        const cachedPlace = await getNearbyCachedPlaceLabel(quickCoords);
        if (cancelled || !cachedPlace) {
          return;
        }
        setPlaceLabel(cachedPlace);
        setTitle(formatDefaultStampTitle(capturedAt, cachedPlace));
      })();
      return () => {
        cancelled = true;
      };
    }

    void fetchLocationFallback();

    return () => {
      cancelled = true;
    };
  }, [visible, imageUri, isEdit, prefetchedLocationSnapshot, locationPrefetchLoading]);

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

  const handleMicPress = async (target: SpeechTarget) => {
    if (listening && speechTarget === target) {
      stop();
      setSpeechTarget(null);
      return;
    }

    if (target === 'title') {
      titleTouchedRef.current = true;
      speechInsertRef.current.title = speechSliceAtSelection(
        title,
        titleSelectionRef.current.start,
        titleSelectionRef.current.end,
      );
    } else if (target === 'memo') {
      speechInsertRef.current.memo = speechSliceAtSelection(
        memo,
        memoSelectionRef.current.start,
        memoSelectionRef.current.end,
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
        Alert.alert('??젣 ?ㅽ뙣', '?ㅽ꺃?꾨? 李얠쓣 ???놁뒿?덈떎.');
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
        '??젣 ?ㅽ뙣',
        err instanceof Error ? err.message : '?????녿뒗 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.',
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
      Alert.alert('?댁??듭쑝濡??대룞', '???ㅽ꺃?꾨? ?댁??듭쑝濡???퉩?덈떎.', [
        { text: '痍⑥냼', style: 'cancel' },
        { text: '??젣', style: 'destructive', onPress: () => void confirmTrashDelete() },
      ]);
      return;
    }

    Alert.alert('?ъ쭊 踰꾨━湲?, '??ν븯吏 ?딆? ?ъ쭊??踰꾨┰?덈떎.', [
      { text: '痍⑥냼', style: 'cancel' },
      {
        text: '踰꾨━湲?,
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

  const handleCloseViewer = () => {
    setImageViewerVisible(false);
  };

  const handleApplyCrop = async () => {
    if (!workingImageUri || applyingCrop || saving) {
      if (!applyingCrop && !saving) {
        handleCloseViewer();
      }
      return;
    }

    setApplyingCrop(true);
    setError(null);
    try {
      const cropState = cropViewportRef.current;
      if (isStampCropActive(cropState)) {
        const croppedUri = await cropStampImage(workingImageUri, cropState);
        setWorkingImageUri(croppedUri);
      }
      cropViewportRef.current = null;
      setImageViewerVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '?ш린 ?곸슜???ㅽ뙣?덉뒿?덈떎.');
    } finally {
      setApplyingCrop(false);
    }
  };

  const handleSave = async () => {
    const photoUri = workingImageUri ?? imageUri;
    if (!photoUri || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit && stamp) {
        const croppedImageUri = photoUri !== imageUri ? photoUri : undefined;
        await updateStamp({
          id: stamp.id,
          title,
          memo,
          groupName,
          floor,
          croppedImageUri,
          captureForExport: captureStampForExport,
        });
      } else {
        await setCurrentSiteName(siteName);
        if (floor) {
          await setLastFloor(floor);
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
          groupName: siteName,
          latitude: captureCoordsRef.current?.latitude ?? null,
          longitude: captureCoordsRef.current?.longitude ?? null,
          floor,
          captureForExport: captureStampForExport,
        });
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
            ? '?섏젙???ㅽ뙣?덉뒿?덈떎.'
            : '??μ뿉 ?ㅽ뙣?덉뒿?덈떎.',
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
      const { prefix, suffix } = speechSliceAtSelection(
        title,
        titleSelectionRef.current.start,
        titleSelectionRef.current.end,
      );
      titleTouchedRef.current = true;
      setTitle(insertSpeechAtCursor(prefix, suffix, `${value}痢?));
    },
    [floorDisplayMode, title],
  );

  const showFloorPicker =
    floorPickerMode !== 'off' &&
    (floorPickerMode === 'always' ||
      isSchoolPlaceLabel(placeLabel) ||
      isSchoolPlaceLabel(siteName) ||
      isSchoolPlaceLabel(groupName) ||
      Boolean(isEdit && stamp?.floor));

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
            <Text style={styles.heading}>{isEdit ? '?ㅽ꺃???섏젙' : '?ㅽ꺃?????}</Text>

            {photoUri ? (
              <Pressable onPress={() => setImageViewerVisible(true)} accessibilityLabel="?ъ쭊 ?꾩껜 蹂닿린">
                <StampSavePreview
                  imageUri={previewThumbUri ?? ''}
                  imageLoading={!layoutSettingsLoaded || !previewThumbUri}
                  title={title}
                  memo={memo}
                  titleAlign={titleTextAlign}
                  memoAlign={memoTextAlign}
                  textLayout={stampTextLayout}
                  watermarkStyle={watermarkStyle}
                  coordsLabel={coordsLabel}
                  showDatetime={showDatetime}
                  orgName={overlayOrgName}
                  footerPhrase={overlayFooterPhrase}
                  showOrgName={overlayShowOrgName}
                  showFooterPhrase={overlayShowFooterPhrase}
                  floor={floor}
                  latitude={isEdit && stamp ? stamp.latitude : captureCoords?.latitude}
                  longitude={isEdit && stamp ? stamp.longitude : captureCoords?.longitude}
                  variant="thumbnail"
                />
              </Pressable>
            ) : null}

            {!isEdit ? (
              <View style={styles.siteField}>
                <Text style={styles.siteLabel}>????대뜑(?⑤쾾)</Text>
                <View style={styles.folderInputRow}>
                  <TextInput
                    style={styles.folderInput}
                    value={siteName}
                    onChangeText={(text) => {
                      siteNameTouchedRef.current = true;
                      setSiteName(text);
                    }}
                    placeholder="?? 20260609_??궪??(鍮꾩슦硫?湲곕낯)"
                    onFocus={scrollFieldIntoView}
                    maxLength={80}
                  />
                  <Pressable style={styles.folderPickButton} onPress={() => void openFolderPicker()}>
                    <Text style={styles.folderPickButtonText}>?좏깮</Text>
                  </Pressable>
                </View>
                {locationLoading ? (
                  <Text style={styles.locationHint}>
                    {placeLabel ? '?댁쟾 ?μ냼 ?쒖떆 쨌 ?꾩튂 ?뺤씤 以묅? : '?꾩튂 ?뺤씤 以묅?}
                  </Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.siteField}>
                <Text style={styles.siteLabel}>????대뜑(?⑤쾾)</Text>
                <View style={styles.folderInputRow}>
                  <TextInput
                    style={styles.folderInput}
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="?? 20260608_OO珥?(鍮꾩슦硫?湲곕낯)"
                    onFocus={scrollFieldIntoView}
                    maxLength={80}
                  />
                  <Pressable style={styles.folderPickButton} onPress={() => void openFolderPicker()}>
                    <Text style={styles.folderPickButtonText}>?좏깮</Text>
                  </Pressable>
                </View>
                <Text style={styles.locationHint}>
                  ?좏깮???ㅽ꺃?꾨쭔 ?대룞?⑸땲?? ???대뜑? 媛ㅻ윭由??⑤쾾???④퍡 蹂寃쎈맗?덈떎.
                </Text>
              </View>
            )}

            {showFloorPicker ? (
              <View style={styles.siteField}>
                <Text style={styles.siteLabel}>痢?/Text>
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

            <View>
              <VoiceInputField
                label="?쒕ぉ"
                value={title}
                onChangeText={(text) => {
                  titleTouchedRef.current = true;
                  setTitle(text);
                }}
                onMicPress={() => handleMicPress('title')}
                listening={listening && speechTarget === 'title'}
                speechAvailable={available}
                onFocus={scrollFieldIntoView}
                onSelectionChange={(selection) => {
                  titleSelectionRef.current = selection;
                }}
                textAlign={titleTextAlign}
                cameraHand={cameraHand}
              />
            </View>

            <VoiceInputField
              label="硫붾え"
              value={memo}
              onChangeText={setMemo}
              onMicPress={() => handleMicPress('memo')}
              listening={listening && speechTarget === 'memo'}
              speechAvailable={available}
              multiline
              onFocus={scrollFieldIntoView}
              onSelectionChange={(selection) => {
                memoSelectionRef.current = selection;
              }}
              textAlign={memoTextAlign}
              cameraHand={cameraHand}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          </ScrollView>
          <View style={styles.actionsFooter}>
            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}>
                <Text style={styles.cancelText}>痍⑥냼</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>{isEdit ? '?섏젙' : '???}</Text>
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
          <View style={styles.imageViewerTopBar}>
            <Pressable
              style={styles.imageViewerCloseButton}
              onPress={handleCloseViewer}
              accessibilityLabel="????붾㈃?쇰줈 ?뚯븘媛湲?
            >
              <Text style={styles.imageViewerCloseText}>?リ린</Text>
            </Pressable>
            <Pressable
              style={[styles.imageViewerApplyButton, applyingCrop && styles.imageViewerApplyButtonDisabled]}
              onPress={() => void handleApplyCrop()}
              disabled={applyingCrop || saving}
              accessibilityLabel="?ш린 ?곸슜"
            >
              {applyingCrop ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.imageViewerApplyText}>?곸슜</Text>
              )}
            </Pressable>
          </View>
          {workingImageUri ?? imageUri ? (
            <View style={styles.imageViewerContent}>
              <StampSaveZoomViewer
                imageUri={workingImageUri ?? imageUri!}
                onCropChange={handleCropChange}
              />
            </View>
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
                  {isEdit ? '?댁??듭쑝濡??대룞' : '?ъ쭊 踰꾨━湲?}
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
          <Text style={styles.folderPickerTitle}>????대뜑 ?좏깮</Text>
          {folderOptionsLoading ? (
            <ActivityIndicator style={styles.folderPickerLoading} color="#2563eb" />
          ) : (
            <FlatList
              data={['', ...folderOptions]}
              keyExtractor={(item) => item || '__default__'}
              style={styles.folderPickerList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.folderPickerEmpty}>??λ맂 ?대뜑媛 ?놁뒿?덈떎. 吏곸젒 ?낅젰??二쇱꽭??</Text>
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
                  <Text style={styles.folderPickerItemText}>{item || '(湲곕낯 ?대뜑)'}</Text>
                </Pressable>
              )}
            />
          )}
          <Pressable style={styles.folderPickerClose} onPress={() => setFolderPickerVisible(false)}>
            <Text style={styles.folderPickerCloseText}>?リ린</Text>
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
  imageViewerRoot: {
    flex: 1,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageViewerTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingTop: 48,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    gap: 8,
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
    paddingTop: 96,
    paddingBottom: 96,
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
