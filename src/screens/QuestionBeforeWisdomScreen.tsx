import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { LoadingState } from '../components/LoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getWisdomById, getWorldForWisdom } from '../services/wisdomService';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { WisdomJourneyParamList } from '../types/wisdom';

type QuestionBeforeWisdomScreenProps = NativeStackScreenProps<
  WisdomJourneyParamList,
  'QuestionBeforeWisdom'
>;

const answerOptions = [
  {
    icon: '🥤',
    label: 'Buy something fun now',
  },
  {
    icon: '💰',
    label: 'Save it for something bigger',
  },
];

export function QuestionBeforeWisdomScreen({ navigation, route }: QuestionBeforeWisdomScreenProps) {
  const content = useAsyncResource(async () => {
    const wisdom = await getWisdomById(route.params.wisdomId);
    const world = await getWorldForWisdom(wisdom.id);

    return { wisdom, world };
  }, [route.params.wisdomId]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  const { wisdom, world } = content.data;

  const continueToReading = () => {
    navigation.navigate('Reading', { wisdomId: wisdom.id });
  };

  return (
    <LinearGradient colors={world.background} style={styles.phone}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.questionContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailTopBar}>
          <Pressable style={styles.detailRoundButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <View style={styles.journeyStepPill}>
            <Text style={styles.journeyStepText}>Before we begin</Text>
          </View>
        </View>

        <LinearGradient
          colors={world.heroColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.questionHero}
        >
          <Image source={world.heroImage} style={styles.questionHeroImage} resizeMode="cover" />
          <LinearGradient
            colors={colors.gradient.questionFade}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.questionHeroFade}
          />
          <View style={styles.questionHeroCopy}>
            <View style={styles.detailBadge}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.text.inverse} />
              <Text style={styles.detailBadgeText}>Cloud asks</Text>
            </View>
            <Text style={styles.questionCloudLine}>I've been thinking about something...</Text>
          </View>
        </LinearGradient>

        <View style={styles.questionPanel}>
          <Text style={styles.questionTitle}>
            If your parents gave you $20 today, what would you do?
          </Text>

          <View style={styles.answerStack}>
            {answerOptions.map((option) => {
              const isSelected = selectedAnswer === option.label;

              return (
                <Pressable
                  key={option.label}
                  style={[styles.answerCard, isSelected && styles.answerCardSelected]}
                  onPress={() => setSelectedAnswer(option.label)}
                >
                  <Text style={styles.answerIcon}>{option.icon}</Text>
                  <Text style={styles.answerText}>{option.label}</Text>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isSelected ? colors.accent.gold : colors.text.muted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedAnswer ? (
          <View style={styles.questionResponsePanel}>
            <View style={styles.cloudBubble}>
              <Text style={styles.cloudBubbleText}>Interesting choice.</Text>
              <Text style={styles.cloudBubbleText}>Let's explore it together.</Text>
            </View>

            <Pressable onPress={continueToReading}>
              <LinearGradient colors={colors.gradient.goldCta} style={styles.journeyPrimaryButton}>
                <Text style={styles.journeyPrimaryText}>Continue to Today's Wisdom</Text>
                <Ionicons name="chevron-forward" size={21} color={colors.text.inverse} />
              </LinearGradient>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}
