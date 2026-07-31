import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStateProvider } from './src/state/AppStateProvider';
import { appColors } from './src/theme';

export default function App() {
  return (
    <AppStateProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar backgroundColor={appColors.canvas} style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AppStateProvider>
  );
}
