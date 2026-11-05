import { type ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

/** Large save viewer only. Scales the photo on screen. Does not rewrite the file. */
const REST_SCALE = 1;
const PEAK_SCALE = 4;

type SavePhotoMagnifierProps = {
  children: ReactNode;
  onPinchLock?: (locked: boolean) => void;
};

export function SavePhotoMagnifier({ children, onPinchLock }: SavePhotoMagnifierProps) {
  const scale = useSharedValue(REST_SCALE);
  const scaleAtPinch = useSharedValue(REST_SCALE);
  const shiftX = useSharedValue(0);
  const shiftY = useSharedValue(0);
  const shiftAtPan = useSharedValue({ x: 0, y: 0 });
  const frameW = useSharedValue(0);
  const frameH = useSharedValue(0);
  const scrollHeld = useSharedValue(false);

  const reportLock = (locked: boolean) => {
    onPinchLock?.(locked);
  };

  const holdScroll = (next: boolean) => {
    'worklet';
    if (scrollHeld.value === next) {
      return;
    }
    scrollHeld.value = next;
    runOnJS(reportLock)(next);
  };

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      scaleAtPinch.value = scale.value;
    })
    .onUpdate((event) => {
      const next = Math.min(PEAK_SCALE, Math.max(REST_SCALE, scaleAtPinch.value * event.scale));
      scale.value = next;
      holdScroll(next > REST_SCALE + 0.02);
    })
    .onFinalize(() => {
      if (scale.value <= REST_SCALE + 0.02) {
        scale.value = REST_SCALE;
        scaleAtPinch.value = REST_SCALE;
        shiftX.value = 0;
        shiftY.value = 0;
        shiftAtPan.value = { x: 0, y: 0 };
        holdScroll(false);
      } else {
        scaleAtPinch.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_event, state) => {
      if (scale.value > REST_SCALE + 0.02) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onStart(() => {
      shiftAtPan.value = { x: shiftX.value, y: shiftY.value };
    })
    .onUpdate((event) => {
      const limitX = Math.max(0, (frameW.value * (scale.value - REST_SCALE)) / 2);
      const limitY = Math.max(0, (frameH.value * (scale.value - REST_SCALE)) / 2);
      const nextX = shiftAtPan.value.x + event.translationX;
      const nextY = shiftAtPan.value.y + event.translationY;
      shiftX.value = Math.min(limitX, Math.max(-limitX, nextX));
      shiftY.value = Math.min(limitY, Math.max(-limitY, nextY));
    });

  const motion = Gesture.Simultaneous(pinch, pan);
  const frameStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shiftX.value }, { translateY: shiftY.value }, { scale: scale.value }],
  }));

  return (
    <View
      collapsable={false}
      style={{ width: '100%', overflow: 'hidden' }}
      onLayout={(event) => {
        frameW.value = event.nativeEvent.layout.width;
        frameH.value = event.nativeEvent.layout.height;
      }}
    >
      <GestureDetector gesture={motion}>
        <Animated.View style={frameStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
