import { useState } from 'react';
import { Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { setOnboardingSeen } from '../services/settingsService';

const SLIDES = [
  require('../../assets/onboarding/onboarding-1.png'),
  require('../../assets/onboarding/onboarding-2.png'),
  require('../../assets/onboarding/onboarding-3.png'),
  require('../../assets/onboarding/onboarding-4.png'),
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
    <SafeAreaView style={styles.container}>
      <View style={styles.imageWrap}>
        <Image
          source={SLIDES[step]}
          style={styles.image}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => void handleNext()}
          accessibilityRole="button"
          accessibilityLabel={isLast ? '시작하기' : '다음'}
        >
          <Text style={styles.buttonText}>{isLast ? '시작하기' : '다음'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FE',
  },
  imageWrap: {
    flex: 1,
    width: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 20 : 8,
  },
  button: {
    backgroundColor: '#2F80ED',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
