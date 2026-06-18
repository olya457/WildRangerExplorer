import type {ImageSourcePropType} from 'react-native';

export type ProtectedSite = {
  id: string;
  name: string;
  tag: string;
  location: string;
  area: string;
  established: string;
  latitude: number;
  longitude: number;
  about: string;
  wildlife: string[];
  image: ImageSourcePropType;
};

export type WildSpecies = {
  id: string;
  name: string;
  tag: string;
  habitat: string;
  region: string;
  size: string;
  status: string;
  about: string;
  behavior: string;
  keyFacts: string[];
  image: ImageSourcePropType;
};

export type FieldNote = {
  id: string;
  icon: string;
  category: string;
  text: string;
};

export type ChallengePrompt = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
};

export type TrailGuide = {
  id: string;
  name: string;
  title: string;
  image: ImageSourcePropType;
};
