import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { JourneyListItem, JourneyPanel } from '../components/JourneyPanel';
import { JourneyScaffold } from '../components/JourneyScaffold';
import { getConversation } from '../services/contentService';
import { getWisdomById, getWorldForWisdom } from '../services/wisdomService';
import { styles } from '../theme/styles';
import { WisdomJourneyParamList } from '../types/wisdom';

type TalkWithCloudScreenProps = NativeStackScreenProps<WisdomJourneyParamList, 'TalkWithCloud'>;

export function TalkWithCloudScreen({ navigation, route }: TalkWithCloudScreenProps) {
  const wisdom = getWisdomById(route.params.wisdomId);
  const world = getWorldForWisdom(wisdom.id);
  const conversation = getConversation(wisdom.conversationId);

  return (
    <JourneyScaffold
      world={world}
      step="Growth 2 of 4"
      eyebrow="Talk with Cloud"
      title="Become a clearer thinker"
      description="A guided conversation space for becoming calmer and wiser with real choices."
      icon="chatbubble-ellipses-outline"
      primaryLabel="Start Challenge"
      onPrimary={() => navigation.navigate('Challenge', { wisdomId: wisdom.id })}
      onBack={() => navigation.goBack()}
    >
      <JourneyPanel title="Cloud asks">
        <View style={styles.cloudBubble}>
          <Text style={styles.cloudBubbleText}>{conversation.openingQuestion}</Text>
        </View>
      </JourneyPanel>

      <JourneyPanel title="Practice becoming wiser">
        <JourneyListItem icon="help-circle-outline" title="Ask with courage" body="Talk with Cloud about choices that happen in real life." />
        <JourneyListItem icon="heart-outline" title="Feel guided" body="Cloud listens warmly and helps you find your wiser next step." />
      </JourneyPanel>
    </JourneyScaffold>
  );
}
