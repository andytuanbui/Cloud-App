import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStateProvider } from './src/state/AppStateProvider';

export default function App() {
  return (
    <AppStateProvider>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5FAF8' }}>
          <StatusBar style="dark" />
          <RootNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </AppStateProvider>
  );
}
