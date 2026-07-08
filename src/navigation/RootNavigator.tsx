import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { WisdomDetailScreen } from '../screens/WisdomDetailScreen';
import { RootStackParamList } from '../types/wisdom';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="WisdomDetail" component={WisdomDetailScreen} />
    </Stack.Navigator>
  );
}
