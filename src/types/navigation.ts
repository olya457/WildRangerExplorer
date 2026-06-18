import type {NavigatorScreenParams} from '@react-navigation/native';

export type MainTabParamList = {
  Expeditions: undefined;
  Species: undefined;
  Atlas: undefined;
  FieldNotes: undefined;
  RescueRun: undefined;
};

export type RootStackParamList = {
  Launch: undefined;
  Briefing: undefined;
  TrailTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  SiteBrief: {siteId: string};
  SpeciesBrief: {speciesId: string};
  Challenge: {difficulty?: 'scout' | 'tracker' | 'warden'} | undefined;
  ChallengeResult: {score: number; total: number; streak: number; difficulty: 'scout' | 'tracker' | 'warden'};
  RescueRunPlay: {guideId: string; pace: 'steady' | 'rapid' | 'expert'};
  RescueRunResult: {score: number; guideId: string; pace: 'steady' | 'rapid' | 'expert'};
};
