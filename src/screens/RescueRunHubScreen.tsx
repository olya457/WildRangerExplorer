import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {AppText} from '../components/AppText';
import {PrimaryButton} from '../components/Buttons';
import {Screen} from '../components/Screen';
import {SegmentedControl} from '../components/SegmentedControl';
import {trailGuides} from '../data';
import {useStorage} from '../storage/StorageProvider';
import {colors, radii} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type RescuePace = 'steady' | 'rapid' | 'expert';

export function RescueRunHubScreen() {
  const navigation = useNavigation<Navigation>();
  const {bestRunScore} = useStorage();
  const [selectedGuideId, setSelectedGuideId] = useState(trailGuides[0].id);
  const [pace, setPace] = useState<RescuePace>('rapid');

  return (
    <Screen scroll withTabBar>
      <AppText size={26} weight="900">Rescue Run</AppText>
      <AppText size={12} color={colors.mutedStrong} style={styles.subtitle}>Collect supplies, avoid hazards, keep the route alive.</AppText>
      <View style={styles.best}>
        <AppText size={15} weight="900">Best Run</AppText>
        <AppText size={18} weight="900" color={colors.orange}>{bestRunScore}</AppText>
      </View>
      <AppText size={11} weight="900" color={colors.muted} style={styles.kicker}>FIELD GUIDE</AppText>
      <View style={styles.grid}>
        {trailGuides.map(guide => {
          const active = guide.id === selectedGuideId;

          return (
            <Pressable key={guide.id} onPress={() => setSelectedGuideId(guide.id)} style={[styles.guideCard, active && styles.guideActive]}>
              <Image source={guide.image} resizeMode="contain" style={styles.guideImage} />
              <AppText weight="900">{guide.name}</AppText>
              <AppText size={12} color={colors.mutedStrong} align="center">{guide.title}</AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.pacePanel}>
        <AppText size={11} weight="900" color={colors.muted}>PACE</AppText>
        <SegmentedControl<RescuePace>
          value={pace}
          onChange={setPace}
          options={[
            {label: 'Steady', value: 'steady'},
            {label: 'Rapid', value: 'rapid'},
            {label: 'Expert', value: 'expert'},
          ]}
        />
      </View>
      <View style={styles.runBrief}>
        <View style={styles.briefRow}>
          <AppText size={13} color={colors.green}>◆</AppText>
          <AppText size={13} color={colors.mutedStrong} style={styles.briefText}>Supply tokens add points and keep the run moving.</AppText>
        </View>
        <View style={styles.briefRow}>
          <AppText size={13} color={colors.red}>◆</AppText>
          <AppText size={13} color={colors.mutedStrong} style={styles.briefText}>Hazards break momentum and cost a life.</AppText>
        </View>
        <View style={styles.briefRow}>
          <AppText size={13} color={colors.amber}>◆</AppText>
          <AppText size={13} color={colors.mutedStrong} style={styles.briefText}>Faster pace means shorter token lifetime and higher scoring.</AppText>
        </View>
      </View>
      <PrimaryButton
        title="Start Run"
        icon="▶"
        onPress={() => navigation.navigate('RescueRunPlay', {guideId: selectedGuideId, pace})}
        style={styles.start}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: 6,
  },
  best: {
    marginTop: 18,
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    marginTop: 22,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  guideCard: {
    width: '48%',
    minHeight: 128,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  guideActive: {
    borderColor: colors.orange,
    backgroundColor: 'rgba(255, 116, 23, 0.16)',
  },
  guideImage: {
    width: 54,
    height: 62,
  },
  pacePanel: {
    marginTop: 24,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
  },
  runBrief: {
    marginTop: 18,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10,
  },
  briefRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  briefText: {
    flex: 1,
    lineHeight: 19,
  },
  start: {
    marginTop: 18,
  },
});
