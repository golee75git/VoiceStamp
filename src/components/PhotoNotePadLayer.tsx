import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import {
  PHOTO_NOTE_PAD_BODY_MAX,
  type PhotoNotePadItem,
} from '../services/photoNotePad';
import {
  PHOTO_NOTE_COLOR_OPTIONS,
  photoNoteBackgroundRgba,
  photoNoteColorHex,
  photoNoteColorLabel,
  photoNoteTextSizeLabel,
  photoNoteTextSizePt,
  type PhotoNoteColorKey,
  type PhotoNoteTextSize,
} from '../services/photoNoteStyle';

type PhotoNoteStylePatch = {
  textSize?: PhotoNoteTextSize;
  textColor?: PhotoNoteColorKey;
  bgColor?: PhotoNoteColorKey;
  bgOpacity?: number;
};

type PhotoNotePadLayerProps = {
  items: PhotoNotePadItem[];
  editable?: boolean;
  compact?: boolean;
  boxWidth: number;
  boxHeight: number;
  onMove?: (id: string, nx: number, ny: number) => void;
  onChangeBody?: (id: string, body: string) => void;
  onRemove?: (id: string) => void;
  onDragLock?: (locked: boolean) => void;
  onStyleChange?: (id: string, patch: PhotoNoteStylePatch) => void;
};

const CHIP_LEAD_EDIT = 32;
const CHIP_LEAD_COMPACT = 6;
const CHIP_PAD_Y_EDIT = 6;
const CHIP_PAD_Y_COMPACT = 3;
const CHIP_GRIP_H = 22;

function chipTextRise(compact: boolean, fontSizePt: number): number {
  if (compact) {
    return CHIP_PAD_Y_COMPACT;
  }
  return CHIP_PAD_Y_EDIT + Math.max(0, (CHIP_GRIP_H - fontSizePt) / 2);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function sizeToRatio(size: PhotoNoteTextSize): number {
  if (size === 'small') {
    return 0;
  }
  if (size === 'large') {
    return 1;
  }
  return 0.5;
}

function ratioToSize(ratio: number): PhotoNoteTextSize {
  if (ratio < 1 / 3) {
    return 'small';
  }
  if (ratio > 2 / 3) {
    return 'large';
  }
  return 'medium';
}

function snapSizeRatio(ratio: number): number {
  if (ratio < 1 / 3) {
    return 0;
  }
  if (ratio > 2 / 3) {
    return 1;
  }
  return 0.5;
}

function PadSlide({
  ratio,
  snapSize,
  onRatio,
  accessibilityLabel,
}: {
  ratio: number;
  snapSize?: boolean;
  onRatio: (value: number) => void;
  accessibilityLabel: string;
}) {
  const trackW = useSharedValue(180);

  const emit = (x: number, width: number) => {
    if (width <= 1) {
      return;
    }
    let next = clamp01(x / width);
    if (snapSize) {
      next = snapSizeRatio(next);
    }
    onRatio(next);
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((event) => {
      runOnJS(emit)(event.x, trackW.value);
    })
    .onUpdate((event) => {
      runOnJS(emit)(event.x, trackW.value);
    });

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 1) {
      trackW.value = width;
    }
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        style={styles.slideTrack}
        onLayout={onTrackLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.slideRail} />
        <View
          pointerEvents="none"
          style={[
            styles.slideThumb,
            { left: `${Math.round(clamp01(ratio) * 100)}%` },
          ]}
        />
      </View>
    </GestureDetector>
  );
}

function PhotoNoteChip({
  item,
  boxW,
  boxH,
  editable,
  compact,
  onMove,
  onChangeBody,
  onRemove,
  onDragLock,
  onStyleChange,
}: {
  item: PhotoNotePadItem;
  boxW: number;
  boxH: number;
  editable: boolean;
  compact: boolean;
  onMove?: (id: string, nx: number, ny: number) => void;
  onChangeBody?: (id: string, body: string) => void;
  onRemove?: (id: string) => void;
  onDragLock?: (locked: boolean) => void;
  onStyleChange?: (id: string, patch: PhotoNoteStylePatch) => void;
}) {
  const [stylePanelOpen, setStylePanelOpen] = useState(false);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const fontSizePt = photoNoteTextSizePt(item.textSize, compact);
  const textColorHex = photoNoteColorHex(item.textColor);
  const bgRgba = photoNoteBackgroundRgba(item.bgColor, item.bgOpacity);

  const commitMove = (tx: number, ty: number) => {
    if (!onMove || boxW <= 0 || boxH <= 0) {
      onDragLock?.(false);
      return;
    }
    onMove(item.id, item.nx + tx / boxW, item.ny + ty / boxH);
    onDragLock?.(false);
  };

  const lockDrag = () => {
    onDragLock?.(true);
  };

  const pan = Gesture.Pan()
    .enabled(editable)
    .hitSlop({ top: 12, bottom: 12, left: 12, right: 12 })
    .onStart(() => {
      runOnJS(lockDrag)();
    })
    .onUpdate((event) => {
      dragX.value = event.translationX;
      dragY.value = event.translationY;
    })
    .onEnd((event) => {
      dragX.value = 0;
      dragY.value = 0;
      runOnJS(commitMove)(event.translationX, event.translationY);
    })
    .onFinalize(() => {
      dragX.value = 0;
      dragY.value = 0;
    });

  const chipShift = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
  }));

  return (
    <View
      collapsable={false}
      style={[
        styles.chipAbs,
        {
          left: `${item.nx * 100}%`,
          top: `${item.ny * 100}%`,
        },
      ]}
      pointerEvents={editable ? 'auto' : 'none'}
    >
      <Animated.View style={chipShift}>
        <View
          style={[
            styles.chip,
            compact && styles.chipCompact,
            {
              backgroundColor: bgRgba,
              marginLeft: compact ? -CHIP_LEAD_COMPACT : -CHIP_LEAD_EDIT,
              marginTop: -chipTextRise(compact, fontSizePt),
            },
          ]}
        >
          {editable ? (
            <GestureDetector gesture={pan}>
              <View
                style={styles.grip}
                accessibilityLabel="글 위치 옮김"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <View style={styles.gripBar} />
                <View style={styles.gripBar} />
              </View>
            </GestureDetector>
          ) : null}
          {editable ? (
            <TextInput
              style={[
                styles.chipInput,
                compact && styles.chipInputCompact,
                { fontSize: fontSizePt, color: textColorHex },
              ]}
              value={item.body}
              onChangeText={(text) => onChangeBody?.(item.id, text)}
              placeholder="글"
              placeholderTextColor="#9ca3af"
              includeFontPadding={false}
              maxLength={PHOTO_NOTE_PAD_BODY_MAX}
              multiline={false}
            />
          ) : (
            <Text
              style={[
                styles.chipText,
                compact && styles.chipTextCompact,
                { fontSize: fontSizePt, color: textColorHex },
              ]}
              numberOfLines={1}
              includeFontPadding={false}
            >
              {item.body}
            </Text>
          )}
          {editable ? (
            <Pressable
              onPress={() => setStylePanelOpen((prev) => !prev)}
              hitSlop={6}
              accessibilityLabel="글 모양 설정"
            >
              <Text style={styles.styleMark}>Aa</Text>
            </Pressable>
          ) : null}
          {editable ? (
            <Pressable
              onPress={() => onRemove?.(item.id)}
              hitSlop={6}
              accessibilityLabel="글 지우기"
            >
              <Text style={styles.removeMark}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
      {editable && stylePanelOpen ? (
        <View
          collapsable={false}
          style={[
            styles.stylePanel,
            item.ny > 0.55 ? styles.stylePanelAbove : styles.stylePanelBelow,
            item.nx > 0.5 ? styles.stylePanelAlignRight : styles.stylePanelAlignLeft,
          ]}
        >
          <Text style={styles.stylePanelLabel}>
            크기 · {photoNoteTextSizeLabel(item.textSize)}
          </Text>
          <PadSlide
            ratio={sizeToRatio(item.textSize)}
            snapSize
            accessibilityLabel="글자 크기"
            onRatio={(value) => onStyleChange?.(item.id, { textSize: ratioToSize(value) })}
          />
          <Text style={styles.stylePanelLabel}>글자색</Text>
          <View style={styles.stylePanelRow}>
            {PHOTO_NOTE_COLOR_OPTIONS.map((key) => (
              <Pressable
                key={key}
                onPress={() => onStyleChange?.(item.id, { textColor: key })}
                accessibilityLabel={`글자색 ${photoNoteColorLabel(key)}`}
                style={[
                  styles.swatch,
                  { backgroundColor: photoNoteColorHex(key) },
                  item.textColor === key && styles.swatchActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stylePanelLabel}>배경색</Text>
          <View style={styles.stylePanelRow}>
            {PHOTO_NOTE_COLOR_OPTIONS.map((key) => (
              <Pressable
                key={key}
                onPress={() => onStyleChange?.(item.id, { bgColor: key })}
                accessibilityLabel={`배경색 ${photoNoteColorLabel(key)}`}
                style={[
                  styles.swatch,
                  { backgroundColor: photoNoteColorHex(key) },
                  item.bgColor === key && styles.swatchActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stylePanelLabel}>배경 투명도 · {Math.round(item.bgOpacity)}%</Text>
          <PadSlide
            ratio={clamp01(item.bgOpacity / 100)}
            accessibilityLabel="배경 투명도"
            onRatio={(value) => onStyleChange?.(item.id, { bgOpacity: Math.round(value * 100) })}
          />
        </View>
      ) : null}
    </View>
  );
}

/* NOTE_PAD_TUNE_HOST: 글 상자의 왼쪽 위가 저장 좌표. 되돌리: restore-note-pad-tune.bat */
/* NOTE_PAD_RISE_HOST: 글자 상단이 ny. 되돌리: restore-note-pad-rise.bat */
export function PhotoNotePadLayer({
  items,
  editable = false,
  compact = false,
  boxWidth,
  boxHeight,
  onMove,
  onChangeBody,
  onRemove,
  onDragLock,
  onStyleChange,
}: PhotoNotePadLayerProps) {
  if (boxWidth <= 0 || boxHeight <= 0) {
    return null;
  }
  return (
    <View
      collapsable={false}
      style={[styles.layer, { width: boxWidth, height: boxHeight }]}
      pointerEvents={editable ? 'box-none' : 'none'}
    >
      {items.map((item) =>
        compact && !item.body ? null : (
          <PhotoNoteChip
            key={item.id}
            item={item}
            boxW={boxWidth}
            boxH={boxHeight}
            editable={editable}
            compact={compact}
            onMove={onMove}
            onChangeBody={onChangeBody}
            onRemove={onRemove}
            onDragLock={onDragLock}
            onStyleChange={onStyleChange}
          />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 6,
    elevation: 6,
  },
  chipAbs: {
    position: 'absolute',
    maxWidth: '70%',
    zIndex: 7,
    elevation: 7,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
  },
  chipCompact: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 4,
  },
  grip: {
    width: 18,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  gripBar: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#64748b',
  },
  chipInput: {
    minWidth: 72,
    maxWidth: 180,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  chipInputCompact: {
    fontSize: 11,
    minWidth: 48,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  chipTextCompact: {
    fontSize: 10,
  },
  removeMark: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  styleMark: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  stylePanel: {
    position: 'absolute',
    minWidth: 220,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 4,
    zIndex: 8,
    elevation: 8,
  },
  stylePanelBelow: {
    top: '100%',
    marginTop: 6,
  },
  stylePanelAbove: {
    bottom: '100%',
    marginBottom: 6,
  },
  stylePanelAlignLeft: {
    left: 0,
  },
  stylePanelAlignRight: {
    right: 0,
  },
  stylePanelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 4,
  },
  stylePanelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slideTrack: {
    height: 28,
    justifyContent: 'center',
    marginVertical: 2,
  },
  slideRail: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  slideThumb: {
    position: 'absolute',
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: '#1e293b',
  },
});
