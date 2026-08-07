import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CameraScreen } from '../components/CameraScreen';
import { IntroScreen } from '../components/IntroScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { StampImageExportHost, type StampImageExportHostRef } from '../components/StampImageExportHost';
import { StampListScreen } from '../components/StampListScreen';
import { OpenSourceLicensesScreen } from '../components/OpenSourceLicensesScreen';
import { TrashScreen } from '../components/TrashScreen';
import { ProjectCollectScreen } from '../components/ProjectCollectScreen';
import type { CaptureStampForExport } from '../services/exportStampImage';

type Screen = 'camera' | 'list' | 'settings' | 'trash' | 'ossLicenses' | 'projectCollect';
type SettingsReturn = 'camera' | 'list';

export function MainScreen() {
  const [screen, setScreen] = useState<Screen>('camera');
  const [settingsReturn, setSettingsReturn] = useState<SettingsReturn>('camera');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showIntroOverlay, setShowIntroOverlay] = useState(false);
  const exportHostRef = useRef<StampImageExportHostRef>(null);

  const bumpRefresh = () => setRefreshKey((value) => value + 1);

  const captureStampForExport = useCallback<CaptureStampForExport>((stamp, options) => {
    if (!exportHostRef.current) {
      return Promise.reject(new Error('이미지 캡처를 사용할 수 없습니다.'));
    }
    return exportHostRef.current.captureStamp(stamp, options);
  }, []);

  const openSettings = (returnTo: SettingsReturn) => {
    setSettingsReturn(returnTo);
    setScreen('settings');
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showIntroOverlay) {
        setShowIntroOverlay(false);
        return true;
      }
      switch (screen) {
        case 'list':
          setScreen('camera');
          return true;
        case 'settings':
          setScreen(settingsReturn);
          return true;
        case 'projectCollect':
          setScreen('settings');
          return true;
        case 'ossLicenses':
          setScreen('settings');
          return true;
        case 'trash':
          setScreen('list');
          return true;
        case 'camera':
          Alert.alert(
            '앱 종료',
            '앱을 종료하시겠습니까?',
            [
              { text: '아니오', style: 'cancel' },
              {
                text: '종료',
                style: 'destructive',
                onPress: () => BackHandler.exitApp(),
              },
            ],
            { cancelable: true },
          );
          return true;
        default:
          return false;
      }
    });

    return () => sub.remove();
  }, [screen, settingsReturn, showIntroOverlay]);

  if (showIntroOverlay) {
    return (
      <IntroScreen
        markSeenOnComplete={false}
        onComplete={() => setShowIntroOverlay(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'camera' ? (
        <CameraScreen
          refreshKey={refreshKey}
          onOpenList={() => setScreen('list')}
          onOpenSettings={() => openSettings('camera')}
          onSaved={bumpRefresh}
          captureStampForExport={captureStampForExport}
        />
      ) : screen === 'settings' ? (
        <SettingsScreen
          onBack={() => setScreen(settingsReturn)}
          backLabel={settingsReturn === 'list' ? '목록' : '카메라'}
          refreshKey={refreshKey}
          onSettingsSaved={bumpRefresh}
          onShowOnboarding={() => setShowIntroOverlay(true)}
          onOpenOssLicenses={() => setScreen('ossLicenses')}
          onOpenProjectCollect={() => setScreen('projectCollect')}
        />
      ) : screen === 'projectCollect' ? (
        <ProjectCollectScreen onBack={() => setScreen('settings')} onImported={bumpRefresh} />
      ) : screen === 'ossLicenses' ? (
        <OpenSourceLicensesScreen onBack={() => setScreen('settings')} />
      ) : screen === 'trash' ? (
        <TrashScreen
          onBack={() => setScreen('list')}
          refreshKey={refreshKey}
          onChanged={bumpRefresh}
        />
      ) : (
        <StampListScreen
          onBack={() => setScreen('camera')}
          onOpenTrash={() => setScreen('trash')}
          onOpenSettings={() => openSettings('list')}
          refreshKey={refreshKey}
          onChanged={bumpRefresh}
          captureStampForExport={captureStampForExport}
        />
      )}
      {Platform.OS !== 'web' ? <StampImageExportHost ref={exportHostRef} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
