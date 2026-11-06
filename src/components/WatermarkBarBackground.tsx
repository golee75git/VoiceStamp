import { View, type LayoutChangeEvent, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';

import { getWatermarkTheme } from '../services/watermarkStyle';
import type { WatermarkStyle } from '../services/settingsService';

type WatermarkBarBackgroundProps = {
  style: WatermarkStyle;
  barStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function WatermarkBarBackground({
  style,
  barStyle,
  children,
  onLayout,
}: WatermarkBarBackgroundProps) {
  const theme = getWatermarkTheme(style);

  return (
    <View style={[barStyle, { backgroundColor: theme.barBackground }]} onLayout={onLayout}>
      {children}
    </View>
  );
}
