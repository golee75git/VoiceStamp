import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CameraScreen } from '../components/CameraScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { StampListScreen } from '../components/StampListScreen';
import { TrashScreen } from '../components/TrashScreen';

type Screen = 'camera' | 'list' | 'settings' | 'trash';

export function MainScreen() {
  const [screen, setScreen] = useState<Screen>('camera');
  const [settingsReturnTo, setSettingsReturnTo] = useState<'camera' | 'list'>('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = () => setRefreshKey((value) => value + 1);

  const openSettings = (returnTo: 'camera' | 'list') => {
    setSettingsReturnTo(returnTo);
    setScreen('settings');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'camera' ? (
        <CameraScreen
          onOpenList={() => setScreen('list')}
          onOpenSettings={() => openSettings('camera')}
          onSaved={bumpRefresh}
        />
      ) : screen === 'settings' ? (
        <SettingsScreen
          onBack={() => setScreen(settingsReturnTo)}
          backLabel={settingsReturnTo === 'camera' ? '移대찓?? : '紐⑸줉'}
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
          onOpenSettings={() => openSettings('list')}
          onOpenTrash={() => setScreen('trash')}
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
