import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CloudScreen } from '../screens/CloudScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JourneyScreen } from '../screens/JourneyScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WisdomDetailScreen } from '../screens/WisdomDetailScreen';
import { RootStackParamList } from '../types/wisdom';
import { WisdomJourneyNavigator } from './WisdomJourneyNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Journey" component={JourneyScreen} />
      <Stack.Screen name="Cloud" component={CloudScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="WisdomDetail" component={WisdomDetailScreen} />
      <Stack.Screen name="WisdomJourney" component={WisdomJourneyNavigator} />
    </Stack.Navigator>
  );
}
