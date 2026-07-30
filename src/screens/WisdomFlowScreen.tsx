import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChoiceList } from '../components/mvp/ChoiceList';
import { FlowScaffold } from '../components/mvp/FlowScaffold';
import { WisdomButton } from '../components/mvp/WisdomButton';
import { getWisdomById } from '../content/wisdoms';
import { useAppState } from '../state/useAppState';
import { wisdomSteps, WisdomStep } from '../state/types';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'WisdomFlow'>;
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

  if (!wisdom || isRestoring) return <View style={styles.loading}><Text style={styles.body}>Restoring your Wisdom…</Text></View>;

  if (reviewMode) {
    return (
      <FlowScaffold step="read" reviewMode onBack={() => navigation.replace('Today')}>
        <Text style={styles.title}>{wisdom.title}</Text>
        <Text style={styles.reviewIntro}>Take another look at the ideas you practiced.</Text>
        {wisdom.readingSections.map((section) => (
          <View key={section.title} style={styles.readCard}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            {section.text.map((line) => <Text key={line} style={styles.body}>{line}</Text>)}
            {section.examples?.map((example) => <Text key={example} style={styles.bullet}>• {example}</Text>)}
          </View>
        ))}
        <WisdomButton label="Return to Today" onPress={() => navigation.replace('Today')} />
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
          <Text style={styles.title}>{wisdom.openingQuestion.question}</Text>
          <Text style={styles.body}>Choose the answer that feels right to you.</Text>
          <ChoiceList
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
          <Text style={styles.title}>Read and think</Text>
          {wisdom.readingSections.map((section) => (
            <View key={section.title} style={styles.readCard}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              {section.text.map((line) => <Text key={line} style={styles.body}>{line}</Text>)}
              {section.examples?.map((example) => <Text key={example} style={styles.bullet}>• {example}</Text>)}
            </View>
          ))}
          <WisdomButton label="Talk with Cloud" onPress={() => goNext('talk')} />
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
          <Text style={styles.prompt}>{wisdom.reflection.prompt}</Text>
          <Text style={styles.title}>{wisdom.reflection.question}</Text>
          <ChoiceList
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
          <Text style={styles.title}>{wisdom.practice.title}</Text>
          <Text style={styles.body}>{wisdom.practice.text}</Text>
          <View style={styles.thinkCard}>
            {wisdom.practice.questions.map((question) => <Text key={question} style={styles.thinkQuestion}>{question}</Text>)}
          </View>
          <ChoiceList
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
            <Text style={styles.prompt}>Question {questionIndex + 1} of {wisdom.quiz.length}</Text>
            <Text style={styles.title}>{question.question}</Text>
            <ChoiceList
              choices={question.answers}
              selectedId={quizChoice}
              disabled={quizFeedback === 'correct'}
              onSelect={(answer) => {
                setQuizChoice(answer);
                setQuizFeedback(answer === question.correctAnswerId ? 'correct' : 'wrong');
              }}
            />
            {quizFeedback === 'wrong' && <View style={styles.feedbackWrong}><Text style={styles.feedbackText}>Not quite. Take another look and try again.</Text></View>}
            {quizFeedback === 'correct' && <View style={styles.feedbackCorrect}><Text style={styles.feedbackText}>{question.feedback}</Text></View>}
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
          <Image source={cloudAvatar} style={styles.completionCloud} />
          <View style={styles.check}><Ionicons name="checkmark" size={34} color="#FFFFFF" /></View>
          <Text style={[styles.title, styles.center]}>{wisdom.completion.title}</Text>
          <Text style={[styles.body, styles.center]}>{wisdom.completion.message}</Text>
          <CloudMessage text={wisdom.completion.cloudMessage} />
          <View style={styles.summaryCard}>
            <SummaryRow label="Wisdom" value={wisdom.title} />
            <SummaryRow label="Skill practiced" value={wisdom.skillOutcome} />
            <SummaryRow label="Date completed" value={new Date(progress?.completedAt ?? Date.now()).toLocaleDateString()} />
          </View>
          <WisdomButton label="Return to Today" onPress={() => navigation.replace('Today')} />
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
  wisdom: NonNullable<ReturnType<typeof getWisdomById>>;
}) {
  const [showResponse, setShowResponse] = useState(false);
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
      <Text style={styles.prompt}>Question {index + 1} of {wisdom.cloudConversation.length}</Text>
      <Text style={styles.title}>{prompt.question}</Text>
      {!showResponse && (
        <>
          <View style={styles.chips}>
            {prompt.examples.map((example) => (
              <WisdomButton key={example} label={example} secondary onPress={() => submit(example)} />
            ))}
          </View>
          <TextInput
            accessibilityLabel="Type a short response"
            maxLength={120}
            onChangeText={setDraft}
            placeholder="Or type a short response…"
            placeholderTextColor="#7D8A86"
            style={styles.input}
            value={draft}
          />
          <WisdomButton disabled={!draft.trim()} label="Share with Cloud" onPress={() => submit(draft)} />
        </>
      )}
      {showResponse && (
        <>
          <View style={styles.responseCard}><Text style={styles.responseText}>{responses[index]}</Text></View>
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

function CloudIntro() {
  return <Image source={cloudAvatar} resizeMode="contain" style={styles.cloud} />;
}
function CloudMessage({ text }: { text: string }) {
  return <View style={styles.cloudMessage}><Ionicons name="cloud" size={22} color="#397968" /><Text style={styles.cloudText}>“{text}”</Text></View>;
}
function SummaryRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: '#F5FAF8', flex: 1, justifyContent: 'center' },
  cloud: { alignSelf: 'center', height: 96, marginBottom: 8, width: 96 },
  title: { color: '#152A44', fontSize: 27, fontWeight: '900', lineHeight: 34, marginBottom: 12 },
  body: { color: '#4F615C', fontSize: 16, lineHeight: 24, marginBottom: 13 },
  prompt: { color: '#397565', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  action: { marginTop: 20 },
  cloudMessage: { alignItems: 'flex-start', backgroundColor: '#E7F5F0', borderRadius: 18, flexDirection: 'row', gap: 10, marginVertical: 18, padding: 16 },
  cloudText: { color: '#28564B', flex: 1, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  readCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 14, padding: 18 },
  cardTitle: { color: '#17314E', fontSize: 20, fontWeight: '900', marginBottom: 9 },
  bullet: { color: '#40534E', fontSize: 16, lineHeight: 24, marginBottom: 3 },
  thinkCard: { backgroundColor: '#FFF6DD', borderRadius: 18, marginBottom: 18, padding: 17 },
  thinkQuestion: { color: '#564820', fontSize: 16, fontWeight: '700', lineHeight: 25 },
  chips: { gap: 9, marginBottom: 14 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#CEDCD7', borderRadius: 16, borderWidth: 1, color: '#172A43', fontSize: 16, marginBottom: 12, minHeight: 58, padding: 15 },
  responseCard: { alignSelf: 'flex-end', backgroundColor: '#173B68', borderRadius: 18, marginVertical: 12, maxWidth: '88%', padding: 15 },
  responseText: { color: '#FFFFFF', fontSize: 16, lineHeight: 22 },
  reviewIntro: { color: '#536760', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  feedbackWrong: { backgroundColor: '#FFF1E8', borderRadius: 15, marginTop: 14, padding: 14 },
  feedbackCorrect: { backgroundColor: '#E6F5EE', borderRadius: 15, marginTop: 14, padding: 14 },
  feedbackText: { color: '#334B45', fontSize: 15, fontWeight: '700', lineHeight: 21 },
  completion: { paddingTop: 6 },
  completionCloud: { alignSelf: 'center', height: 120, width: 120 },
  check: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#3B8B75', borderRadius: 28, height: 56, justifyContent: 'center', marginBottom: 18, width: 56 },
  center: { textAlign: 'center' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 22, padding: 18 },
  summaryRow: { borderBottomColor: '#E7EEEB', borderBottomWidth: 1, paddingVertical: 10 },
  summaryLabel: { color: '#71807C', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  summaryValue: { color: '#20364E', fontSize: 15, fontWeight: '700', marginTop: 4 },
});
