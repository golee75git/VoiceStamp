import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import {
  PHOTO_NOTE_PAD_BODY_MAX,
  type PhotoNotePadItem,
} from '../services/photoNotePad';

type PhotoNotePadLayerProps = {
  items: PhotoNotePadItem[];
  editable?: boolean;
  compact?: boolean;
  onMove?: (id: string, nx: number, ny: number) => void;
  onChangeBody?: (id: string, body: string) => void;
  onRemove?: (id: string) => void;
  onDragLock?: (locked: boolean) => void;
};

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
}) {
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

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
      style={[
        styles.chipAbs,
        { left: `${item.nx * 100}%`, top: `${item.ny * 100}%` },
      ]}
      pointerEvents={editable ? 'auto' : 'none'}
    >
      <Animated.View style={chipShift}>
        <View style={[styles.chip, compact && styles.chipCompact]}>
          {editable ? (
            <GestureDetector gesture={pan}>
              <View
                style={styles.grip}
                accessibilityLabel="글 칸 위치 옮기기"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.gripMark}>↕</Text>
              </View>
            </GestureDetector>
          ) : null}
          {editable ? (
            <TextInput
              style={[styles.chipInput, compact && styles.chipInputCompact]}
              value={item.body}
              onChangeText={(text) => onChangeBody?.(item.id, text)}
              placeholder="글"
              placeholderTextColor="#9ca3af"
              maxLength={PHOTO_NOTE_PAD_BODY_MAX}
              multiline={false}
            />
          ) : (
            <Text style={[styles.chipText, compact && styles.chipTextCompact]} numberOfLines={1}>
              {item.body}
            </Text>
          )}
          {editable ? (
            <Pressable
              onPress={() => onRemove?.(item.id)}
              hitSlop={6}
              accessibilityLabel="글 칸 지우기"
            >
              <Text style={styles.removeMark}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

export function PhotoNotePadLayer({
  items,
  editable = false,
  compact = false,
  onMove,
  onChangeBody,
  onRemove,
  onDragLock,
}: PhotoNotePadLayerProps) {
  const [box, setBox] = useState({ w: 1, h: 1 });
  if (items.length === 0) {
    return null;
  }
  return (
    <View
      style={styles.layer}
      pointerEvents={editable ? 'box-none' : 'none'}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setBox({ w: width, h: height });
        }
      }}
    >
      {items.map((item) =>
        compact && !item.body ? null : (
          <PhotoNoteChip
            key={item.id}
            item={item}
            boxW={box.w}
            boxH={box.h}
            editable={editable}
            compact={compact}
            onMove={onMove}
            onChangeBody={onChangeBody}
            onRemove={onRemove}
            onDragLock={onDragLock}
          />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  chipAbs: {
    position: 'absolute',
    maxWidth: '70%',
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
  },
  gripMark: {
    fontSize: 12,
    color: '#64748b',
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
});
