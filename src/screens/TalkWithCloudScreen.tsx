import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { JourneyListItem, JourneyPanel } from '../components/JourneyPanel';
import { JourneyScaffold } from '../components/JourneyScaffold';
import { LoadingState } from '../components/LoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getConversation } from '../services/contentService';
import { getWisdomById, getWorldForWisdom } from '../services/wisdomService';
import { styles } from '../theme/styles';
import { WisdomJourneyParamList } from '../types/wisdom';

type TalkWithCloudScreenProps = NativeStackScreenProps<WisdomJourneyParamList, 'TalkWithCloud'>;

export function TalkWithCloudScreen({ navigation, route }: TalkWithCloudScreenProps) {
  const content = useAsyncResource(async () => {
    const wisdom = await getWisdomById(route.params.wisdomId);
    const [world, conversation] = await Promise.all([
      getWorldForWisdom(wisdom.id),
      getConversation(wisdom.conversationId),
    ]);

    return { conversation, wisdom, world };
  }, [route.params.wisdomId]);

  const [selectedReplyIndex, setSelectedReplyIndex] = useState<number | null>(null);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  const { conversation, wisdom, world } = content.data;
  const hasReplied = selectedReplyIndex !== null;

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

        {!hasReplied ? (
          <View style={styles.conversationReplyList}>
            {conversation.suggestedReplies.map((reply, index) => (
              <Pressable
                key={reply}
                style={styles.conversationReplyOption}
                onPress={() => setSelectedReplyIndex(index)}
              >
                <Text style={styles.conversationReplyOptionText}>{reply}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.conversationExchange}>
            <View style={styles.conversationUserBubble}>
              <Text style={styles.conversationUserBubbleText}>{conversation.suggestedReplies[selectedReplyIndex]}</Text>
            </View>
            <View style={styles.cloudBubble}>
              <Text style={styles.cloudBubbleText}>{conversation.replyResponses[selectedReplyIndex]}</Text>
            </View>
            <Pressable onPress={() => setSelectedReplyIndex(null)}>
              <Text style={styles.conversationChangeAnswer}>Choose a different answer</Text>
            </Pressable>
          </View>
        )}
      </JourneyPanel>

      <JourneyPanel title="Practice becoming wiser">
        <JourneyListItem icon="help-circle-outline" title="Ask with courage" body="Talk with Cloud about choices that happen in real life." />
        <JourneyListItem icon="heart-outline" title="Feel guided" body="Cloud listens warmly and helps you find your wiser next step." />
      </JourneyPanel>
    </JourneyScaffold>
  );
}
