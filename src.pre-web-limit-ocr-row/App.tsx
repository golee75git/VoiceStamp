import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { IntroScreen } from './src/components/IntroScreen';
import { StartScreen } from './src/components/StartScreen';
import { MainScreen } from './src/screens/MainScreen';
import {
  getFloorDisplayMode,
  getTitleDatetimeMode,
  setLastAppOpenAt,
  shouldShowOnboarding,
  shouldShowStartScreen,
} from './src/services/settingsService';

type AppPhase = 'boot' | 'intro' | 'start' | 'main';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('boot');

  const enterMain = useCallback(async () => {
    await setLastAppOpenAt(Date.now());
    setPhase('main');
  }, []);

  const goToStartOrMain = useCallback(async () => {
    const showStart = await shouldShowStartScreen();
    if (showStart) {
      setPhase('start');
      return;
    }
    await enterMain();
  }, [enterMain]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await Promise.all([getFloorDisplayMode(), getTitleDatetimeMode()]);
      const showIntro = await shouldShowOnboarding();
      if (cancelled) {
        return;
      }
      if (showIntro) {
        setPhase('intro');
        return;
      }
      await goToStartOrMain();
    })();

    return () => {
      cancelled = true;
    };
  }, [goToStartOrMain]);

  let content: ReactNode = <View style={styles.boot} />;

  if (phase === 'intro') {
    content = (
      <IntroScreen
        onComplete={async () => {
          await goToStartOrMain();
        }}
      />
    );
  } else if (phase === 'start') {
    content = <StartScreen onComplete={() => void enterMain()} />;
  } else if (phase === 'main') {
    content = <MainScreen />;
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
