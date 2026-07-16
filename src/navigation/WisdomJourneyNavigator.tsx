import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChallengeScreen } from '../screens/ChallengeScreen';
import { CongratulationsScreen } from '../screens/CongratulationsScreen';
import { QuestionBeforeWisdomScreen } from '../screens/QuestionBeforeWisdomScreen';
import { ReadingScreen } from '../screens/ReadingScreen';
import { TalkWithCloudScreen } from '../screens/TalkWithCloudScreen';
import { WisdomJourneyParamList } from '../types/wisdom';

const Stack = createNativeStackNavigator<WisdomJourneyParamList>();

export function WisdomJourneyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuestionBeforeWisdom" component={QuestionBeforeWisdomScreen} />
      <Stack.Screen name="Reading" component={ReadingScreen} />
      <Stack.Screen name="TalkWithCloud" component={TalkWithCloudScreen} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
      <Stack.Screen name="Congratulations" component={CongratulationsScreen} />
    </Stack.Navigator>
  );
}
