import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { IntroScreen } from './src/components/IntroScreen';
import { StartScreen } from './src/components/StartScreen';
import { WebLimitNoticeScreen } from './src/components/WebLimitNoticeScreen';
import { MainScreen } from './src/screens/MainScreen';
import { stashProjectJoinUrl } from './src/services/projectJoinLink';
import {
  getFloorDisplayMode,
  getTitleDatetimeMode,
  setLastAppOpenAt,
  shouldShowOnboarding,
  shouldShowStartScreen,
} from './src/services/settingsService';

type AppPhase = 'boot' | 'intro' | 'start' | 'webNotice' | 'main';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('boot');

  const enterMain = useCallback(async () => {
    await setLastAppOpenAt(Date.now());
    setPhase('main');
  }, []);

  /** Web (/app): show limits notice once per visit before main. Native unchanged. */
  const proceedTowardMain = useCallback(async () => {
    if (Platform.OS === 'web') {
      setPhase('webNotice');
      return;
    }
    await enterMain();
  }, [enterMain]);

  const goToStartOrMain = useCallback(async () => {
    const showStart = await shouldShowStartScreen();
    if (showStart) {
      setPhase('start');
      return;
    }
    await proceedTowardMain();
  }, [proceedTowardMain]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void Linking.getInitialURL().then((url) => {
      stashProjectJoinUrl(url);
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      stashProjectJoinUrl(url);
    });
    return () => sub.remove();
  }, []);

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
    content = <StartScreen onComplete={() => void proceedTowardMain()} />;
  } else if (phase === 'webNotice') {
    content = <WebLimitNoticeScreen onContinue={() => void enterMain()} />;
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
