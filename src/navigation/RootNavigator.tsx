import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CloudScreen } from '../screens/CloudScreen';
import { FamilyScreen } from '../screens/FamilyScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { WisdomFlowScreen } from '../screens/WisdomFlowScreen';
import { RootStackParamList } from '../types/wisdom';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Today" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Today" component={TodayScreen} />
      <Stack.Screen name="WisdomFlow" component={WisdomFlowScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Cloud" component={CloudScreen} />
      <Stack.Screen name="Family" component={FamilyScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
