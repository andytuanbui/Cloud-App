import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { styles } from './src/theme/styles';

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}
