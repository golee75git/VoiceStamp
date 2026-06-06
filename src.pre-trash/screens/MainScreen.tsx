import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CameraScreen } from '../components/CameraScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { StampListScreen } from '../components/StampListScreen';

type Screen = 'camera' | 'list' | 'settings';

export function MainScreen() {
  const [screen, setScreen] = useState<Screen>('camera');
  const [settingsReturnTo, setSettingsReturnTo] = useState<'camera' | 'list'>('list');
  const [refreshKey, setRefreshKey] = useState(0);

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
          onSaved={() => setRefreshKey((value) => value + 1)}
        />
      ) : screen === 'settings' ? (
        <SettingsScreen
          onBack={() => setScreen(settingsReturnTo)}
          backLabel={settingsReturnTo === 'camera' ? '카메라' : '목록'}
        />
      ) : (
        <StampListScreen
          onBack={() => setScreen('camera')}
          onOpenSettings={() => openSettings('list')}
          refreshKey={refreshKey}
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
