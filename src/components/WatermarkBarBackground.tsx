import { View, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';

import { getWatermarkTheme } from '../services/watermarkStyle';
import type { WatermarkStyle } from '../services/settingsService';

type WatermarkBarBackgroundProps = {
  style: WatermarkStyle;
  barStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function WatermarkBarBackground({ style, barStyle, children }: WatermarkBarBackgroundProps) {
  const theme = getWatermarkTheme(style);

  return (
    <View style={[barStyle, { backgroundColor: theme.barBackground }]}>
      {children}
    </View>
  );
}
