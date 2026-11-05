import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { IntroScreen } from './src/components/IntroScreen';
import { StartScreen } from './src/components/StartScreen';
import { WebLimitNoticeScreen } from './src/components/WebLimitNoticeScreen';
import { MainScreen } from './src/screens/MainScreen';
import { stashProjectJoinUrl } from './src/services/projectJoinLink';
import {
  readLaunchPath,
  setLastAppOpenAt,
  type LaunchPath,
} from './src/services/settingsService';

type AppPhase = 'boot' | 'intro' | 'start' | 'webNotice' | 'main';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('boot');
  const [openCaptureOnReturn, setOpenCaptureOnReturn] = useState(false);
  const [returnCaptureMode, setReturnCaptureMode] = useState<LaunchPath['primaryCaptureCamera']>('system');

  const enterMain = useCallback(async (openCapture: boolean) => {
    void setLastAppOpenAt(Date.now());
    setOpenCaptureOnReturn(openCapture);
    setPhase('main');
  }, []);

  /** Web (/app): show limits notice once per visit before main. Native unchanged. */
  const proceedTowardMain = useCallback(async (openCapture: boolean) => {
    if (Platform.OS === 'web') {
      setPhase('webNotice');
      return;
    }
    await enterMain(openCapture);
  }, [enterMain]);

  const applyLaunchPath = useCallback(async (path: LaunchPath) => {
    if (Platform.OS !== 'web' && path.openSavedCapture) {
      setReturnCaptureMode(path.primaryCaptureCamera);
      setOpenCaptureOnReturn(true);
      void setLastAppOpenAt(Date.now());
      setPhase('main');
      return;
    }
    if (path.showIntro) {
      setPhase('intro');
      return;
    }
    if (path.showStart) {
      setPhase('start');
      return;
    }
    await proceedTowardMain(false);
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
      const path = await readLaunchPath();
      if (cancelled) {
        return;
      }
      await applyLaunchPath(path);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyLaunchPath]);

  let content: ReactNode = <View style={styles.boot} />;

  if (phase === 'intro') {
    content = (
      <IntroScreen
        onComplete={async () => {
          const path = await readLaunchPath();
          await applyLaunchPath({ ...path, showIntro: false });
        }}
      />
    );
  } else if (phase === 'start') {
    content = <StartScreen onComplete={() => void proceedTowardMain(false)} />;
  } else if (phase === 'webNotice') {
    content = <WebLimitNoticeScreen onContinue={() => void enterMain(false)} />;
  } else if (phase === 'main') {
    content = (
      <MainScreen
        openCaptureOnReturn={openCaptureOnReturn}
        returnCaptureMode={returnCaptureMode}
      />
    );
  }

  return <GestureHandlerRootView style={styles.root}>{content}</GestureHandlerRootView>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    backgroundColor: '#000',
  },
});
