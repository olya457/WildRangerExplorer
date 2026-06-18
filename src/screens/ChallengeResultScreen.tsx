import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Share, StyleSheet, View} from 'react-native';
import {AppText} from '../components/AppText';
import {PrimaryButton} from '../components/Buttons';
import {Screen} from '../components/Screen';
import {useStorage} from '../storage/StorageProvider';
import {colors, radii} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ChallengeResult'>;

const difficultyLabels = {
  scout: 'Scout',
  tracker: 'Tracker',
  warden: 'Warden',
};

export function ChallengeResultScreen({route, navigation}: Props) {
  const {bestChallengeScore} = useStorage();
  const best = Math.max(bestChallengeScore, route.params.score);
  const label = difficultyLabels[route.params.difficulty];

  const share = () => {
    Share.share({
      message: `Trailkeeper ${label} Challenge: ${route.params.score} points, best streak ${route.params.streak}.`,
    }).catch(() => {});
  };

  return (
    <Screen contentStyle={styles.root}>
      <View style={styles.trophy}>
        <AppText size={45}>✦</AppText>
      </View>
      <AppText size={26} weight="900">{label} Complete</AppText>
      <AppText color={colors.mutedStrong}>Scorecard saved locally</AppText>
      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <AppText size={11} color={colors.muted}>Score</AppText>
          <AppText size={40} weight="900" color={colors.orange}>{route.params.score}</AppText>
          <AppText size={11} color={colors.muted}>max {route.params.total}</AppText>
        </View>
        <View style={styles.scoreCard}>
          <AppText size={11} color={colors.muted}>Best</AppText>
          <AppText size={40} weight="900" color={colors.amber}>{best}</AppText>
          <AppText size={11} color={colors.muted}>points</AppText>
        </View>
        <View style={styles.scoreCard}>
          <AppText size={11} color={colors.muted}>Streak</AppText>
          <AppText size={40} weight="900" color={colors.green}>{route.params.streak}</AppText>
          <AppText size={11} color={colors.muted}>best run</AppText>
        </View>
      </View>
      <PrimaryButton title="Try Again" icon="▶" onPress={() => navigation.replace('Challenge', {difficulty: route.params.difficulty})} style={styles.button} />
      <PrimaryButton title="Share Result" icon="↗" onPress={share} style={styles.secondaryButton} />
      <PrimaryButton title="Field Notes" onPress={() => navigation.navigate('TrailTabs', {screen: 'FieldNotes'})} style={styles.linkButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  trophy: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 18,
  },
  scoreCard: {
    flex: 1,
    minHeight: 108,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
  },
  button: {
    width: '100%',
    marginTop: 4,
  },
  linkButton: {
    width: '100%',
    backgroundColor: 'transparent',
    minHeight: 44,
  },
});
