import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  CloudResponseCard,
  GuidedWisdomScaffold,
  MoneyAmountStepper,
  NarrationControls,
  type NarrationStatus,
  PersonalResponseInput,
  type PersonalResponseSuggestion,
  ReflectionChoiceCard,
  StorySceneCard,
} from '../../components/wisdom/guided';
import {
  AppText,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
} from '../../components/ui';
import type {
  GuidedReflectionChoice,
  GuidedStoryWisdomContent,
  MoneyDecisionCategoryId,
  MoneyPlan,
} from '../../content/wisdoms';
import {
  buildAdaptiveReflectionResponse,
  buildCompletionRecognition,
  buildPersonalizedSummary,
  evaluateMoneyPlan,
  getPracticeAction,
  normalizePersonalResponse,
  validateMoneyPlan,
} from '../../services/guidedWisdomResponseService';
import { narrationService } from '../../services/narrationService';
import {
  createDefaultGuidedWisdomSession,
  type GuidedWisdomSession,
  type GuidedWisdomStage,
  type WisdomProgress,
} from '../../state/types';
import { useAppState } from '../../state/useAppState';
import { appColors, radii, shadows, space, spacing, typography } from '../../theme';

const leoArtwork = require('../../../assets/cloud/cat-money.png');
const leoHeroArtwork = require('../../../assets/cloud/cloud-hero-wave.png');
const leoHeadphonesArtwork = require('../../../assets/cloud/cat-modern.png');
const leoThinkingArtwork = require('../../../assets/cloud/cat-thinking.png');

type Props = {
  onBack: () => void;
  onExit: () => void;
  progress?: WisdomProgress;
  reviewMode: boolean;
  wisdom: GuidedStoryWisdomContent;
};

const welcomeIdeaIcons = [
  'football-outline',
  'headset-outline',
  'gift-outline',
] as const;

export function ThreeWaysGuidedWisdomScreen({
  onBack,
  onExit,
  progress,
  reviewMode,
  wisdom,
}: Props) {
  const {
    completeGuidedWisdom,
    startGuidedWisdomReview,
    updateGuidedSession,
  } = useAppState();
  const isLearned = Boolean(progress?.isCompleted || progress?.completed);
  const reviewStarted = useRef(false);
  const [reviewInitializing, setReviewInitializing] = useState(
    reviewMode && isLearned,
  );
  const session = useMemo(() => getDisplaySession(progress), [progress]);
  const stage: GuidedWisdomStage = reviewInitializing
    ? 'welcome'
    : session.currentStage;
  const sceneIndex = Math.min(
    Math.max(0, session.currentStoryScene),
    wisdom.storyScenes.length - 1,
  );
  const scene = wisdom.storyScenes[sceneIndex];
  const selectedReflection = wisdom.reflection.choices.find(
    (choice) => choice.id === session.selectedReflectionAnswer,
  );
  const [personalDraft, setPersonalDraft] = useState(
    session.personalResponse?.source === 'typed'
      ? session.personalResponse.text
      : '',
  );
  const [personalSuggestionId, setPersonalSuggestionId] = useState<string>();
  const [takeawayDraft, setTakeawayDraft] = useState(
    session.selectedTakeaway?.source === 'typed'
      ? session.selectedTakeaway.text
      : '',
  );
  const [showLastPlan, setShowLastPlan] = useState(false);
  const [narrationStatus, setNarrationStatus] = useState<NarrationStatus>(
    narrationService.supported ? 'idle' : 'unavailable',
  );
  const [hasNarratedScene, setHasNarratedScene] = useState(false);

  useEffect(() => {
    if (reviewMode && isLearned && !reviewStarted.current) {
      reviewStarted.current = true;
      startGuidedWisdomReview(wisdom.id);
      setReviewInitializing(false);
    }
  }, [isLearned, reviewMode, startGuidedWisdomReview, wisdom.id]);

  useEffect(() => {
    if (!reviewMode && !progress?.guidedSession && !isLearned) {
      updateGuidedSession(wisdom.id, {
        currentStage: 'welcome',
        currentStoryScene: 0,
        spendAmount: wisdom.decision.initialPlan.spend,
        saveAmount: wisdom.decision.initialPlan.save,
        giveAmount: wisdom.decision.initialPlan.give,
      });
    }
  }, [
    isLearned,
    progress?.guidedSession,
    reviewMode,
    updateGuidedSession,
    wisdom.decision.initialPlan.give,
    wisdom.decision.initialPlan.save,
    wisdom.decision.initialPlan.spend,
    wisdom.id,
  ]);

  useEffect(() => {
    if (session.personalResponse?.source === 'suggested' && selectedReflection) {
      setPersonalDraft('');
      setPersonalSuggestionId(
        selectedReflection.suggestedResponses.find(
          (suggestion) => suggestion.label === session.personalResponse?.text,
        )?.id,
      );
    } else {
      setPersonalDraft(session.personalResponse?.text ?? '');
      setPersonalSuggestionId(undefined);
    }
  }, [
    selectedReflection,
    session.personalResponse?.source,
    session.personalResponse?.text,
  ]);

  useEffect(() => {
    setTakeawayDraft(
      session.selectedTakeaway?.source === 'typed'
        ? session.selectedTakeaway.text
        : '',
    );
  }, [session.selectedTakeaway?.source, session.selectedTakeaway?.text]);

  useEffect(() => {
    narrationService.stop();
    setNarrationStatus(narrationService.supported ? 'idle' : 'unavailable');
    setHasNarratedScene(false);
    return () => narrationService.stop();
  }, [sceneIndex, stage]);

  const updateSession = (
    update: Parameters<typeof updateGuidedSession>[1],
  ) => updateGuidedSession(wisdom.id, update);

  const moveTo = (currentStage: GuidedWisdomStage) => {
    narrationService.stop();
    updateSession({ currentStage });
  };

  const handleBack = () => {
    if (stage === 'welcome') {
      onBack();
    } else if (stage === 'story') {
      if (sceneIndex > 0) {
        updateSession({ currentStoryScene: sceneIndex - 1 });
      } else {
        moveTo('welcome');
      }
    } else if (stage === 'talk') {
      updateSession({
        currentStage: 'story',
        currentStoryScene: wisdom.storyScenes.length - 1,
      });
    } else if (stage === 'choice') {
      moveTo('talk');
    } else if (stage === 'takeaway') {
      moveTo('choice');
    } else if (stage === 'practice') {
      moveTo('takeaway');
    }
  };

  const readScene = () => {
    const started = narrationService.read(scene.narrationText, {
      onStateChange: setNarrationStatus,
      onComplete: () => setNarrationStatus('idle'),
      onError: () => setNarrationStatus(
        narrationService.supported ? 'idle' : 'unavailable',
      ),
    });
    if (started) setHasNarratedScene(true);
  };

  const selectReflection = (choice: GuidedReflectionChoice) => {
    setPersonalDraft('');
    setPersonalSuggestionId(undefined);
    updateSession({
      selectedReflectionAnswer: choice.id,
      personalResponse: null,
      adaptiveResponse: '',
      personalizedSummary: '',
    });
  };

  const selectPersonalSuggestion = (suggestion: PersonalResponseSuggestion) => {
    setPersonalDraft('');
    setPersonalSuggestionId(suggestion.id);
    updateSession({
      personalResponse: { source: 'suggested', text: suggestion.label },
      adaptiveResponse: '',
      personalizedSummary: '',
    });
  };

  const changePersonalDraft = (value: string) => {
    setPersonalDraft(value);
    setPersonalSuggestionId(undefined);
    updateSession({
      personalResponse: value.trim()
        ? { source: 'typed', text: value }
        : null,
      adaptiveResponse: '',
      personalizedSummary: '',
    });
  };

  const submitPersonalResponse = (value: string) => {
    if (!selectedReflection) return;
    const selectedSuggestion = selectedReflection.suggestedResponses.find(
      (suggestion) => suggestion.id === personalSuggestionId,
    );
    const normalized = normalizePersonalResponse(
      value || selectedSuggestion?.label || '',
      wisdom.reflection.maxResponseLength,
    );
    if (!normalized) return;
    const source = selectedSuggestion ? 'suggested' : 'typed';
    updateSession({
      personalResponse: { source, text: normalized },
      adaptiveResponse: buildAdaptiveReflectionResponse({
        selectedReflectionAnswerId: selectedReflection.id,
        personalResponse: normalized,
        context: wisdom,
      }),
      personalizedSummary: '',
    });
  };

  const plan: MoneyPlan = {
    spend: session.spendAmount,
    save: session.saveAmount,
    give: session.giveAmount,
  };
  const planValidation = validateMoneyPlan(plan, wisdom.decision);

  const changeAmount = (category: MoneyDecisionCategoryId, amount: number) => {
    const nextPlan = { ...plan, [category]: amount };
    const nextTotal = nextPlan.spend + nextPlan.save + nextPlan.give;
    if (nextTotal > wisdom.decision.totalAmount || amount < 0) return;
    updateSession({
      [amountFieldByCategory[category]]: amount,
      moneyResponse: '',
      personalizedSummary: '',
    });
  };

  const evaluatePlan = () => {
    if (!planValidation.isValid) return;
    updateSession({
      moneyResponse: evaluateMoneyPlan(plan, wisdom.decision).message,
      personalizedSummary: '',
    });
  };

  const selectTakeaway = (suggestion: PersonalResponseSuggestion) => {
    setTakeawayDraft('');
    updateSession({
      selectedTakeaway: {
        source: 'suggested',
        choiceId: suggestion.id,
        text: suggestion.label,
      },
      personalizedSummary: '',
    });
  };

  const changeTakeaway = (value: string) => {
    setTakeawayDraft(value);
    updateSession({
      selectedTakeaway: value.trim()
        ? { source: 'typed', choiceId: undefined, text: value }
        : null,
      personalizedSummary: '',
    });
  };

  const submitTakeaway = (value: string) => {
    if (!selectedReflection || !session.personalResponse || !planValidation.isValid) {
      return;
    }
    const candidate = value || session.selectedTakeaway?.text || '';
    const normalized = normalizePersonalResponse(
      candidate,
      wisdom.takeaway.maxResponseLength,
    );
    if (!normalized) return;
    const existingChoice = wisdom.takeaway.choices.find(
      (choice) => choice.label === normalized,
    );
    const selectedTakeaway = existingChoice
      ? { source: 'suggested' as const, choiceId: existingChoice.id, text: normalized }
      : { source: 'typed' as const, text: normalized };
    updateSession({
      selectedTakeaway,
      personalizedSummary: buildPersonalizedSummary({
        selectedReflectionAnswerId: selectedReflection.id,
        personalResponse: session.personalResponse.text,
        moneyPlan: plan,
        takeaway: normalized,
        context: wisdom,
      }),
    });
  };

  const isRepeatCompletion = stage === 'completion' && (progress?.completionCount ?? 0) > 1;

  return (
    <GuidedWisdomScaffold
      completionLabel={isRepeatCompletion ? 'Reviewed again' : 'Learned'}
      learned={isLearned}
      onBack={stage === 'completion' ? undefined : handleBack}
      stage={stage}
      wisdomTitle={wisdom.title}
    >
      {stage === 'welcome' ? (
        <WelcomeStep
          isLearned={isLearned}
          lastSession={progress?.lastCompletedGuidedSession}
          onStart={() => moveTo('story')}
          onToggleLastPlan={() => setShowLastPlan((current) => !current)}
          showLastPlan={showLastPlan}
          wisdom={wisdom}
        />
      ) : null}

      {stage === 'story' ? (
        <>
          <View style={styles.storyStageHeading}>
            <StageHeading eyebrow="Leo’s story" title="One choice at a time" />
          </View>
          <View style={styles.storyCanvas}>
            <StorySceneCard
              illustration={<StoryMomentArtwork sceneIndex={sceneIndex} />}
              illustrationAccessibilityLabel={scene.visualLabel}
              sceneCount={wisdom.storyScenes.length}
              sceneNumber={sceneIndex + 1}
              text={scene.text}
              title={scene.visualLabel}
            />
            <NarrationControls
              hasPlayed={hasNarratedScene}
              onPause={() => narrationService.pause()}
              onRead={readScene}
              onReplay={readScene}
              onResume={() => narrationService.resume()}
              status={narrationStatus}
            />
          </View>
          <View style={styles.pairedActions}>
            <SecondaryButton
              icon="arrow-back"
              label="Previous"
              onPress={handleBack}
              style={styles.pairedButton}
            />
            <PrimaryButton
              icon="arrow-forward"
              label={sceneIndex === wisdom.storyScenes.length - 1 ? 'Talk with Cloud' : 'Continue'}
              onPress={() => {
                if (sceneIndex === wisdom.storyScenes.length - 1) moveTo('talk');
                else updateSession({ currentStoryScene: sceneIndex + 1 });
              }}
              style={styles.pairedButton}
            />
          </View>
        </>
      ) : null}

      {stage === 'talk' ? (
        <LinearGradient
          colors={[appColors.primarySoft, appColors.canvas]}
          end={{ x: 0.9, y: 1 }}
          start={{ x: 0.1, y: 0 }}
          style={[styles.stageCanvas, styles.conversationCanvas]}
        >
          <StageHeading eyebrow="Talk with Cloud" title="Think about waiting" />
          <CloudResponseCard text={wisdom.reflection.question} />
          <View accessibilityLabel="Reflection choices" accessibilityRole="radiogroup" style={styles.choiceList}>
            {wisdom.reflection.choices.map((choice) => (
              <View key={choice.id} style={styles.choiceCell}>
                <ReflectionChoiceCard
                  label={choice.label}
                  onPress={() => selectReflection(choice)}
                  selected={selectedReflection?.id === choice.id}
                />
              </View>
            ))}
          </View>
          {selectedReflection ? (
            <View style={styles.followUp}>
              <CloudResponseCard
                text={`${selectedReflection.cloudResponse} ${selectedReflection.followUpQuestion}`}
              />
              <View style={styles.responseInput}>
                <PersonalResponseInput
                  maxLength={wisdom.reflection.maxResponseLength}
                  onChangeText={changePersonalDraft}
                  onSelectSuggestion={selectPersonalSuggestion}
                  onSubmit={submitPersonalResponse}
                  placeholder="Tell Cloud in your own words"
                  selectedSuggestionId={personalSuggestionId}
                  submitLabel="Tell Cloud"
                  suggestions={selectedReflection.suggestedResponses}
                  value={personalDraft}
                />
              </View>
            </View>
          ) : null}
          {session.adaptiveResponse ? (
            <>
              <View style={styles.responseBlock}>
                <CloudResponseCard text={session.adaptiveResponse} />
              </View>
              <View style={styles.action}>
                <PrimaryButton label="Make Your Choice" onPress={() => moveTo('choice')} />
              </View>
            </>
          ) : null}
        </LinearGradient>
      ) : null}

      {stage === 'choice' ? (
        <LinearGradient
          colors={[appColors.warmGoldSoft, appColors.canvasSoft]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={[styles.stageCanvas, styles.moneyBoard]}
        >
          <StageHeading
            eyebrow="Your Choice"
            title="How should Leo divide 90 kr?"
            supporting="Move money in 10 kr steps. The amounts do not need to be equal."
          />
          <View style={styles.stepperList}>
            {wisdom.decision.categories.map((category) => {
              const amount = plan[category.id];
              const available = Math.max(0, wisdom.decision.totalAmount - planValidation.total);
              return (
                <MoneyAmountStepper
                  amount={amount}
                  disabled={Boolean(session.moneyResponse)}
                  icon={categoryIcons[category.id]}
                  key={category.id}
                  label={category.label}
                  maxAmount={Math.min(wisdom.decision.totalAmount, amount + available)}
                  onChange={(nextAmount) => changeAmount(category.id, nextAmount)}
                  supportingText={category.objectLabel}
                />
              );
            })}
          </View>
          <View style={[styles.totalCard, planValidation.isValid && styles.totalCardComplete]}>
            <AppText tone="secondary" variant="label">Money placed</AppText>
            <AppText accessibilityLiveRegion="polite" variant="sectionTitle">
              {planValidation.total} of {wisdom.decision.totalAmount} kr
            </AppText>
            <AppText style={styles.totalHint} tone={planValidation.isValid ? 'brand' : 'secondary'} variant="supporting">
              {planValidation.isValid
                ? 'Every krone has a place.'
                : `${wisdom.decision.totalAmount - planValidation.total} kr still needs a place.`}
            </AppText>
          </View>
          {!session.moneyResponse ? (
            <View style={styles.action}>
              <PrimaryButton disabled={!planValidation.isValid} label="See What Cloud Thinks" onPress={evaluatePlan} />
            </View>
          ) : (
            <View style={styles.responseBlock}>
              <CloudResponseCard text={session.moneyResponse} />
              <AppText style={styles.reviewQuestion} variant="sectionTitle">
                {wisdom.decision.reviewQuestion}
              </AppText>
              <View style={styles.pairedActions}>
                <SecondaryButton
                  label={wisdom.decision.changeLabel}
                  onPress={() => updateSession({
                    moneyResponse: '',
                    planDecision: 'changed',
                    planRevisionCount: session.planRevisionCount + 1,
                    personalizedSummary: '',
                  })}
                  style={styles.pairedButton}
                />
                <PrimaryButton
                  label={wisdom.decision.keepLabel}
                  onPress={() => updateSession({
                    currentStage: 'takeaway',
                    planDecision: session.planDecision === 'changed' ? 'changed' : 'kept',
                  })}
                  style={styles.pairedButton}
                />
              </View>
            </View>
          )}
        </LinearGradient>
      ) : null}

      {stage === 'takeaway' ? (
        <LinearGradient
          colors={[appColors.canvas, appColors.primarySoft]}
          end={{ x: 0.9, y: 1 }}
          start={{ x: 0.1, y: 0 }}
          style={[styles.stageCanvas, styles.reflectionCanvas]}
        >
          <View accessible={false} style={styles.reflectionMark}>
            <Ionicons color={appColors.warmGold} name="sparkles" size={spacing.s24} />
          </View>
          <View style={styles.reflectionHeading}>
            <StageHeading eyebrow="Takeaway" title={wisdom.takeaway.question} />
          </View>
          <CloudResponseCard text="Choose one thought that feels useful, or write your own." />
          <View style={styles.responseInput}>
            <PersonalResponseInput
              inputLabel="Or write your own thought"
              maxLength={wisdom.takeaway.maxResponseLength}
              onChangeText={changeTakeaway}
              onSelectSuggestion={selectTakeaway}
              onSubmit={submitTakeaway}
              placeholder="Write your own thought"
              selectedSuggestionId={session.selectedTakeaway?.choiceId}
              submitLabel="See What Cloud Remembered"
              suggestions={wisdom.takeaway.choices}
              suggestionsLabel="Choose a thought"
              value={takeawayDraft}
            />
          </View>
          {session.personalizedSummary ? (
            <>
              <View style={styles.responseBlock}>
                <CloudResponseCard text={session.personalizedSummary} />
              </View>
              <View style={styles.action}>
                <PrimaryButton label="Try It in Real Life" onPress={() => moveTo('practice')} />
              </View>
            </>
          ) : null}
        </LinearGradient>
      ) : null}

      {stage === 'practice' ? (
        <PracticeStep
          onComplete={() => completeGuidedWisdom(wisdom.id)}
          plan={plan}
          wisdom={wisdom}
        />
      ) : null}

      {stage === 'completion' ? (
        <CompletionStep
          isRepeat={isRepeatCompletion}
          onExit={onExit}
          session={session}
          wisdom={wisdom}
        />
      ) : null}
    </GuidedWisdomScaffold>
  );
}

function WelcomeStep({
  isLearned,
  lastSession,
  onStart,
  onToggleLastPlan,
  showLastPlan,
  wisdom,
}: {
  isLearned: boolean;
  lastSession?: GuidedWisdomSession;
  onStart: () => void;
  onToggleLastPlan: () => void;
  showLastPlan: boolean;
  wisdom: GuidedStoryWisdomContent;
}) {
  const problemLines = wisdom.introduction.split(/\n\s*\n/).filter(Boolean);
  return (
    <>
      <LinearGradient
        accessibilityLabel="Leo thinking about 90 kr, football cards, headphones, and a gift"
        accessible
        colors={[appColors.primarySoft, appColors.warmGoldSoft]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.welcomeArtworkFrame}
      >
        <View accessible={false} style={styles.welcomeGlow} />
        <View accessible={false} style={styles.welcomePropRail}>
          <WelcomeHeroProp icon="cash-outline" label="90 kr" prominent />
          <WelcomeHeroProp icon="football-outline" label="Cards" />
          <WelcomeHeroProp icon="headset-outline" label="Headphones" />
          <WelcomeHeroProp icon="gift-outline" label="Gift" />
        </View>
        <Image accessible={false} resizeMode="contain" source={leoHeroArtwork} style={styles.welcomeArtwork} />
      </LinearGradient>
      <SurfaceCard elevated style={styles.problemCard}>
        <View style={styles.problemEyebrow}>
          <View accessible={false} style={styles.problemIcon}>
            <Ionicons color={appColors.warmGold} name="git-branch-outline" size={spacing.s18} />
          </View>
          <AppText tone="brand" variant="label">Leo has a tricky choice</AppText>
        </View>
        {problemLines.map((line, index) => (
          <AppText
            key={line}
            style={index === problemLines.length - 1 ? styles.problemQuestion : styles.problemLine}
            variant={index === problemLines.length - 1 ? 'sectionTitle' : 'body'}
          >
            {line}
          </AppText>
        ))}
      </SurfaceCard>
      <View style={styles.ideaList}>
        {wisdom.learningOutcomes.map((idea, index) => (
          <View accessibilityLabel={idea} accessible key={idea} style={styles.ideaPill}>
            <View accessible={false} style={styles.ideaIcon}>
              <Ionicons accessible={false} color={appColors.primary} name={welcomeIdeaIcons[index] ?? 'sparkles-outline'} size={spacing.s22} />
            </View>
            <AppText style={styles.ideaLabel} variant="supporting">{idea}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.welcomeAction}>
        <PrimaryButton
          icon="book-outline"
          label={isLearned ? 'Review the Story' : wisdom.startButtonLabel}
          onPress={onStart}
        />
      </View>
      {isLearned && lastSession ? (
        <View style={styles.lastPlanAction}>
          <SecondaryButton
            icon={showLastPlan ? 'chevron-up' : 'time-outline'}
            label={showLastPlan ? 'Hide My Last Plan' : 'See My Last Plan'}
            onPress={onToggleLastPlan}
          />
          {showLastPlan ? <LastPlanCard session={lastSession} /> : null}
        </View>
      ) : null}
    </>
  );
}

function WelcomeHeroProp({
  icon,
  label,
  prominent = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  prominent?: boolean;
}) {
  return (
    <View style={[styles.welcomeProp, prominent && styles.welcomePropProminent]}>
      <Ionicons
        color={prominent ? appColors.onPrimary : appColors.primary}
        name={icon}
        size={prominent ? spacing.s22 : spacing.s18}
      />
      <AppText tone={prominent ? 'inverse' : 'brand'} variant={prominent ? 'cardTitle' : 'caption'}>
        {label}
      </AppText>
    </View>
  );
}

function LastPlanCard({ session }: { session: GuidedWisdomSession }) {
  return (
    <SurfaceCard style={styles.lastPlanCard} tone="soft">
      <AppText variant="cardTitle">Your last plan</AppText>
      <AppText style={styles.lastPlanAmounts} tone="secondary" variant="body">
        {session.spendAmount} kr for football cards · {session.saveAmount} kr for headphones · {session.giveAmount} kr for Mia
      </AppText>
      {session.selectedTakeaway?.text ? (
        <AppText style={styles.lastPlanTakeaway} tone="brand" variant="supporting">
          “{session.selectedTakeaway.text}”
        </AppText>
      ) : null}
    </SurfaceCard>
  );
}

function StoryMomentArtwork({ sceneIndex }: { sceneIndex: number }) {
  if (sceneIndex === 0) {
    return (
      <View style={[styles.storyMoment, styles.storyGreen]}>
        <Image accessible={false} resizeMode="contain" source={leoArtwork} style={styles.leoStoryImage} />
        <View style={styles.storyPropStack}>
          <PropBubble icon="cash-outline" label="90 kr" />
          <PropBubble icon="football-outline" label="Cards now" />
        </View>
      </View>
    );
  }
  if (sceneIndex === 1) {
    return (
      <View style={[styles.storyMoment, styles.storyGold]}>
        <Image accessible={false} resizeMode="contain" source={leoHeadphonesArtwork} style={styles.leoHeadphonesImage} />
        <View style={styles.goalWrap}>
          <AppText tone="gold" variant="label">HEADPHONE GOAL</AppText>
          <View style={styles.goalTrack}><View style={styles.goalFill} /></View>
          <AppText tone="secondary" variant="supporting">120 kr still to save</AppText>
        </View>
      </View>
    );
  }
  if (sceneIndex === 2) {
    return (
      <View style={[styles.storyMoment, styles.storyWarm]}>
        <View style={styles.giftWrap}>
          <Ionicons color={appColors.primary} name="gift-outline" size={spacing.s58} />
          <Ionicons color={appColors.warmGold} name="sparkles" size={spacing.s28} style={styles.giftSparkle} />
        </View>
        <View style={styles.saturdayTag}><AppText tone="brand" variant="label">MIA · SATURDAY</AppText></View>
      </View>
    );
  }
  if (sceneIndex === 3) {
    return (
      <View style={[styles.storyMoment, styles.storyGreen, styles.threeProps]}>
        <PropTile icon="football-outline" label="Cards" />
        <PropTile icon="headset-outline" label="Headphones" />
        <PropTile icon="gift-outline" label="Mia" />
      </View>
    );
  }
  if (sceneIndex === 4) {
    return (
      <View style={[styles.storyMoment, styles.storyGold]}>
        <Image accessible={false} resizeMode="contain" source={leoThinkingArtwork} style={styles.thinkingImage} />
        <View style={styles.pauseBubble}>
          <Ionicons color={appColors.warmGold} name="pause-circle-outline" size={spacing.s34} />
          <AppText tone="gold" variant="label">PAUSE AND THINK</AppText>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.storyMoment, styles.storyGreen, styles.planProps]}>
      <PlanProp amount="40" icon="football-outline" label="Cards" />
      <PlanProp amount="30" icon="headset-outline" label="Headphones" />
      <PlanProp amount="20" icon="gift-outline" label="Mia" />
    </View>
  );
}

function PropBubble({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.propBubble}>
      <Ionicons color={appColors.primary} name={icon} size={spacing.s24} />
      <AppText style={styles.propLabel} variant="label">{label}</AppText>
    </View>
  );
}

function PropTile({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.propTile}>
      <Ionicons color={appColors.primary} name={icon} size={spacing.s30} />
      <AppText style={styles.propTileLabel} variant="label">{label}</AppText>
    </View>
  );
}

function PlanProp({ amount, icon, label }: { amount: string; icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.planProp}>
      <Ionicons color={appColors.primary} name={icon} size={spacing.s24} />
      <AppText style={styles.planAmount} variant="cardTitle">{amount} kr</AppText>
      <AppText tone="secondary" variant="caption">{label}</AppText>
    </View>
  );
}

function PracticeStep({
  onComplete,
  plan,
  wisdom,
}: {
  onComplete: () => void;
  plan: MoneyPlan;
  wisdom: GuidedStoryWisdomContent;
}) {
  const practiceAction = getPracticeAction({ moneyPlan: plan, context: wisdom });
  return (
    <>
      <LinearGradient
        colors={[appColors.warmGoldSoft, appColors.primarySoft]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[styles.stageCanvas, styles.practiceCanvas]}
      >
        <StageHeading eyebrow="Practice" title={wisdom.practice.title} />
        <View style={styles.practiceVisual}>
          <View accessible={false} style={styles.practiceCloudHalo}>
            <Ionicons color={appColors.warmGold} name="cloud" size={spacing.s58} />
            <Ionicons color={appColors.warmGold} name="sparkles" size={spacing.s22} style={styles.practiceSparkle} />
          </View>
          <View accessible={false} style={styles.practicePath}>
            <View style={styles.practicePathDot} />
            <View style={styles.practicePathLine} />
            <View style={styles.practicePathDot} />
          </View>
          <View accessible={false} style={styles.practiceGoal}>
            <Ionicons color={appColors.primary} name="compass-outline" size={spacing.s34} />
          </View>
        </View>
        <View style={styles.practiceCard}>
          <View accessible={false} style={styles.practiceIcon}>
            <Ionicons color={appColors.warmGold} name="sparkles" size={spacing.s24} />
          </View>
          <AppText style={styles.practiceText} variant="cardTitle">
            {practiceAction}
          </AppText>
        </View>
        <View style={styles.practiceCloudResponse}>
          <CloudResponseCard text={wisdom.practice.encouragement} />
        </View>
      </LinearGradient>
      <View style={styles.action}>
        <PrimaryButton icon="checkmark-circle-outline" label="I’ll Try This" onPress={onComplete} />
      </View>
    </>
  );
}

function CompletionStep({
  isRepeat,
  onExit,
  session,
  wisdom,
}: {
  isRepeat: boolean;
  onExit: () => void;
  session: GuidedWisdomSession;
  wisdom: GuidedStoryWisdomContent;
}) {
  const completionMessage = buildCompletionRecognition({
    selectedReflectionAnswerId: session.selectedReflectionAnswer ?? 'not-sure',
    moneyPlan: {
      spend: session.spendAmount,
      save: session.saveAmount,
      give: session.giveAmount,
    },
    personalResponse: session.personalResponse?.text,
    takeaway: session.selectedTakeaway?.text,
    context: wisdom,
  });

  return (
    <View style={styles.completion}>
      <LinearGradient
        colors={[appColors.primarySoft, appColors.warmGoldSoft]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.completionHero}
      >
        <View accessible={false} style={styles.completionGlow} />
        <View accessibilityLabel="Cloud is proud of your thoughtful choice" accessible style={styles.completionArtworkFrame}>
          <Image accessible={false} resizeMode="contain" source={leoHeroArtwork} style={styles.completionArtwork} />
        </View>
        <View style={styles.completionCopy}>
          <View style={styles.completionStatus}>
            <Ionicons color={appColors.wisdomGreen} name="checkmark-circle" size={spacing.s18} />
            <AppText tone="brand" variant="label">{isRepeat ? 'Reviewed again' : 'Learned'}</AppText>
          </View>
          <AppText accessibilityRole="header" style={styles.completionTitle} variant="screenTitle">
            {isRepeat ? 'You practiced this Wisdom again' : 'You made a thoughtful choice'}
          </AppText>
          <AppText style={styles.completionMessage} tone="secondary" variant="body">
            {completionMessage}
          </AppText>
        </View>
      </LinearGradient>
      <SurfaceCard elevated style={styles.planSummary}>
        <View style={styles.planSummaryHeader}>
          <View accessible={false} style={styles.planSummaryIcon}>
            <Ionicons color={appColors.warmGold} name="wallet-outline" size={spacing.s22} />
          </View>
          <AppText accessibilityRole="header" variant="cardTitle">Your plan</AppText>
        </View>
        <View style={styles.planSummaryGrid}>
          <PlanSummaryTile icon="football-outline" label="Football cards" value={`${session.spendAmount} kr`} />
          <PlanSummaryTile icon="headset-outline" label="Headphones" value={`${session.saveAmount} kr`} />
          <PlanSummaryTile icon="gift-outline" label="Mia’s birthday" value={`${session.giveAmount} kr`} />
        </View>
        {session.selectedTakeaway?.text ? (
          <View style={styles.takeawaySummary}>
            <View style={styles.takeawaySummaryLabel}>
              <Ionicons color={appColors.primary} name="bookmark-outline" size={spacing.s18} />
              <AppText tone="muted" variant="caption">WHAT YOU WANT TO REMEMBER</AppText>
            </View>
            <AppText style={styles.takeawaySummaryText} variant="body">{session.selectedTakeaway.text}</AppText>
          </View>
        ) : null}
      </SurfaceCard>
      <View style={styles.action}>
        <PrimaryButton label="Back to Home" onPress={onExit} />
      </View>
    </View>
  );
}

function PlanSummaryTile({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View accessibilityLabel={`${label}: ${value}`} accessible style={styles.planSummaryTile}>
      <View accessible={false} style={styles.planSummaryTileIcon}>
        <Ionicons color={appColors.primary} name={icon} size={spacing.s20} />
      </View>
      <AppText style={styles.planSummaryTileValue} variant="cardTitle">{value}</AppText>
      <AppText style={styles.planSummaryTileLabel} tone="secondary" variant="caption">{label}</AppText>
    </View>
  );
}

function StageHeading({ eyebrow, supporting, title }: { eyebrow: string; supporting?: string; title: string }) {
  return (
    <View style={styles.stageHeading}>
      <AppText tone="brand" variant="label">{eyebrow}</AppText>
      <AppText accessibilityRole="header" style={styles.stageTitle} variant="sectionTitle">{title}</AppText>
      {supporting ? <AppText style={styles.stageSupporting} tone="secondary" variant="body">{supporting}</AppText> : null}
    </View>
  );
}

function getDisplaySession(progress?: WisdomProgress): GuidedWisdomSession {
  const defaults = createDefaultGuidedWisdomSession();
  return progress?.guidedSession ? { ...defaults, ...progress.guidedSession } : defaults;
}

const amountFieldByCategory = {
  spend: 'spendAmount',
  save: 'saveAmount',
  give: 'giveAmount',
} as const;

const categoryIcons: Record<MoneyDecisionCategoryId, keyof typeof Ionicons.glyphMap> = {
  spend: 'football-outline',
  save: 'headset-outline',
  give: 'gift-outline',
};

const styles = StyleSheet.create({
  stageHeading: { marginBottom: space.md },
  stageTitle: { marginTop: space.xxs },
  stageSupporting: { marginTop: space.xs },
  action: { marginTop: space.lg },
  pairedActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg },
  pairedButton: { flexBasis: 136, flexGrow: 1 },
  stageCanvas: {
    ...shadows.card,
    borderColor: appColors.border,
    borderRadius: radii.hero,
    borderWidth: 1,
    overflow: 'hidden',
    padding: space.lg,
  },
  conversationCanvas: { minHeight: 420 },
  reflectionCanvas: { minHeight: 420, position: 'relative' },
  reflectionHeading: { paddingRight: spacing.s58 },
  reflectionMark: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlaySoft,
    borderRadius: radii.round,
    height: spacing.s48,
    justifyContent: 'center',
    position: 'absolute',
    right: space.md,
    top: space.md,
    width: spacing.s48,
  },
  storyStageHeading: { paddingHorizontal: space.xs },
  storyCanvas: { width: '100%' },
  choiceList: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.md },
  choiceCell: { flexBasis: '47%', flexGrow: 1, minWidth: 0 },
  followUp: { marginTop: space.lg },
  responseInput: { marginTop: space.md },
  responseBlock: { marginTop: space.md },
  reviewQuestion: { marginTop: space.lg, textAlign: 'center' },
  stepperList: { gap: space.sm },
  moneyBoard: { minHeight: 520 },
  totalCard: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlaySoft,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: space.md,
    padding: space.md,
  },
  totalCardComplete: { backgroundColor: appColors.successSoft, borderColor: appColors.borderStrong },
  totalHint: { marginTop: space.xxs },
  welcomeArtworkFrame: {
    ...shadows.card,
    borderColor: appColors.border,
    borderRadius: radii.hero,
    borderWidth: 1,
    height: 256,
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeGlow: {
    backgroundColor: appColors.surfaceElevated,
    borderRadius: radii.round,
    height: 220,
    position: 'absolute',
    right: -space.xl,
    top: -space.lg,
    width: 220,
    opacity: 0.52,
  },
  welcomeArtwork: {
    bottom: -space.xs,
    height: '98%',
    position: 'absolute',
    right: -space.sm,
    width: '62%',
  },
  welcomePropRail: {
    gap: space.xs,
    left: space.md,
    position: 'absolute',
    top: space.md,
    width: '40%',
    zIndex: 2,
  },
  welcomeProp: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: appColors.surfaceOverlay,
    borderColor: appColors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space.xs,
    minHeight: spacing.s42,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  welcomePropProminent: {
    ...shadows.subtle,
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
    minHeight: spacing.s52,
  },
  problemCard: { marginTop: space.md, padding: space.lg },
  problemEyebrow: { alignItems: 'center', flexDirection: 'row', gap: space.xs },
  problemIcon: {
    alignItems: 'center',
    backgroundColor: appColors.warmGoldSoft,
    borderRadius: radii.round,
    height: spacing.s34,
    justifyContent: 'center',
    width: spacing.s34,
  },
  problemLine: { marginTop: space.sm },
  problemQuestion: { marginTop: space.md },
  ideaList: { flexDirection: 'row', gap: space.xs, marginTop: space.md },
  ideaPill: {
    alignItems: 'center',
    backgroundColor: appColors.surface,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: spacing.s116,
    minWidth: 0,
    paddingHorizontal: space.xs,
    paddingVertical: space.md,
  },
  ideaIcon: {
    alignItems: 'center',
    backgroundColor: appColors.primarySoft,
    borderRadius: radii.round,
    height: spacing.s42,
    justifyContent: 'center',
    width: spacing.s42,
  },
  ideaLabel: {
    flexShrink: 1,
    fontWeight: typography.weight.bold,
    marginTop: space.sm,
    textAlign: 'center',
  },
  welcomeAction: { alignSelf: 'center', marginTop: space.lg, maxWidth: 340, width: '100%' },
  lastPlanAction: { gap: space.sm, marginTop: space.sm },
  lastPlanCard: { padding: space.md },
  lastPlanAmounts: { marginTop: space.sm },
  lastPlanTakeaway: { marginTop: space.sm },
  storyMoment: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 224,
    overflow: 'hidden',
    padding: space.lg,
    width: '100%',
  },
  storyGreen: { backgroundColor: appColors.primarySoft },
  storyGold: { backgroundColor: appColors.warmGoldSoft },
  storyWarm: { backgroundColor: appColors.cautionSoft },
  leoStoryImage: { height: 194, width: '48%' },
  leoHeadphonesImage: { height: 196, marginLeft: -space.sm, width: '43%' },
  storyPropStack: { gap: space.sm, width: '44%' },
  propBubble: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    padding: space.sm,
  },
  propLabel: { marginLeft: space.xs },
  goalWrap: { flex: 1 },
  goalTrack: { backgroundColor: appColors.surfaceElevated, borderRadius: radii.round, height: spacing.s14, marginVertical: space.sm, overflow: 'hidden' },
  goalFill: { backgroundColor: appColors.warmGold, borderRadius: radii.round, height: '100%', width: '44%' },
  giftWrap: { position: 'relative' },
  giftSparkle: { position: 'absolute', right: -space.lg, top: -space.sm },
  saturdayTag: { backgroundColor: appColors.surfaceElevated, borderRadius: radii.round, marginLeft: space.xxl, paddingHorizontal: space.md, paddingVertical: space.sm },
  threeProps: { gap: space.sm },
  propTile: { alignItems: 'center', backgroundColor: appColors.surfaceElevated, borderRadius: radii.large, flex: 1, minHeight: spacing.s92, justifyContent: 'center', padding: space.sm },
  propTileLabel: { marginTop: space.xs, textAlign: 'center' },
  thinkingImage: { height: 198, marginLeft: -space.sm, width: '48%' },
  pauseBubble: { alignItems: 'center', backgroundColor: appColors.surfaceElevated, borderRadius: radii.large, gap: space.xs, padding: space.md },
  planProps: { gap: space.xs },
  planProp: { alignItems: 'center', backgroundColor: appColors.surfaceElevated, borderRadius: radii.large, flex: 1, padding: space.sm },
  planAmount: { marginTop: space.xs },
  practiceCanvas: { minHeight: 500 },
  practiceVisual: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', minHeight: 130 },
  practiceCloudHalo: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlaySoft,
    borderColor: appColors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s92,
    justifyContent: 'center',
    position: 'relative',
    width: spacing.s92,
  },
  practiceSparkle: { position: 'absolute', right: -space.xs, top: space.xs },
  practicePath: { alignItems: 'center', flex: 1, flexDirection: 'row', marginHorizontal: space.xs },
  practicePathDot: { backgroundColor: appColors.warmGold, borderRadius: radii.round, height: space.xs, width: space.xs },
  practicePathLine: { borderStyle: 'dashed', borderTopColor: appColors.warmGold, borderTopWidth: 2, flex: 1 },
  practiceGoal: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlaySoft,
    borderColor: appColors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s76,
    justifyContent: 'center',
    width: spacing.s76,
  },
  practiceCard: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlay,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    padding: space.lg,
  },
  practiceIcon: { alignItems: 'center', backgroundColor: appColors.warmGoldSoft, borderRadius: radii.round, height: spacing.s48, justifyContent: 'center', width: spacing.s48 },
  practiceText: { marginTop: space.md, textAlign: 'center' },
  practiceCloudResponse: { marginTop: space.lg },
  completion: { alignItems: 'stretch' },
  completionHero: {
    ...shadows.card,
    borderColor: appColors.border,
    borderRadius: radii.hero,
    borderWidth: 1,
    minHeight: 326,
    overflow: 'hidden',
    position: 'relative',
  },
  completionGlow: {
    backgroundColor: appColors.surfaceElevated,
    borderRadius: radii.round,
    bottom: -space.xxl,
    height: 230,
    position: 'absolute',
    right: -space.xxl,
    width: 230,
    opacity: 0.5,
  },
  completionArtworkFrame: { bottom: -space.sm, height: '88%', position: 'absolute', right: -space.md, width: '49%' },
  completionArtwork: { height: '100%', width: '100%' },
  completionCopy: { padding: space.lg, width: '68%', zIndex: 2 },
  completionStatus: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: appColors.surfaceOverlay, borderColor: appColors.border, borderRadius: radii.round, borderWidth: 1, flexDirection: 'row', gap: space.xxs, paddingHorizontal: space.sm, paddingVertical: space.xs },
  completionTitle: { fontSize: typography.size.heroCard, lineHeight: 32, marginTop: space.lg, textAlign: 'left' },
  completionMessage: { marginTop: space.sm, textAlign: 'left' },
  planSummary: { marginTop: space.lg, padding: space.lg },
  planSummaryHeader: { alignItems: 'center', flexDirection: 'row', gap: space.sm },
  planSummaryIcon: { alignItems: 'center', backgroundColor: appColors.warmGoldSoft, borderRadius: radii.medium, height: spacing.s42, justifyContent: 'center', width: spacing.s42 },
  planSummaryGrid: { flexDirection: 'row', gap: space.xs, marginTop: space.md },
  planSummaryTile: { alignItems: 'center', backgroundColor: appColors.surfaceSoft, borderRadius: radii.medium, flex: 1, minWidth: 0, paddingHorizontal: space.xs, paddingVertical: space.sm },
  planSummaryTileIcon: { alignItems: 'center', backgroundColor: appColors.surfaceElevated, borderRadius: radii.round, height: spacing.s38, justifyContent: 'center', width: spacing.s38 },
  planSummaryTileValue: { marginTop: space.xs, textAlign: 'center' },
  planSummaryTileLabel: { marginTop: space.xxs, textAlign: 'center' },
  takeawaySummary: { backgroundColor: appColors.primarySoft, borderRadius: radii.medium, marginTop: space.md, padding: space.md },
  takeawaySummaryLabel: { alignItems: 'center', flexDirection: 'row', gap: space.xs },
  takeawaySummaryText: { marginTop: space.xs },
});
