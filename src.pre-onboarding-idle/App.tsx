import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IntroScreen } from './src/components/IntroScreen';
import { MainScreen } from './src/screens/MainScreen';
import { hasSeenOnboarding } from './src/services/settingsService';

export default function App() {
  const [ready, setReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const seen = await hasSeenOnboarding();
      if (cancelled) {
        return;
      }
      setShowIntro(!seen);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <View style={styles.boot} />;
  }

  if (showIntro) {
    return <IntroScreen onComplete={() => setShowIntro(false)} />;
  }

  return <MainScreen />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#E8F4FE',
  },
});
