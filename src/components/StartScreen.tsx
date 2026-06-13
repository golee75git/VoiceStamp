import { Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { snoozeStartScreenForWeek } from '../services/settingsService';

const startImage = require('../../assets/start.png');

type StartScreenProps = {
  onComplete: () => void;
};

export function StartScreen({ onComplete }: StartScreenProps) {
  const handleSnoozeWeek = async () => {
    await snoozeStartScreenForWeek();
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.imageWrap}
        onPress={onComplete}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        <Image
          source={startImage}
          style={styles.image}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </Pressable>
      <View style={styles.footer}>
        <Pressable
          style={styles.snoozeButton}
          onPress={() => void handleSnoozeWeek()}
          accessibilityRole="button"
          accessibilityLabel="일주일간 보지 않기"
        >
          <Text style={styles.snoozeText}>일주일간 보지 않기</Text>
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
    alignItems: 'center',
  },
  snoozeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  snoozeText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
