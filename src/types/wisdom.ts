import { Ionicons } from '@expo/vector-icons';
import { ImageSourcePropType } from 'react-native';

export type Category = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  image: ImageSourcePropType;
};

export type WisdomWorld = Category & {
  background: [string, string];
  heroTitle: string;
  heroDescription: string;
  heroMinutes: number;
  heroImage: ImageSourcePropType;
  heroColors: [string, string];
  lockedTitle: string;
  lockedDescription: string;
  lockedMinutes: number;
  lockedImage: ImageSourcePropType;
  lockedColors: [string, string];
};

export type DetailSource = 'hero' | 'locked';

export type RootStackParamList = {
  Home: undefined;
  WisdomDetail: {
    source: DetailSource;
    worldKey: string;
  };
};
