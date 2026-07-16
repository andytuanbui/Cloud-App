import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import { getStory } from '../services/contentService';
import { getWisdomById, getWorldForWisdom } from '../services/wisdomService';
import { styles } from '../theme/styles';
import { Story, StoryPage, WisdomJourneyParamList } from '../types/wisdom';

type ReadingScreenProps = NativeStackScreenProps<WisdomJourneyParamList, 'Reading'>;
type StoryChoice = string;

function buildStoryPages(story: Story, choice: StoryChoice | null): StoryPage[] {
  return story.pages.filter((page) => !page.branchId || page.branchId === choice);
}

export function ReadingScreen({ navigation, route }: ReadingScreenProps) {
  const wisdom = getWisdomById(route.params.wisdomId);
  const world = getWorldForWisdom(wisdom.id);
  const story = getStory(wisdom.storyId);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [pageIndex, setPageIndex] = useState(0);
  const [choice, setChoice] = useState<StoryChoice | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const storyPages = buildStoryPages(story, choice);
  const page = storyPages[Math.min(pageIndex, storyPages.length - 1)];
  const isChoicePage = page.interactionType === 'choice';
  const isFinalPage = page.interactionType === 'becoming';
  const canAdvanceByTap = !isChoicePage;

  const transitionToPage = (nextIndex: number) => {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    Animated.timing(fadeAnim, {
      duration: 190,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setPageIndex(nextIndex);
      Animated.timing(fadeAnim, {
        duration: 260,
        toValue: 1,
        useNativeDriver: true,
      }).start(() => setIsTransitioning(false));
    });
  };

  const advanceStory = () => {
    if (isChoicePage) {
      return;
    }

    if (isFinalPage) {
      navigation.navigate('TalkWithCloud', { wisdomId: wisdom.id });
      return;
    }

    transitionToPage(Math.min(pageIndex + 1, storyPages.length - 1));
  };

  const choosePath = (nextChoice: StoryChoice) => {
    if (isTransitioning) {
      return;
    }

    setChoice(nextChoice);
    transitionToPage(pageIndex + 1);
  };

  return (
    <LinearGradient colors={world.background} style={styles.phone}>
      <Pressable style={styles.storyScreen} disabled={!canAdvanceByTap} onPress={advanceStory}>
        <Animated.View style={[styles.storyPage, { opacity: fadeAnim }]}>
          <Image source={page.image} style={styles.storyIllustration} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(5,9,22,0.1)', 'rgba(5,9,22,0.3)', 'rgba(5,9,22,0.96)']}
            style={styles.storyImageFade}
          />

          <View style={styles.storyTopBar}>
            <Pressable style={styles.detailRoundButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
            <View style={styles.journeyStepPill}>
              <Text style={styles.journeyStepText}>
                {pageIndex + 1} / {storyPages.length}
              </Text>
            </View>
          </View>

          <View style={styles.storyCopyPanel}>
            <View style={styles.detailBadge}>
              <Ionicons
                name={isChoicePage ? 'git-branch-outline' : 'book-outline'}
                size={14}
                color="#101827"
              />
              <Text style={styles.detailBadgeText}>{page.eyebrow}</Text>
            </View>
            <Text style={styles.storyTitle}>{page.title}</Text>
            <View style={styles.storyParagraphStack}>
              {page.body.map((paragraph) => (
                <Text key={paragraph} style={styles.storyParagraph}>
                  {paragraph}
                </Text>
              ))}
            </View>

            {isChoicePage ? (
              <View style={styles.storyChoiceGrid}>
                {page.choiceOptions?.map((card) => (
                  <Pressable key={card.id} style={styles.storyChoiceCard} onPress={() => choosePath(card.branchId)}>
                    <LinearGradient colors={card.colors} style={styles.storyChoiceGradient}>
                      <Image source={card.image} style={styles.storyChoiceImage} resizeMode="cover" />
                      <LinearGradient
                        colors={['rgba(5,9,22,0.08)', 'rgba(5,9,22,0.82)']}
                        style={styles.storyChoiceFade}
                      />
                      <View style={styles.storyChoiceCopy}>
                        <Text style={styles.storyChoiceTitle}>{card.title}</Text>
                        <Text style={styles.storyChoiceBody}>{card.body}</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Pressable onPress={advanceStory}>
                <LinearGradient colors={['#FFD166', '#FFB347']} style={styles.storyContinueButton}>
                  <Text style={styles.storyContinueText}>
                    {page.buttonLabel ?? (isFinalPage ? 'Talk with Cloud' : 'Continue')}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#101827" />
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </LinearGradient>
  );
}
