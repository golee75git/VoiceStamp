import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { setOnboardingSeen } from '../services/settingsService';

const SLIDES = [
  require('../../assets/onboarding/onboarding-1.png'),
  require('../../assets/onboarding/onboarding-2.png'),
  require('../../assets/onboarding/onboarding-3.png'),
] as const;

type IntroScreenProps = {
  onComplete: () => void;
};

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await setOnboardingSeen();
      onComplete();
      return;
    }
    setStep((value) => value + 1);
  };

  return (
    <View style={styles.container}>
      <Image source={SLIDES[step]} style={styles.image} resizeMode="cover" accessibilityIgnoresInvertColors />
      <Pressable
        style={styles.bottomTap}
        onPress={() => void handleNext()}
        accessibilityRole="button"
        accessibilityLabel={isLast ? '시작하기' : '다음'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FE',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bottomTap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '18%',
  },
});
