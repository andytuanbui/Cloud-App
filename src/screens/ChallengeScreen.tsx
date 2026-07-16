import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JourneyListItem, JourneyPanel } from '../components/JourneyPanel';
import { JourneyScaffold } from '../components/JourneyScaffold';
import { LoadingState } from '../components/LoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getChallenge } from '../services/contentService';
import { getWisdomById, getWorldForWisdom } from '../services/wisdomService';
import { WisdomJourneyParamList } from '../types/wisdom';

type ChallengeScreenProps = NativeStackScreenProps<WisdomJourneyParamList, 'Challenge'>;

export function ChallengeScreen({ navigation, route }: ChallengeScreenProps) {
  const content = useAsyncResource(async () => {
    const wisdom = await getWisdomById(route.params.wisdomId);
    const [world, challenge] = await Promise.all([getWorldForWisdom(wisdom.id), getChallenge(wisdom.challengeId)]);

    return { challenge, wisdom, world };
  }, [route.params.wisdomId]);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  const { challenge, wisdom, world } = content.data;

  return (
    <JourneyScaffold
      world={world}
      step="Growth 3 of 4"
      eyebrow="Challenge"
      title="Practice your wiser choice"
      description="A small real-life practice for becoming more thoughtful before spending."
      icon="trophy-outline"
      primaryLabel="I practiced wisdom"
      onPrimary={() => navigation.navigate('Congratulations', { wisdomId: wisdom.id })}
      onBack={() => navigation.goBack()}
    >
      <JourneyPanel title="Practice who you're becoming">
        {challenge.steps.map((step) => (
          <JourneyListItem key={step.id} icon={step.icon} title={step.title} body={step.body} />
        ))}
      </JourneyPanel>
    </JourneyScaffold>
  );
}
