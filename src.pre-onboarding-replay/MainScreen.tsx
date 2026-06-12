import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CameraScreen } from '../components/CameraScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { StampImageExportHost, type StampImageExportHostRef } from '../components/StampImageExportHost';
import { StampListScreen } from '../components/StampListScreen';
import { TrashScreen } from '../components/TrashScreen';
import type { CaptureStampForExport } from '../services/exportStampImage';

type Screen = 'camera' | 'list' | 'settings' | 'trash';
type SettingsReturn = 'camera' | 'list';

export function MainScreen() {
  const [screen, setScreen] = useState<Screen>('camera');
  const [settingsReturn, setSettingsReturn] = useState<SettingsReturn>('camera');
  const [refreshKey, setRefreshKey] = useState(0);
  const exportHostRef = useRef<StampImageExportHostRef>(null);

  const bumpRefresh = () => setRefreshKey((value) => value + 1);

  const captureStampForExport = useCallback<CaptureStampForExport>((stamp, options) => {
    if (!exportHostRef.current) {
      return Promise.reject(new Error('?대?吏 罹≪쿂瑜??ъ슜?????놁뒿?덈떎.'));
    }
    return exportHostRef.current.captureStamp(stamp, options);
  }, []);

  const openSettings = (returnTo: SettingsReturn) => {
    setSettingsReturn(returnTo);
    setScreen('settings');
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      switch (screen) {
        case 'list':
          setScreen('camera');
          return true;
        case 'settings':
          setScreen(settingsReturn);
          return true;
        case 'trash':
          setScreen('list');
          return true;
        case 'camera':
          Alert.alert(
            '??醫낅즺',
            '?깆쓣 醫낅즺?섏떆寃좎뒿?덇퉴?',
            [
              { text: '?꾨땲??, style: 'cancel' },
              {
                text: '醫낅즺',
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
  }, [screen, settingsReturn]);

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
          backLabel={settingsReturn === 'list' ? '紐⑸줉' : '移대찓??}
          refreshKey={refreshKey}
          onTrashEmptied={bumpRefresh}
          onSettingsSaved={bumpRefresh}
        />
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
