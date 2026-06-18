import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {ImageBackground, Platform, ScrollView, Share, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppText} from '../components/AppText';
import {IconButton} from '../components/Buttons';
import {StatCard} from '../components/Cards';
import {speciesCatalog} from '../data';
import {colors, radii, spacing} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SpeciesBrief'>;

export function SpeciesBriefScreen({route, navigation}: Props) {
  const species = speciesCatalog.find(item => item.id === route.params.speciesId);
  const insets = useSafeAreaInsets();
  const top = Platform.OS === 'android' ? Math.max(insets.top, spacing.androidEdge) : insets.top;
  const bottom = Platform.OS === 'android' ? 30 : Math.max(insets.bottom, 20);

  if (!species) {
    navigation.goBack();
    return null;
  }

  const atRisk = species.status.includes('Endangered') || species.status.includes('Vulnerable');
  const share = () => {
    Share.share({
      title: species.name,
      message: `${species.name}: ${species.about}`,
    }).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: bottom + 18}}>
        <ImageBackground source={species.image} resizeMode="cover" style={styles.hero}>
          <View style={styles.heroShade} />
          <View style={[styles.heroButtons, {paddingTop: top + 14}]}>
            <IconButton icon="‹" onPress={() => navigation.goBack()} />
            <IconButton icon="↗" onPress={share} />
          </View>
          <View style={styles.heroCopy}>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, atRisk && styles.redBadge]}>
                <AppText size={11} weight="900" color={atRisk ? colors.red : colors.amber}>{species.status.split('/')[0]}</AppText>
              </View>
              <AppText size={13} color={colors.mutedStrong}>{species.tag}</AppText>
            </View>
            <AppText size={29} weight="900" numberOfLines={2}>{species.name}</AppText>
          </View>
        </ImageBackground>
        <View style={styles.body}>
          <View style={styles.stats}>
            <StatCard label="Region" value={species.region} />
            <StatCard label="Size" value={species.size} />
          </View>
          <View style={styles.signal}>
            <AppText size={11} weight="900" color={colors.muted}>FIELD SIGNAL</AppText>
            <AppText size={14} weight="700" color={colors.mutedStrong}>{species.keyFacts[0]}</AppText>
          </View>
          <View style={styles.section}>
            <AppText size={19} weight="900">Habitat Profile</AppText>
            <AppText size={15} weight="600" color={colors.mutedStrong} style={styles.paragraph}>{species.habitat}</AppText>
          </View>
          <View style={styles.section}>
            <AppText size={19} weight="900">Field Brief</AppText>
            <AppText size={15} weight="600" color={colors.mutedStrong} style={styles.paragraph}>{species.about}</AppText>
          </View>
          <View style={styles.section}>
            <AppText size={19} weight="900">Behavior Pattern</AppText>
            <AppText size={15} weight="600" color={colors.mutedStrong} style={styles.paragraph}>{species.behavior}</AppText>
          </View>
          <View style={styles.section}>
            <AppText size={19} weight="900">Quick Notes</AppText>
            {species.keyFacts.map(fact => (
              <View key={fact} style={styles.factRow}>
                <AppText size={14} color={colors.green}>◇</AppText>
                <AppText size={14} weight="700" color={colors.mutedStrong} style={styles.factText}>{fact}</AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    height: 330,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 4, 20, 0.34)',
  },
  heroButtons: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCopy: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: colors.amber,
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(244, 163, 0, 0.14)',
  },
  redBadge: {
    borderColor: colors.red,
    backgroundColor: 'rgba(242, 71, 88, 0.14)',
  },
  body: {
    padding: 20,
    gap: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  signal: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8,
  },
  section: {
    gap: 12,
  },
  paragraph: {
    lineHeight: 24,
  },
  factRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  factText: {
    flex: 1,
    lineHeight: 22,
  },
});
