import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { ChoiceList } from '../components/mvp/ChoiceList';
import { FlowScaffold } from '../components/mvp/FlowScaffold';
import { WisdomButton } from '../components/mvp/WisdomButton';
import { AppText, StatusPanel, SurfaceCard } from '../components/ui';
import { getWisdomById } from '../content/wisdoms';
import { useAppState } from '../state/useAppState';
import { wisdomSteps, WisdomStep } from '../state/types';
import {
  appColors,
  radii,
  shadows,
  space,
  spacing,
  typeStyles,
  typography,
} from '../theme';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'WisdomFlow'>;
type Wisdom = NonNullable<ReturnType<typeof getWisdomById>>;
const cloudAvatar = require('../../assets/cloud/cloud-avatar.png');

export function WisdomFlowScreen({ navigation, route }: Props) {
  const wisdom = getWisdomById(route.params.wisdomId);
  const reviewMode = route.params.review === true;
  const { getProgress, updateProgress, completeStep, isRestoring } = useAppState();
  const progress = getProgress(route.params.wisdomId);
  const step = progress?.currentStep ?? 'opening';
  const [draft, setDraft] = useState('');
  const [quizChoice, setQuizChoice] = useState<string>();
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong'>();

  useEffect(() => {
    if (!isRestoring && !progress) updateProgress(route.params.wisdomId, { currentStep: 'opening' });
  }, [isRestoring, progress, route.params.wisdomId, updateProgress]);

  useEffect(() => {
    setQuizChoice(undefined);
    setQuizFeedback(undefined);
  }, [progress?.quizProgress.questionIndex]);

  const previousStep = useMemo(() => {
    const index = wisdomSteps.indexOf(step);
    return index > 0 && step !== 'completion' ? wisdomSteps[index - 1] : undefined;
  }, [step]);

  if (!wisdom || isRestoring) {
    return (
      <View style={styles.loading}>
        <AppText tone="secondary" variant="body">
          Restoring your Wisdom…
        </AppText>
      </View>
    );
  }

  if (reviewMode) {
    return (
      <FlowScaffold step="read" reviewMode onBack={() => navigation.replace('Today')}>
        <StageHeading
          supporting="Take another look at the ideas you practiced."
          title={wisdom.title}
        />
        <ReadingSections wisdom={wisdom} />
        <View style={styles.action}>
          <WisdomButton label="Return to Today" onPress={() => navigation.replace('Today')} />
        </View>
      </FlowScaffold>
    );
  }

  const goNext = (next: WisdomStep) => completeStep(wisdom.id, step, next);
  const goBack = previousStep
    ? () => updateProgress(wisdom.id, { currentStep: previousStep })
    : () => navigation.goBack();

  return (
    <FlowScaffold step={step} onBack={step === 'completion' ? undefined : goBack}>
      {step === 'opening' && (
        <>
          <CloudIntro />
          <StageHeading
            supporting="Choose the answer that feels right to you."
            title={wisdom.openingQuestion.question}
          />
          <ChoiceList
            accessibilityLabel="Opening question choices"
            choices={wisdom.openingQuestion.options}
            selectedId={progress?.openingAnswer}
            onSelect={(openingAnswer) => updateProgress(wisdom.id, { openingAnswer })}
          />
          {progress?.openingAnswer && <CloudMessage text={wisdom.openingQuestion.response} />}
          <View style={styles.action}><WisdomButton disabled={!progress?.openingAnswer} label="Continue" onPress={() => goNext('read')} /></View>
        </>
      )}

      {step === 'read' && (
        <>
          <StageHeading title="Read and think" />
          <ReadingSections wisdom={wisdom} />
          <View style={styles.action}>
            <WisdomButton label="Talk with Cloud" onPress={() => goNext('talk')} />
          </View>
        </>
      )}

      {step === 'talk' && (
        <ConversationStep
          responses={progress?.conversationResponses ?? []}
          setResponses={(conversationResponses) => updateProgress(wisdom.id, { conversationResponses })}
          draft={draft}
          setDraft={setDraft}
          onComplete={() => goNext('reflect')}
          wisdom={wisdom}
        />
      )}

      {step === 'reflect' && (
        <>
          <CloudIntro />
          <AppText style={styles.prompt} tone="brand" variant="label">
            {wisdom.reflection.prompt}
          </AppText>
          <StageHeading title={wisdom.reflection.question} />
          <ChoiceList
            accessibilityLabel="Reflection choices"
            choices={wisdom.reflection.options}
            selectedId={progress?.reflectionAnswer}
            onSelect={(reflectionAnswer) => updateProgress(wisdom.id, { reflectionAnswer })}
          />
          {progress?.reflectionAnswer && <CloudMessage text={wisdom.reflection.response} />}
          <View style={styles.action}><WisdomButton disabled={!progress?.reflectionAnswer} label="Continue" onPress={() => goNext('practice')} /></View>
        </>
      )}

      {step === 'practice' && (
        <>
          <StageHeading supporting={wisdom.practice.text} title={wisdom.practice.title} />
          <SurfaceCard style={styles.thinkCard} tone="gold">
            {wisdom.practice.questions.map((question) => (
              <View key={question} style={styles.thinkQuestionRow}>
                <Ionicons
                  accessible={false}
                  color={appColors.warmGold}
                  name="sparkles"
                  size={spacing.s18}
                />
                <AppText style={styles.thinkQuestion} variant="body">
                  {question}
                </AppText>
              </View>
            ))}
          </SurfaceCard>
          <ChoiceList
            accessibilityLabel="Practice choices"
            choices={wisdom.practice.options}
            selectedId={progress?.practiceStatus}
            onSelect={(practiceStatus) => updateProgress(wisdom.id, { practiceStatus })}
          />
          <View style={styles.action}><WisdomButton disabled={!progress?.practiceStatus} label="Continue to Quiz" onPress={() => goNext('quiz')} /></View>
        </>
      )}

      {step === 'quiz' && (() => {
        const questionIndex = progress?.quizProgress.questionIndex ?? 0;
        const question = wisdom.quiz[questionIndex];
        return (
          <>
            <AppText style={styles.prompt} tone="brand" variant="label">
              Question {questionIndex + 1} of {wisdom.quiz.length}
            </AppText>
            <StageHeading title={question.question} />
            <ChoiceList
              accessibilityLabel={`Answers for question ${questionIndex + 1}`}
              choices={question.answers}
              selectedId={quizChoice}
              disabled={quizFeedback === 'correct'}
              selectionTone={quizFeedback ?? 'default'}
              onSelect={(answer) => {
                setQuizChoice(answer);
                setQuizFeedback(answer === question.correctAnswerId ? 'correct' : 'wrong');
              }}
            />
            {quizFeedback === 'wrong' && (
              <LiveFeedback
                icon="refresh-circle"
                message="Not quite. Take another look and try again."
                tone="caution"
              />
            )}
            {quizFeedback === 'correct' && (
              <LiveFeedback
                icon="checkmark-circle"
                message={question.feedback}
                tone="success"
              />
            )}
            <View style={styles.action}>
              <WisdomButton
                disabled={quizFeedback !== 'correct'}
                label={questionIndex === wisdom.quiz.length - 1 ? 'Complete Wisdom' : 'Next Question'}
                onPress={() => {
                  const completedAnswerIds = [...(progress?.quizProgress.completedAnswerIds ?? []), question.correctAnswerId];
                  if (questionIndex === wisdom.quiz.length - 1) {
                    updateProgress(wisdom.id, {
                      quizProgress: { questionIndex, completedAnswerIds },
                      currentStep: 'completion',
                      completedSteps: Array.from(new Set([...(progress?.completedSteps ?? []), 'quiz'])),
                      completed: true,
                      completedAt: new Date().toISOString(),
                    });
                  } else {
                    updateProgress(wisdom.id, { quizProgress: { questionIndex: questionIndex + 1, completedAnswerIds } });
                  }
                }}
              />
            </View>
          </>
        );
      })()}

      {step === 'completion' && (
        <View style={styles.completion}>
          <CloudIntro large />
          <View accessible={false} style={styles.check}>
            <Ionicons
              accessible={false}
              color={appColors.onPrimary}
              name="checkmark"
              size={space.xxl}
            />
          </View>
          <AppText
            accessibilityRole="header"
            style={styles.completionTitle}
            variant="screenTitle"
          >
            {wisdom.completion.title}
          </AppText>
          <AppText style={styles.completionBody} tone="secondary" variant="body">
            {wisdom.completion.message}
          </AppText>
          <CloudMessage text={wisdom.completion.cloudMessage} />
          <SurfaceCard elevated style={styles.summaryCard}>
            <SummaryRow label="Wisdom" value={wisdom.title} />
            <SummaryRow label="Skill practiced" value={wisdom.skillOutcome} />
            <SummaryRow
              label="Date completed"
              last
              value={new Date(progress?.completedAt ?? Date.now()).toLocaleDateString()}
            />
          </SurfaceCard>
          <View style={styles.action}>
            <WisdomButton label="Return to Today" onPress={() => navigation.replace('Today')} />
          </View>
        </View>
      )}
    </FlowScaffold>
  );
}

function ConversationStep({
  responses, setResponses, draft, setDraft, onComplete, wisdom,
}: {
  responses: string[];
  setResponses: (responses: string[]) => void;
  draft: string;
  setDraft: (value: string) => void;
  onComplete: () => void;
  wisdom: Wisdom;
}) {
  const [showResponse, setShowResponse] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const index = Math.min(showResponse ? responses.length - 1 : responses.length, wisdom.cloudConversation.length - 1);
  const prompt = wisdom.cloudConversation[index];
  const submit = (response: string) => {
    if (!response.trim()) return;
    setResponses([...responses, response.trim()]);
    setDraft('');
    setShowResponse(true);
  };
  return (
    <>
      <CloudIntro />
      <AppText style={styles.prompt} tone="brand" variant="label">
        Question {index + 1} of {wisdom.cloudConversation.length}
      </AppText>
      <StageHeading title={prompt.question} />
      {!showResponse && (
        <>
          <View style={styles.chips}>
            {prompt.examples.map((example) => (
              <WisdomButton key={example} label={example} secondary onPress={() => submit(example)} />
            ))}
          </View>
          <TextInput
            accessibilityHint="Enter up to 120 characters"
            accessibilityLabel="Type a short response"
            maxLength={120}
            onBlur={() => setInputFocused(false)}
            onChangeText={setDraft}
            onFocus={() => setInputFocused(true)}
            placeholder="Or type a short response…"
            placeholderTextColor={appColors.textMuted}
            selectionColor={appColors.primary}
            style={[styles.input, inputFocused && styles.inputFocused]}
            value={draft}
          />
          <WisdomButton disabled={!draft.trim()} label="Share with Cloud" onPress={() => submit(draft)} />
        </>
      )}
      {showResponse && (
        <>
          <View
            accessibilityLabel={`Your response: ${responses[index]}`}
            accessible
            style={styles.responseCard}
          >
            <AppText tone="inverse" variant="body">
              {responses[index]}
            </AppText>
          </View>
          <CloudMessage text={prompt.cloudResponse} />
          <WisdomButton
            label={index === wisdom.cloudConversation.length - 1 ? 'Continue' : 'Next Question'}
            onPress={() => {
              if (index === wisdom.cloudConversation.length - 1) onComplete();
              else setShowResponse(false);
            }}
          />
        </>
      )}
    </>
  );
}

function StageHeading({
  supporting,
  title,
}: {
  supporting?: string;
  title: string;
}) {
  return (
    <View style={styles.stageHeading}>
      <AppText accessibilityRole="header" variant="screenTitle">
        {title}
      </AppText>
      {supporting ? (
        <AppText style={styles.stageSupporting} tone="secondary" variant="body">
          {supporting}
        </AppText>
      ) : null}
    </View>
  );
}

function ReadingSections({ wisdom }: { wisdom: Wisdom }) {
  return (
    <>
      {wisdom.readingSections.map((section) => (
        <SurfaceCard elevated key={section.title} style={styles.readCard}>
          <AppText accessibilityRole="header" style={styles.cardTitle} variant="cardTitle">
            {section.title}
          </AppText>
          {section.text.map((line) => (
            <AppText key={line} style={styles.readBody} tone="secondary" variant="body">
              {line}
            </AppText>
          ))}
          {section.examples?.map((example) => (
            <AppText key={example} style={styles.bullet} tone="secondary" variant="body">
              • {example}
            </AppText>
          ))}
        </SurfaceCard>
      ))}
    </>
  );
}

function CloudIntro({ large = false }: { large?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.cloudStage}
    >
      <View style={[styles.cloudFrame, large && styles.cloudFrameLarge]}>
        <Image
          accessible={false}
          resizeMode="contain"
          source={cloudAvatar}
          style={styles.cloud}
        />
      </View>
    </View>
  );
}

function CloudMessage({ text }: { text: string }) {
  return (
    <View
      accessibilityLabel={`Cloud says: ${text}`}
      accessibilityLiveRegion="polite"
      accessible
      style={styles.cloudMessageWrap}
    >
      <SurfaceCard style={styles.cloudMessage} tone="soft">
        <View accessible={false} style={styles.cloudIcon}>
          <Ionicons
            accessible={false}
            color={appColors.primary}
            name="cloud"
            size={spacing.s22}
          />
        </View>
        <AppText style={styles.cloudText} tone="brand" variant="supporting">
          “{text}”
        </AppText>
      </SurfaceCard>
    </View>
  );
}

function LiveFeedback({
  icon,
  message,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  tone: 'success' | 'caution';
}) {
  return (
    <View
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      accessible
      style={styles.feedback}
    >
      <StatusPanel icon={icon} title={message} tone={tone} />
    </View>
  );
}

function SummaryRow({
  label,
  last = false,
  value,
}: {
  label: string;
  last?: boolean;
  value: string;
}) {
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      accessible
      style={[styles.summaryRow, last && styles.summaryRowLast]}
    >
      <AppText style={styles.summaryLabel} tone="muted" variant="caption">
        {label}
      </AppText>
      <AppText style={styles.summaryValue} variant="supporting">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: appColors.canvas,
    flex: 1,
    justifyContent: 'center',
  },
  stageHeading: {
    marginBottom: space.lg,
  },
  stageSupporting: {
    marginTop: space.xs,
  },
  prompt: {
    marginBottom: space.xs,
  },
  action: {
    marginTop: space.xl,
  },
  cloudStage: {
    alignItems: 'center',
    marginBottom: space.lg,
  },
  cloudFrame: {
    ...shadows.card,
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.border,
    borderRadius: radii.hero,
    borderWidth: 1,
    height: spacing.s92,
    overflow: 'hidden',
    padding: space.xxs,
    width: spacing.s92,
  },
  cloudFrameLarge: {
    height: spacing.s116,
    width: spacing.s116,
  },
  cloud: {
    borderRadius: radii.large,
    height: '100%',
    width: '100%',
  },
  cloudMessageWrap: {
    marginVertical: space.lg,
  },
  cloudMessage: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: space.md,
  },
  cloudIcon: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlaySoft,
    borderRadius: radii.round,
    height: spacing.s42,
    justifyContent: 'center',
    marginRight: space.sm,
    width: spacing.s42,
  },
  cloudText: {
    flex: 1,
    fontWeight: typography.weight.bold,
  },
  readCard: {
    marginBottom: space.md,
    padding: space.lg,
  },
  cardTitle: {
    marginBottom: space.sm,
  },
  readBody: {
    marginBottom: space.sm,
  },
  bullet: {
    marginBottom: space.xxs,
  },
  thinkCard: {
    gap: space.sm,
    marginBottom: space.lg,
    padding: space.lg,
  },
  thinkQuestionRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  thinkQuestion: {
    flex: 1,
    fontWeight: typography.weight.bold,
    marginLeft: space.sm,
  },
  chips: {
    gap: space.sm,
    marginBottom: space.md,
  },
  input: {
    ...typeStyles.body,
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: spacing.xxs,
    color: appColors.textPrimary,
    marginBottom: space.sm,
    minHeight: spacing.s58,
    padding: space.md,
  },
  inputFocused: {
    ...shadows.focus,
    borderColor: appColors.focus,
  },
  responseCard: {
    ...shadows.subtle,
    alignSelf: 'flex-end',
    backgroundColor: appColors.primary,
    borderRadius: radii.large,
    marginVertical: space.sm,
    maxWidth: '88%',
    padding: space.md,
  },
  feedback: {
    marginTop: space.md,
  },
  completion: {
    paddingTop: space.xs,
  },
  check: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: appColors.success,
    borderRadius: radii.round,
    height: spacing.s58,
    justifyContent: 'center',
    marginBottom: space.lg,
    marginTop: -space.sm,
    width: spacing.s58,
  },
  completionTitle: {
    textAlign: 'center',
  },
  completionBody: {
    marginTop: space.sm,
    textAlign: 'center',
  },
  summaryCard: {
    padding: space.lg,
  },
  summaryRow: {
    borderBottomColor: appColors.border,
    borderBottomWidth: 1,
    paddingVertical: space.sm,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontWeight: typography.weight.bold,
    marginTop: space.xxs,
  },
});
