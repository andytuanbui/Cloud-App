import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  CloudResponseCard,
  GuidedWisdomScaffold,
  LearnedBadge,
  MoneyAmountStepper,
  NarrationControls,
  type NarrationStatus,
  PersonalResponseInput,
  type PersonalResponseSuggestion,
  ReflectionChoiceCard,
  StageHeading,
  StorySceneCard,
  WisdomDestinationTile,
  WisdomHeroCanvas,
  WisdomObjectBadge,
} from '../../components/wisdom/guided';
import {
  AppText,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
} from '../../components/ui';
import { cloudGuideAssets } from '../../content/characterAssets';
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

/**
 * Cloud is the guide, not the child in the story. Leo has no artwork yet, so his
 * scenes are composed object-led — see src/content/characterAssets.ts.
 */
const cloudHero = cloudGuideAssets.hero;

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
            <View style={[styles.pairedActions, styles.storyNavigation]}>
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
          </View>
        </>
      ) : null}

      {stage === 'talk' ? (
        <LinearGradient
          colors={[appColors.wisdomCream, appColors.primarySoft]}
          end={{ x: 0.9, y: 1 }}
          start={{ x: 0.1, y: 0 }}
          style={[styles.stageCanvas, styles.conversationCanvas]}
        >
          <View style={styles.talkHeader}>
            <View style={styles.talkHeading}>
              <StageHeading eyebrow="Talk with Cloud" title="Think about waiting" />
            </View>
            <Image
              accessibilityLabel="Cloud, your guide"
              accessible
              resizeMode="contain"
              source={cloudHero}
              style={styles.talkCloud}
            />
          </View>
          <CloudResponseCard text={wisdom.reflection.question} />
          <View accessibilityLabel="Reflection choices" accessibilityRole="radiogroup" style={styles.choiceList}>
            {wisdom.reflection.choices.map((choice) => (
              <View key={choice.id} style={styles.choiceCell}>
                <ReflectionChoiceCard
                  icon={reflectionChoiceIcons[choice.id] ?? 'chatbubble-outline'}
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
          <View style={styles.moneyBoardHeader}>
            <View style={styles.moneyBoardHeading}>
              <StageHeading
                eyebrow="Your Choice"
                title="How should Leo divide 90 kr?"
                supporting="Move money in 10 kr steps. The amounts do not need to be equal."
              />
            </View>
            <View accessible={false} style={styles.moneyBoardTotal}>
              <AppText style={styles.moneyBoardTotalValue} variant="screenTitle">
                90
              </AppText>
              <AppText tone="secondary" variant="caption">
                KRONER
              </AppText>
            </View>
          </View>
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
                  tone={category.id}
                  totalAmount={wisdom.decision.totalAmount}
                />
              );
            })}
          </View>
          <LinearGradient
            colors={planValidation.isValid
              ? [appColors.primary, appColors.wisdomNight]
              : [appColors.surfaceOverlay, appColors.surfaceSoft]}
            style={[styles.totalCard, planValidation.isValid && styles.totalCardComplete]}
          >
            <View accessible={false} style={styles.totalSparkles}>
              <Ionicons accessible={false} color={appColors.wisdomGoldBright} name="sparkles" size={spacing.s18} />
              <Ionicons accessible={false} color={appColors.wisdomGoldBright} name="sparkles" size={spacing.s15} />
            </View>
            <AppText tone={planValidation.isValid ? 'inverse' : 'secondary'} variant="label">Money placed</AppText>
            <AppText accessibilityLiveRegion="polite" tone={planValidation.isValid ? 'inverse' : 'primary'} variant="sectionTitle">
              {planValidation.total} of {wisdom.decision.totalAmount} kr
            </AppText>
            <AppText style={styles.totalHint} tone={planValidation.isValid ? 'inverse' : 'secondary'} variant="supporting">
              {planValidation.isValid
                ? 'Every krone has a place.'
                : `${wisdom.decision.totalAmount - planValidation.total} kr still needs a place.`}
            </AppText>
          </LinearGradient>
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
              compact
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
              <MemoryCard text={session.personalizedSummary} />
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
  const closingQuestion = problemLines[problemLines.length - 1];
  const supportingLines = problemLines.slice(1, -1);
  return (
    <>
      <LinearGradient
        colors={[appColors.wisdomNight, appColors.wisdomNightDeep]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.welcomeCanvas}
      >
        <WisdomHeroCanvas
          artworkAccessibilityLabel="Ninety kroner beside football cards, headphones, and a wrapped gift for Mia"
          height={330}
          style={styles.welcomeStage}
        >
          <View style={styles.welcomeStageTop}>
            <View style={styles.welcomeKicker}>
              <Ionicons
                accessible={false}
                color={appColors.wisdomGoldBright}
                name="sparkles"
                size={spacing.s15}
              />
              <AppText style={styles.welcomeKickerLabel} tone="inverse" variant="label">
                A money choice for Leo
              </AppText>
            </View>
          </View>

          <View accessible={false} pointerEvents="none" style={styles.welcomeObjects}>
            <View style={styles.welcomeCoin}>
              <Ionicons
                accessible={false}
                color={appColors.wisdomGoldBright}
                name="cash-outline"
                size={spacing.s58}
              />
            </View>
            <View style={styles.welcomeObjectRow}>
              <WisdomObjectBadge
                icon="football-outline"
                label="Spend now"
                tone="solid"
                value="Football cards"
              />
            </View>
            <View style={[styles.welcomeObjectRow, styles.welcomePropOffset]}>
              <WisdomObjectBadge
                icon="headset-outline"
                label="Save for later"
                tone="solid"
                value="Headphones"
              />
            </View>
            <View style={styles.welcomeObjectRow}>
              <WisdomObjectBadge
                icon="gift-outline"
                label="Give or help"
                tone="solid"
                value="Mia's birthday"
              />
            </View>
          </View>

          <View style={styles.welcomeHeadline}>
            <View style={styles.welcomeHeadlineRow}>
              <AppText style={styles.welcomeHeadlineText} tone="inverse" variant="screenTitle">
                Leo has{' '}
              </AppText>
              <AppText style={styles.welcomeAmountNumber} tone="inverse" variant="screenTitle">
                90 kr.
              </AppText>
            </View>
          </View>
        </WisdomHeroCanvas>

        <View style={styles.welcomeBody}>
          {supportingLines.map((line) => (
            <AppText key={line} style={styles.problemLine} tone="inverse" variant="body">
              {line}
            </AppText>
          ))}
          <AppText
            accessibilityRole="header"
            style={styles.problemQuestion}
            tone="inverse"
            variant="sectionTitle"
          >
            {closingQuestion}
          </AppText>

          <View style={styles.ideaList}>
            {wisdom.learningOutcomes.map((idea, index) => (
              <WisdomDestinationTile
                icon={welcomeIdeaIcons[index] ?? 'sparkles-outline'}
                key={idea}
                title={idea}
              />
            ))}
          </View>

          <View style={styles.welcomeAction}>
            <PrimaryButton
              icon="book-outline"
              label={isLearned ? 'Review the Story' : wisdom.startButtonLabel}
              onPress={onStart}
            />
          </View>
        </View>
      </LinearGradient>
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

/**
 * Leo's six story beats, composed object-led.
 *
 * Leo has no artwork yet (see src/content/characterAssets.ts) and Cloud's
 * artwork must not stand in for him, so each scene is carried by the objects
 * that matter in the story: the money, the cards, the headphones, the gift.
 */
function StoryMomentArtwork({ sceneIndex }: { sceneIndex: number }) {
  if (sceneIndex === 0) {
    return (
      <LinearGradient colors={[appColors.wisdomNight, appColors.wisdomNightDeep]} style={styles.storyMoment}>
        <View accessible={false} style={styles.storyGoldOrb} />
        <StoryVisualLabel label="MONEY AND FOOTBALL CARDS" />
        <View style={styles.sceneStage}>
          <View style={styles.amountDisc}>
            <AppText style={styles.amountDiscValue} tone="inverse" variant="screenTitle">
              90
            </AppText>
            <AppText tone="inverse" variant="caption">
              KRONER
            </AppText>
          </View>
          <View accessible={false} style={styles.cardFan}>
            <View style={[styles.cardTile, styles.cardTileBack]} />
            <View style={[styles.cardTile, styles.cardTileMid]} />
            <View style={[styles.cardTile, styles.cardTileFront]}>
              <Ionicons color={appColors.wisdomGoldBright} name="football" size={spacing.s34} />
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }
  if (sceneIndex === 1) {
    return (
      <LinearGradient colors={['#A97127', appColors.wisdomNight]} end={{ x: 1, y: 1 }} style={styles.storyMoment}>
        <StoryVisualLabel label="SAVING FOR SOMETHING BIGGER" />
        <View style={styles.sceneStage}>
          <View accessible={false} style={styles.objectDisc}>
            <Ionicons color={appColors.wisdomGoldBright} name="headset" size={spacing.s58} />
          </View>
          <View style={styles.goalWrap}>
            <AppText tone="inverse" variant="label">HEADPHONE GOAL</AppText>
            <View style={styles.goalTrack}>
              <View style={styles.goalFill} />
            </View>
            <AppText tone="inverse" variant="supporting">120 kr still to save</AppText>
          </View>
        </View>
      </LinearGradient>
    );
  }
  if (sceneIndex === 2) {
    return (
      <LinearGradient colors={['#5A3B22', appColors.wisdomNightDeep]} end={{ x: 1, y: 1 }} style={styles.storyMoment}>
        <View accessible={false} style={styles.storyGoldOrb} />
        <StoryVisualLabel label="MIA'S BIRTHDAY" />
        <View style={styles.sceneStage}>
          <View style={styles.giftWrap}>
            <Ionicons color={appColors.wisdomGoldBright} name="gift" size={spacing.s76} />
            <Ionicons
              color={appColors.wisdomGoldBright}
              name="sparkles"
              size={spacing.s28}
              style={styles.giftSparkle}
            />
          </View>
          <View style={styles.saturdayTag}>
            <AppText tone="inverse" variant="label">MIA · SATURDAY</AppText>
          </View>
        </View>
      </LinearGradient>
    );
  }
  if (sceneIndex === 3) {
    return (
      <LinearGradient colors={[appColors.wisdomNightSoft, appColors.wisdomNightDeep]} style={[styles.storyMoment, styles.threeProps]}>
        <StoryVisualLabel label="THREE WAYS TO USE MONEY" />
        <PropTile icon="football-outline" label="Cards" />
        <PropTile icon="headset-outline" label="Headphones" />
        <PropTile icon="gift-outline" label="Mia" />
      </LinearGradient>
    );
  }
  if (sceneIndex === 4) {
    return (
      <LinearGradient colors={['#493E61', appColors.wisdomNightDeep]} end={{ x: 1, y: 1 }} style={styles.storyMoment}>
        <StoryVisualLabel label="A SMALL PAUSE" />
        <View style={styles.sceneStage}>
          <View accessible={false} style={styles.shopFront}>
            <View style={styles.shopAwning} />
            <Ionicons color={appColors.wisdomGoldBright} name="storefront-outline" size={spacing.s52} />
            <AppText style={styles.shopLabel} tone="inverse" variant="caption">THE SHOP</AppText>
          </View>
          <View style={styles.pauseBubble}>
            <Ionicons color={appColors.wisdomGoldBright} name="pause-circle-outline" size={spacing.s34} />
            <AppText style={styles.pauseBubbleLabel} tone="inverse" variant="label">PAUSE AND THINK</AppText>
          </View>
        </View>
      </LinearGradient>
    );
  }
  return (
    <LinearGradient colors={[appColors.wisdomNight, '#276657']} style={[styles.storyMoment, styles.planProps]}>
      <StoryVisualLabel label="A PLAN WITH ROOM FOR EACH CHOICE" />
      <PlanProp amount="40" icon="football-outline" label="Cards" />
      <PlanProp amount="30" icon="headset-outline" label="Headphones" />
      <PlanProp amount="20" icon="gift-outline" label="Mia" />
    </LinearGradient>
  );
}

function StoryVisualLabel({ dark = false, label }: { dark?: boolean; label: string }) {
  return (
    <View style={[styles.storyVisualLabel, dark && styles.storyVisualLabelLight]}>
      <AppText tone={dark ? 'brand' : 'inverse'} variant="caption">LEO'S STORY</AppText>
      <AppText style={styles.storyVisualLabelText} tone={dark ? 'primary' : 'inverse'} variant="label">{label}</AppText>
    </View>
  );
}

function PropTile({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.propTile}>
      <Ionicons color={appColors.wisdomGoldBright} name={icon} size={spacing.s30} />
      <AppText style={styles.propTileLabel} tone="inverse" variant="label">{label}</AppText>
    </View>
  );
}

function PlanProp({ amount, icon, label }: { amount: string; icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.planProp}>
      <Ionicons color={appColors.wisdomGoldBright} name={icon} size={spacing.s24} />
      <AppText style={styles.planAmount} tone="inverse" variant="cardTitle">{amount} kr</AppText>
      <AppText tone="inverse" variant="caption">{label}</AppText>
    </View>
  );
}

function MemoryCard({ text }: { text: string }) {
  return (
    <LinearGradient
      colors={[appColors.primary, appColors.wisdomNight]}
      style={styles.memoryCard}
    >
      <View accessible={false} style={styles.memoryCardIcon}>
        <Ionicons accessible={false} color={appColors.wisdomGoldBright} name="bookmark" size={spacing.s22} />
      </View>
      <View accessibilityLabel={`Cloud remembered: ${text}`} accessibilityLiveRegion="polite" accessible style={styles.memoryCardCopy}>
        <AppText tone="inverse" variant="label">CLOUD REMEMBERED</AppText>
        <AppText style={styles.memoryCardText} tone="inverse" variant="cardTitle">{text}</AppText>
      </View>
    </LinearGradient>
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
    <LinearGradient
      colors={[appColors.wisdomNight, '#3C7568']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[styles.stageCanvas, styles.practiceCanvas]}
    >
      <StageHeading eyebrow="Practice" inverse title={wisdom.practice.title} />
      <View
        accessibilityLabel="Cloud stands beside symbols for pausing, money, and thinking of other people"
        accessible
        style={styles.practiceVisual}
      >
        <View accessible={false} style={styles.practiceGlow} />
        <Image accessible={false} resizeMode="contain" source={cloudHero} style={styles.practiceLeo} />
        <View accessible={false} style={[styles.practiceSymbol, styles.practiceSymbolPause]}>
          <Ionicons color={appColors.wisdomGoldBright} name="pause" size={spacing.s24} />
        </View>
        <View accessible={false} style={[styles.practiceSymbol, styles.practiceSymbolMoney]}>
          <Ionicons color={appColors.primary} name="cash-outline" size={spacing.s24} />
        </View>
        <View accessible={false} style={[styles.practiceSymbol, styles.practiceSymbolPeople]}>
          <Ionicons color={appColors.primary} name="people-outline" size={spacing.s24} />
        </View>
      </View>
      <View style={styles.practiceCard}>
        <View accessible={false} style={styles.practiceIcon}>
          <Ionicons color={appColors.wisdomGoldBright} name="sparkles" size={spacing.s24} />
        </View>
        <View style={styles.practiceCardCopy}>
          <AppText tone="brand" variant="label">ONE SMALL ACTION</AppText>
          <AppText style={styles.practiceText} variant="cardTitle">{practiceAction}</AppText>
        </View>
      </View>
      <View style={styles.practiceCloudResponse}>
        <CloudResponseCard text={wisdom.practice.encouragement} />
      </View>
      <View style={styles.action}>
        <PrimaryButton icon="checkmark-circle-outline" label="I’ll Try This" onPress={onComplete} />
      </View>
    </LinearGradient>
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
    <LinearGradient
      colors={['#6F4A2D', appColors.wisdomNight, appColors.wisdomNightDeep]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.completionCanvas}
    >
      <View accessible={false} style={styles.completionGlow} />
      <View accessible={false} style={styles.completionSparkles}>
        <Ionicons accessible={false} color={appColors.wisdomGoldBright} name="sparkles" size={spacing.s24} />
        <Ionicons accessible={false} color={appColors.wisdomGoldBright} name="sparkles" size={spacing.s15} />
      </View>
      <View style={styles.completionHero}>
        <View accessibilityLabel="Cloud celebrates a thoughtful money plan" accessible style={styles.completionArtworkFrame}>
          <Image accessible={false} resizeMode="contain" source={cloudHero} style={styles.completionArtwork} />
        </View>
        <View style={styles.completionCopy}>
          <View style={styles.completionStatus}>
            <Ionicons accessible={false} color={appColors.wisdomGoldBright} name="checkmark-circle" size={spacing.s18} />
            <AppText tone="inverse" variant="label">{isRepeat ? 'Reviewed again' : 'Learned'}</AppText>
          </View>
          <AppText accessibilityRole="header" style={styles.completionTitle} tone="inverse" variant="screenTitle">
            {isRepeat ? 'You practiced this Wisdom again' : 'You made a thoughtful choice'}
          </AppText>
          <AppText style={styles.completionMessage} tone="inverse" variant="body">
            {completionMessage}
          </AppText>
        </View>
      </View>
      <View style={styles.planSummary}>
        <View style={styles.planSummaryHeader}>
          <View accessible={false} style={styles.planSummaryIcon}>
            <Ionicons accessible={false} color={appColors.wisdomGoldBright} name="wallet-outline" size={spacing.s22} />
          </View>
          <AppText accessibilityRole="header" tone="inverse" variant="cardTitle">Your plan</AppText>
        </View>
        <View style={styles.planSummaryGrid}>
          <PlanSummaryTile icon="football-outline" label="Football cards" value={`${session.spendAmount} kr`} />
          <PlanSummaryTile icon="headset-outline" label="Headphones" value={`${session.saveAmount} kr`} />
          <PlanSummaryTile icon="gift-outline" label="Mia’s birthday" value={`${session.giveAmount} kr`} />
        </View>
        {session.selectedTakeaway?.text ? (
          <View style={styles.takeawaySummary}>
            <View style={styles.takeawaySummaryLabel}>
              <Ionicons accessible={false} color={appColors.wisdomGoldBright} name="bookmark-outline" size={spacing.s18} />
              <AppText tone="inverse" variant="caption">WHAT YOU WANT TO REMEMBER</AppText>
            </View>
            <AppText style={styles.takeawaySummaryText} tone="inverse" variant="body">{session.selectedTakeaway.text}</AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.action}>
        <PrimaryButton icon="home" label="Back to Home" onPress={onExit} />
      </View>
    </LinearGradient>
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
        <Ionicons accessible={false} color={appColors.primary} name={icon} size={spacing.s20} />
      </View>
      <AppText style={styles.planSummaryTileValue} tone="inverse" variant="cardTitle">{value}</AppText>
      <AppText style={styles.planSummaryTileLabel} tone="inverse" variant="caption">{label}</AppText>
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

const reflectionChoiceIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'yes-many-times': 'happy-outline',
  sometimes: 'time-outline',
  no: 'sparkles-outline',
  'not-sure': 'help-circle-outline',
};

const styles = StyleSheet.create({
  stageHeading: { marginBottom: space.md },
  stageTitle: { marginTop: space.xxs },
  stageSupporting: { marginTop: space.xs },
  action: { marginTop: space.md },
  pairedActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg },
  pairedButton: { flexBasis: 136, flexGrow: 1 },
  stageCanvas: {
    ...shadows.card,
    borderColor: appColors.border,
    borderRadius: radii.hero,
    borderWidth: 1,
    overflow: 'hidden',
    padding: space.md,
  },
  conversationCanvas: { minHeight: 420, padding: space.md },
  talkHeader: {
    flexDirection: 'row',
    marginBottom: space.xs,
    marginTop: -space.xs,
    minHeight: spacing.s92,
  },
  talkHeading: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingRight: space.xs,
  },
  talkCloud: {
    alignSelf: 'flex-end',
    height: spacing.s116,
    marginBottom: -space.sm,
    marginRight: -space.xs,
    width: spacing.s76,
  },
  reflectionCanvas: { minHeight: 420, padding: space.md, position: 'relative' },
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
  storyCanvas: {
    ...shadows.card,
    backgroundColor: appColors.wisdomCream,
    borderColor: appColors.border,
    borderRadius: radii.hero,
    borderWidth: 1,
    overflow: 'hidden',
    padding: space.xs,
    width: '100%',
  },
  storyNavigation: {
    borderTopColor: appColors.border,
    borderTopWidth: 1,
    marginHorizontal: space.sm,
    marginTop: space.md,
    paddingBottom: space.sm,
    paddingTop: space.md,
  },
  choiceList: { gap: space.xs, marginTop: space.md },
  choiceCell: { minWidth: 0, width: '100%' },
  followUp: { marginTop: space.lg },
  responseInput: { marginTop: space.md },
  responseBlock: { marginTop: space.md },
  reviewQuestion: { marginTop: space.lg, textAlign: 'center' },
  stepperList: { gap: space.sm },
  moneyBoard: { minHeight: 520, padding: space.md },
  moneyBoardHeader: {
    flexDirection: 'row',
    marginBottom: space.xs,
    marginTop: -space.xs,
    minHeight: spacing.s116,
  },
  moneyBoardHeading: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingRight: space.xs,
  },
  totalCard: {
    alignItems: 'center',
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: space.md,
    overflow: 'hidden',
    padding: space.md,
    position: 'relative',
  },
  totalCardComplete: { borderColor: appColors.wisdomLine },
  totalSparkles: {
    flexDirection: 'row',
    gap: space.xxs,
    justifyContent: 'space-between',
    left: space.md,
    position: 'absolute',
    right: space.md,
    top: space.sm,
  },
  totalHint: { marginTop: space.xxs },
  welcomeCanvas: {
    ...shadows.card,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.hero,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeStage: {
    borderBottomColor: appColors.wisdomLine,
    borderBottomWidth: 1,
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
  },
  welcomeStageTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  welcomeKicker: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: space.xs,
    minWidth: 0,
  },
  welcomeKickerLabel: {
    flexShrink: 1,
    minWidth: 0,
  },
  welcomeObjects: {
    alignItems: 'flex-start',
    gap: space.xs,
    maxWidth: '78%',
    position: 'relative',
  },
  welcomeObjectRow: {
    alignItems: 'flex-start',
  },
  welcomeCoin: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s92,
    justifyContent: 'center',
    position: 'absolute',
    right: -spacing.s76,
    top: -space.xs,
    width: spacing.s92,
  },
  welcomePropOffset: {
    marginLeft: space.sm,
  },
  welcomeHeadline: {
    marginTop: space.xs,
  },
  welcomeHeadlineRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  welcomeHeadlineText: {
    fontSize: typography.size.heroCard,
    lineHeight: 34,
  },
  welcomeAmountNumber: {
    color: appColors.wisdomGoldBright,
    fontSize: 34,
    lineHeight: 40,
  },
  welcomeBody: {
    padding: space.md,
  },
  problemLine: { marginTop: space.sm, opacity: 0.92 },
  problemQuestion: { marginTop: space.md },
  ideaList: { flexDirection: 'row', gap: space.xs, marginTop: space.lg },
  welcomeAction: { alignSelf: 'center', marginTop: space.lg, maxWidth: 340, width: '100%' },
  lastPlanAction: { gap: space.sm, marginTop: space.sm },
  lastPlanCard: { padding: space.md },
  lastPlanAmounts: { marginTop: space.sm },
  lastPlanTakeaway: { marginTop: space.sm },
  storyMoment: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 286,
    overflow: 'hidden',
    padding: space.md,
    paddingTop: spacing.s62,
    position: 'relative',
    width: '100%',
  },
  storyVisualLabel: {
    backgroundColor: appColors.wisdomGlass,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.medium,
    borderWidth: 1,
    left: space.md,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    position: 'absolute',
    right: space.md,
    top: space.md,
    zIndex: 4,
  },
  storyVisualLabelLight: {
    backgroundColor: appColors.surfaceOverlaySoft,
    borderColor: appColors.border,
  },
  storyVisualLabelText: { marginTop: space.xxs },
  storyGoldOrb: {
    backgroundColor: appColors.wisdomGoldGlow,
    borderRadius: radii.round,
    height: 220,
    position: 'absolute',
    right: -space.xxl,
    top: spacing.s48,
    width: 220,
  },
  storyPropStack: { gap: space.sm, marginRight: 'auto', maxWidth: '52%', zIndex: 2 },
  propBubble: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    padding: space.sm,
  },
  propLabel: { marginLeft: space.xs },
  goalWrap: { flexShrink: 1, minWidth: 0, zIndex: 2 },
  goalIcon: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlass,
    borderRadius: radii.round,
    height: spacing.s52,
    justifyContent: 'center',
    marginBottom: space.sm,
    width: spacing.s52,
  },
  goalTrack: { backgroundColor: appColors.wisdomGlassStrong, borderRadius: radii.round, height: spacing.s14, marginVertical: space.sm, overflow: 'hidden' },
  goalFill: { backgroundColor: appColors.wisdomGoldBright, borderRadius: radii.round, height: '100%', width: '44%' },
  giftWrap: { position: 'relative', zIndex: 2 },
  giftSparkle: { position: 'absolute', right: -space.lg, top: -space.sm },
  saturdayTag: {
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    marginLeft: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    zIndex: 2,
  },
  threeProps: { gap: space.xs },
  propTile: { alignItems: 'center', backgroundColor: appColors.wisdomGlass, borderColor: appColors.wisdomLine, borderRadius: radii.large, borderWidth: 1, flex: 1, minHeight: spacing.s116, justifyContent: 'center', minWidth: 0, padding: space.sm },
  propTileLabel: { marginTop: space.xs, textAlign: 'center' },
  pauseBubble: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 31, 40, 0.7)',
    borderColor: appColors.wisdomLine,
    borderRadius: radii.large,
    borderWidth: 1,
    gap: space.xs,
    padding: space.md,
    zIndex: 2,
  },
  pauseBubbleLabel: { textAlign: 'center' },
  planProps: { gap: space.xs },
  planProp: { alignItems: 'center', backgroundColor: appColors.wisdomGlass, borderColor: appColors.wisdomLine, borderRadius: radii.large, borderWidth: 1, flex: 1, minWidth: 0, padding: space.sm, zIndex: 2 },
  planAmount: { marginTop: space.xs },
  memoryCard: {
    alignItems: 'center',
    borderColor: appColors.wisdomLine,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: space.md,
    overflow: 'hidden',
    padding: space.md,
  },
  memoryCardIcon: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlassStrong,
    borderRadius: radii.round,
    height: spacing.s48,
    justifyContent: 'center',
    marginRight: space.sm,
    width: spacing.s48,
  },
  memoryCardCopy: { flex: 1, minWidth: 0 },
  memoryCardText: { marginTop: space.xs },
  practiceCanvas: { minHeight: 560, padding: space.md },
  practiceVisual: {
    borderColor: appColors.wisdomLine,
    borderRadius: radii.large,
    borderWidth: 1,
    height: 232,
    overflow: 'hidden',
    position: 'relative',
  },
  practiceGlow: {
    backgroundColor: appColors.wisdomGoldGlow,
    borderRadius: radii.round,
    height: 220,
    left: -space.xxl,
    position: 'absolute',
    top: -space.xl,
    width: 220,
    zIndex: 0,
  },
  practiceLeo: {
    bottom: -space.lg,
    height: '104%',
    left: -space.xl,
    position: 'absolute',
    width: '68%',
    zIndex: 1,
  },
  practiceSymbol: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlay,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s52,
    justifyContent: 'center',
    position: 'absolute',
    width: spacing.s52,
    zIndex: 2,
    ...shadows.subtle,
  },
  practiceSymbolPause: { right: space.lg, top: space.lg },
  practiceSymbolMoney: { right: spacing.s62, top: spacing.s92 },
  practiceSymbolPeople: { bottom: space.lg, right: space.lg },
  practiceCard: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomCream,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: space.sm,
    marginTop: -space.lg,
    padding: space.md,
    position: 'relative',
  },
  practiceIcon: {
    alignItems: 'center',
    backgroundColor: appColors.primary,
    borderRadius: radii.round,
    height: spacing.s48,
    justifyContent: 'center',
    marginRight: space.sm,
    width: spacing.s48,
  },
  practiceCardCopy: { flex: 1, minWidth: 0 },
  practiceText: { marginTop: space.xs },
  practiceCloudResponse: { marginTop: space.md },
  completionCanvas: {
    ...shadows.card,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.hero,
    borderWidth: 1,
    overflow: 'hidden',
    padding: space.md,
    position: 'relative',
  },
  completionHero: {
    minHeight: 300,
    overflow: 'hidden',
    position: 'relative',
  },
  completionGlow: {
    backgroundColor: appColors.wisdomGoldGlow,
    borderRadius: radii.round,
    height: 360,
    opacity: 0.5,
    position: 'absolute',
    right: -space.huge,
    top: -space.xxxl,
    width: 360,
  },
  completionSparkles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: space.md,
    position: 'absolute',
    right: space.md,
    top: space.md,
    zIndex: 4,
  },
  completionArtworkFrame: {
    bottom: -space.lg,
    height: '90%',
    position: 'absolute',
    right: -space.xl,
    width: '58%',
  },
  completionArtwork: { height: '100%', width: '100%' },
  completionCopy: { paddingTop: spacing.s48, width: '68%', zIndex: 2 },
  completionStatus: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: appColors.wisdomGlass, borderColor: appColors.wisdomLine, borderRadius: radii.round, borderWidth: 1, flexDirection: 'row', gap: space.xs, paddingHorizontal: space.sm, paddingVertical: space.xs },
  completionTitle: { fontSize: typography.size.heroCard, lineHeight: 32, marginTop: space.lg, textAlign: 'left' },
  completionMessage: { marginTop: space.sm, opacity: 0.9, textAlign: 'left' },
  planSummary: {
    backgroundColor: appColors.wisdomGlass,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: space.md,
    padding: space.md,
  },
  planSummaryHeader: { alignItems: 'center', flexDirection: 'row', gap: space.sm },
  planSummaryIcon: { alignItems: 'center', backgroundColor: appColors.wisdomGlassStrong, borderRadius: radii.medium, height: spacing.s42, justifyContent: 'center', width: spacing.s42 },
  planSummaryGrid: { flexDirection: 'row', gap: space.xs, marginTop: space.md },
  planSummaryTile: { alignItems: 'center', backgroundColor: appColors.wisdomGlass, borderColor: appColors.wisdomLine, borderRadius: radii.medium, borderWidth: 1, flex: 1, minWidth: 0, paddingHorizontal: space.xs, paddingVertical: space.sm },
  planSummaryTileIcon: { alignItems: 'center', backgroundColor: appColors.wisdomCream, borderRadius: radii.round, height: spacing.s38, justifyContent: 'center', width: spacing.s38 },
  planSummaryTileValue: { marginTop: space.xs, textAlign: 'center' },
  planSummaryTileLabel: { marginTop: space.xxs, opacity: 0.82, textAlign: 'center' },
  takeawaySummary: { backgroundColor: appColors.wisdomGlass, borderColor: appColors.wisdomLine, borderRadius: radii.medium, borderWidth: 1, marginTop: space.md, padding: space.md },
  takeawaySummaryLabel: { alignItems: 'center', flexDirection: 'row', gap: space.xs },
  takeawaySummaryText: { marginTop: space.xs },
  sceneStage: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: space.md,
    justifyContent: 'center',
    zIndex: 2,
  },
  amountDisc: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s116,
    justifyContent: 'center',
    width: spacing.s116,
  },
  amountDiscValue: {
    color: appColors.wisdomGoldBright,
    fontSize: 38,
    lineHeight: 44,
  },
  objectDisc: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s116,
    justifyContent: 'center',
    width: spacing.s116,
  },
  cardFan: {
    height: spacing.s116,
    position: 'relative',
    width: spacing.s92,
  },
  cardTile: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.medium,
    borderWidth: 1,
    height: spacing.s92,
    justifyContent: 'center',
    position: 'absolute',
    top: space.sm,
    width: spacing.s66,
  },
  cardTileBack: {
    left: 0,
    opacity: 0.45,
    transform: [{ rotate: '-14deg' }],
  },
  cardTileMid: {
    left: spacing.s12,
    opacity: 0.7,
    transform: [{ rotate: '-6deg' }],
  },
  cardTileFront: {
    left: spacing.s24,
    transform: [{ rotate: '4deg' }],
  },
  shopFront: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlass,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.large,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
    paddingTop: spacing.s24,
    position: 'relative',
  },
  shopAwning: {
    backgroundColor: appColors.wisdomGoldGlow,
    height: spacing.s14,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  shopLabel: {
    marginTop: space.xxs,
    opacity: 0.86,
  },
  moneyBoardTotal: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: appColors.surfaceOverlay,
    borderColor: appColors.borderStrong,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s92,
    justifyContent: 'center',
    width: spacing.s92,
  },
  moneyBoardTotalValue: {
    color: appColors.primary,
  },
});
