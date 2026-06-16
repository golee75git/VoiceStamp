import { StyleSheet, View, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';

import { getWatermarkTheme } from '../services/watermarkStyle';
import type { WatermarkStyle } from '../services/settingsService';

type WatermarkBarBackgroundProps = {
  style: WatermarkStyle;
  barStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function WatermarkBarBackground({ style, barStyle, children }: WatermarkBarBackgroundProps) {
  const theme = getWatermarkTheme(style);

  if (theme.pattern === 'red_stripes') {
    return (
      <View style={[barStyle, styles.bar, { backgroundColor: theme.barBackground }]}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 48 }, (_, index) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: index * 10,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: theme.stripeColor,
                opacity: 0.92,
              }}
            />
          ))}
        </View>
        {children}
      </View>
    );
  }

  return (
    <View style={[barStyle, styles.bar, { backgroundColor: theme.barBackground }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    overflow: 'hidden',
  },
});
