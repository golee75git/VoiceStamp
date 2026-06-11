import { useEffect, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CameraScreen } from '../components/CameraScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { StampListScreen } from '../components/StampListScreen';
import { TrashScreen } from '../components/TrashScreen';

type Screen = 'camera' | 'list' | 'settings' | 'trash';
type SettingsReturn = 'camera' | 'list';

export function MainScreen() {
  const [screen, setScreen] = useState<Screen>('camera');
  const [settingsReturn, setSettingsReturn] = useState<SettingsReturn>('camera');
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = () => setRefreshKey((value) => value + 1);

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
        />
      ) : screen === 'settings' ? (
        <SettingsScreen
          onBack={() => setScreen(settingsReturn)}
          backLabel={settingsReturn === 'list' ? '목록' : '카메라'}
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
