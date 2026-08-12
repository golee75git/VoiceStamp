import { useState } from 'react';
import { Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { setOnboardingSeen } from '../services/settingsService';

type Slide = {
  source: number;
  title: string;
  hint: string;
  accessibilityLabel: string;
};

/** First-run: shoot → speak → save (reuse existing art; captions carry the lesson). */
const SLIDES: Slide[] = [
  {
    source: require('../../assets/onboarding/onboarding-1.png'),
    title: '찍기',
    hint: '현장 사진을 촬영합니다.',
    accessibilityLabel: '찍기. 현장 사진을 촬영합니다.',
  },
  {
    source: require('../../assets/onboarding/onboarding-1.png'),
    title: '말하기',
    hint: '제목·메모는 마이크으로 말해도 됩니다.',
    accessibilityLabel: '말하기. 제목과 메모는 마이크으로 말해도 됩니다.',
  },
  {
    source: require('../../assets/onboarding/onboarding-2.png'),
    title: '저장',
    hint: '목록에서 보고 PDF로 보낼 수 있습니다.',
    accessibilityLabel: '저장. 목록에서 보고 PDF로 보낼 수 있습니다.',
  },
];

type IntroScreenProps = {
  onComplete: () => void;
  markSeenOnComplete?: boolean;
};

export function IntroScreen({ onComplete, markSeenOnComplete = true }: IntroScreenProps) {
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  const handleNext = async () => {
    if (isLast) {
      if (markSeenOnComplete) {
        await setOnboardingSeen();
      }
      onComplete();
      return;
    }
    setStep((value) => value + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.caption}>
        <Text style={styles.stepIndex}>{step + 1} / {SLIDES.length}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.hint}>{slide.hint}</Text>
      </View>
      <View style={styles.imageWrap}>
        <Image
          source={slide.source}
          style={styles.image}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel={slide.accessibilityLabel}
        />
      </View>
      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => void handleNext()}
          accessibilityRole="button"
          accessibilityLabel={isLast ? '촬영 시작' : '다음'}
        >
          <Text style={styles.buttonText}>{isLast ? '촬영 시작' : '다음'}</Text>
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
  caption: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 4,
  },
  stepIndex: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },
  hint: {
    marginTop: 6,
    color: '#374151',
    fontSize: 16,
    lineHeight: 22,
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
