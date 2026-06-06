import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CameraScreen } from '../components/CameraScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { StampListScreen } from '../components/StampListScreen';

type Screen = 'camera' | 'list' | 'settings';

export function MainScreen() {
  const [screen, setScreen] = useState<Screen>('camera');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'camera' ? (
        <CameraScreen
          onOpenList={() => setScreen('list')}
          onSaved={() => setRefreshKey((value) => value + 1)}
        />
      ) : screen === 'settings' ? (
        <SettingsScreen onBack={() => setScreen('list')} />
      ) : (
        <StampListScreen
          onBack={() => setScreen('camera')}
          onOpenSettings={() => setScreen('settings')}
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
