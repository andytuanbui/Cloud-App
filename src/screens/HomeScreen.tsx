import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { CategoryTile } from '../components/CategoryTile';
import { IdentityPanel } from '../components/IdentityPanel';
import { LockedNextCard } from '../components/LockedNextCard';
import { TodayCard } from '../components/TodayCard';
import { assets, worlds } from '../content/wisdom';
import { styles } from '../theme/styles';
import { RootStackParamList } from '../types/wisdom';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const activeWorld = worlds[activeIndex];

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      duration: 260,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, fadeAnim]);

  const handleJourneyScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.max(0, Math.min(worlds.length - 1, Math.round(event.nativeEvent.contentOffset.x / 326)));

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <LinearGradient colors={activeWorld.background} style={styles.phone}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good morning, Andy!</Text>
            <Text style={styles.heroQuestion}>What should I{'\n'}learn today?</Text>
          </View>
          <View style={styles.profileStack}>
            <View style={styles.headerAvatar}>
              <Image source={assets.avatar} style={styles.headerAvatarImage} resizeMode="contain" />
            </View>
            <Text style={styles.profileName}>Andy</Text>
          </View>
        </View>

        <IdentityPanel world={activeWorld} />

        <Animated.View
          style={[
            styles.worldContent,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TodayCard
            world={activeWorld}
            onOpen={() => navigation.navigate('WisdomDetail', { source: 'hero', worldKey: activeWorld.key })}
          />
          <LockedNextCard
            world={activeWorld}
            onOpen={() => navigation.navigate('WisdomDetail', { source: 'locked', worldKey: activeWorld.key })}
          />
        </Animated.View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <Text style={[styles.seeAll, { color: activeWorld.colors[0] }]}>Swipe</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={326}
          decelerationRate="fast"
          contentContainerStyle={styles.categoryRow}
          onMomentumScrollEnd={handleJourneyScroll}
        >
          {worlds.map((world, index) => (
            <CategoryTile
              key={world.key}
              category={world}
              active={index === activeIndex}
              onSelect={() => setActiveIndex(index)}
            />
          ))}
        </ScrollView>

        <View style={styles.homeEndSpacer} />
      </ScrollView>
      <BottomNav />
    </LinearGradient>
  );
}
