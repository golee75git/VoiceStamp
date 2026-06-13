import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IntroScreen } from './src/components/IntroScreen';
import { MainScreen } from './src/screens/MainScreen';
import { setLastAppOpenAt, shouldShowOnboarding } from './src/services/settingsService';

export default function App() {
  const [ready, setReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const show = await shouldShowOnboarding();
      if (cancelled) {
        return;
      }
      setShowIntro(show);
      setReady(true);
      if (!show) {
        await setLastAppOpenAt(Date.now());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <View style={styles.boot} />;
  }

  if (showIntro) {
    return (
      <IntroScreen
        onComplete={async () => {
          await setLastAppOpenAt(Date.now());
          setShowIntro(false);
        }}
      />
    );
  }

  return <MainScreen />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#E8F4FE',
  },
});
