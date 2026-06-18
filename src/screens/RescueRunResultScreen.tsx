import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {Image, Share, StyleSheet, View} from 'react-native';
import {AppText} from '../components/AppText';
import {PrimaryButton} from '../components/Buttons';
import {Screen} from '../components/Screen';
import {trailGuides} from '../data';
import {useStorage} from '../storage/StorageProvider';
import {colors, radii} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'RescueRunResult'>;

const paceLabels = {
  steady: 'Steady',
  rapid: 'Rapid',
  expert: 'Expert',
};

export function RescueRunResultScreen({route, navigation}: Props) {
  const {bestRunScore, updateBestRunScore} = useStorage();
  const guide = trailGuides.find(item => item.id === route.params.guideId) ?? trailGuides[0];
  const best = Math.max(bestRunScore, route.params.score);
  const paceLabel = paceLabels[route.params.pace];

  useEffect(() => {
    updateBestRunScore(route.params.score);
  }, [route.params.score, updateBestRunScore]);

  const share = () => {
    Share.share({message: `EcoRanger Rescue Run: ${route.params.score} points with ${guide.name} on ${paceLabel} pace.`}).catch(() => {});
  };

  return (
    <Screen contentStyle={styles.root}>
      <Image source={guide.image} resizeMode="contain" style={styles.guide} />
      <AppText size={30} weight="900">Run Complete</AppText>
      <AppText color={colors.mutedStrong}>{guide.name} · {paceLabel}</AppText>
      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <AppText size={12} color={colors.muted}>Score</AppText>
          <AppText size={45} weight="900" color={colors.orange}>{route.params.score}</AppText>
        </View>
        <View style={styles.scoreCard}>
          <AppText size={12} color={colors.muted}>Best</AppText>
          <AppText size={45} weight="900" color={colors.amber}>{best}</AppText>
        </View>
      </View>
      <PrimaryButton title="Run Again" icon="▶" onPress={() => navigation.replace('RescueRunPlay', {guideId: guide.id, pace: route.params.pace})} style={styles.button} />
      <PrimaryButton title="Share Score" icon="↗" onPress={share} style={styles.secondaryButton} />
      <PrimaryButton title="Change Guide" onPress={() => navigation.navigate('TrailTabs', {screen: 'RescueRun'})} style={styles.linkButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  guide: {
    width: 118,
    height: 148,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 14,
    marginTop: 12,
  },
  scoreCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
  },
  button: {
    width: '100%',
    marginTop: 6,
  },
  linkButton: {
    width: '100%',
    backgroundColor: 'transparent',
    minHeight: 44,
  },
});
