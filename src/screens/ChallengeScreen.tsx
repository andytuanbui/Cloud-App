import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JourneyListItem, JourneyPanel } from '../components/JourneyPanel';
import { JourneyScaffold } from '../components/JourneyScaffold';
import { getChallenge } from '../services/contentService';
import { getWisdomById, getWorldForWisdom } from '../services/wisdomService';
import { WisdomJourneyParamList } from '../types/wisdom';

type ChallengeScreenProps = NativeStackScreenProps<WisdomJourneyParamList, 'Challenge'>;

export function ChallengeScreen({ navigation, route }: ChallengeScreenProps) {
  const wisdom = getWisdomById(route.params.wisdomId);
  const world = getWorldForWisdom(wisdom.id);
  const challenge = getChallenge(wisdom.challengeId);

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
