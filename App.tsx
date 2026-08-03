import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CloudVoiceProvider } from './src/features/cloudVoice/CloudVoiceProvider';
import { AppStateProvider } from './src/state/AppStateProvider';
import { appColors } from './src/theme';

export default function App() {
  return (
    <AppStateProvider>
      <CloudVoiceProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar backgroundColor={appColors.canvas} style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </CloudVoiceProvider>
    </AppStateProvider>
  );
}
