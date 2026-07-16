import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { WisdomWorld } from '../types/wisdom';

export function JourneyScaffold({
  world,
  step,
  eyebrow,
  title,
  description,
  icon,
  children,
  primaryLabel,
  onPrimary,
  onBack,
}: {
  world: WisdomWorld;
  step: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  onBack: () => void;
}) {
  return (
    <LinearGradient colors={world.background} style={styles.phone}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.journeyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailTopBar}>
          <Pressable style={styles.detailRoundButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <View style={styles.journeyStepPill}>
            <Text style={styles.journeyStepText}>{step}</Text>
          </View>
        </View>

        <LinearGradient colors={world.heroColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.journeyHero}>
          <Image source={world.heroImage} style={styles.journeyHeroImage} resizeMode="cover" />
          <LinearGradient
            colors={colors.gradient.journeyFade}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.journeyHeroGradient}
          />
          <View style={styles.journeyHeroCopy}>
            <View style={styles.detailBadge}>
              <Ionicons name={icon} size={14} color={colors.text.inverse} />
              <Text style={styles.detailBadgeText}>{eyebrow}</Text>
            </View>
            <Text style={styles.journeyTitle}>{title}</Text>
            <Text style={styles.journeyDescription}>{description}</Text>
          </View>
        </LinearGradient>

        {children}

        <Pressable onPress={onPrimary}>
          <LinearGradient colors={colors.gradient.goldCta} style={styles.journeyPrimaryButton}>
            <Text style={styles.journeyPrimaryText}>{primaryLabel}</Text>
            <Ionicons name="chevron-forward" size={21} color={colors.text.inverse} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}
