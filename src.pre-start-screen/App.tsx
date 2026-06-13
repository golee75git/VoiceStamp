import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

  let content: ReactNode = <View style={styles.boot} />;

  if (ready) {
    if (showIntro) {
      content = (
        <IntroScreen
          onComplete={async () => {
            await setLastAppOpenAt(Date.now());
            setShowIntro(false);
          }}
        />
      );
    } else {
      content = <MainScreen />;
    }
  }

  return <GestureHandlerRootView style={styles.root}>{content}</GestureHandlerRootView>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    backgroundColor: '#E8F4FE',
  },
});
