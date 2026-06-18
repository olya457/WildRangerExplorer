import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {ImageBackground, Platform, ScrollView, Share, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppText} from '../components/AppText';
import {IconButton, PrimaryButton} from '../components/Buttons';
import {StatCard} from '../components/Cards';
import {protectedSites} from '../data';
import {useStorage} from '../storage/StorageProvider';
import {colors, radii, spacing} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteBrief'>;

export function SiteBriefScreen({route, navigation}: Props) {
  const site = protectedSites.find(item => item.id === route.params.siteId);
  const insets = useSafeAreaInsets();
  const {isSiteSaved, isSitePlanned, toggleSavedSite, togglePlannedSite} = useStorage();
  const top = Platform.OS === 'android' ? Math.max(insets.top, spacing.androidEdge) : insets.top;
  const bottom = Platform.OS === 'android' ? 30 : Math.max(insets.bottom, 20);

  if (!site) {
    navigation.goBack();
    return null;
  }

  const saved = isSiteSaved(site.id);
  const planned = isSitePlanned(site.id);

  const share = () => {
    Share.share({
      title: site.name,
      message: `${site.name} in ${site.location}. Expedition note: ${site.about}`,
    }).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: bottom + 18}}>
        <ImageBackground source={site.image} resizeMode="cover" style={styles.hero}>
          <View style={styles.heroShade} />
          <View style={[styles.heroButtons, {paddingTop: top + 14}]}>
            <IconButton icon="‹" onPress={() => navigation.goBack()} />
            <View style={styles.actions}>
              <IconButton icon={planned ? '◆' : '+'} onPress={() => togglePlannedSite(site.id)} active={planned} />
              <IconButton icon={saved ? '♥' : '♡'} onPress={() => toggleSavedSite(site.id)} active={saved} />
              <IconButton icon="↗" onPress={share} />
            </View>
          </View>
          <View style={styles.heroCopy}>
            <View style={styles.badge}>
              <AppText size={11} weight="900">{site.tag}</AppText>
            </View>
            <AppText size={25} weight="900" numberOfLines={2}>{site.name}</AppText>
            <AppText color={colors.mutedStrong} size={14}>⌖ {site.location}</AppText>
          </View>
        </ImageBackground>
        <View style={styles.body}>
          <View style={styles.stats}>
            <StatCard label="Area" value={site.area} />
            <StatCard label="Est." value={site.established} />
            <StatCard label="Species" value={String(site.wildlife.length)} />
          </View>
          <View style={styles.planPanel}>
            <View style={styles.planCopy}>
              <AppText size={11} weight="900" color={colors.muted}>EXPEDITION CUE</AppText>
              <AppText size={14} weight="700" color={colors.mutedStrong}>
                Track the main habitat, compare visible wildlife, then mark the site when your route is ready.
              </AppText>
            </View>
            <PrimaryButton
              title={planned ? 'In Plan' : 'Plan'}
              onPress={() => togglePlannedSite(site.id)}
              style={styles.planButton}
            />
          </View>
          <View style={styles.section}>
            <AppText size={19} weight="900">Field Brief</AppText>
            <AppText size={15} weight="600" color={colors.mutedStrong} style={styles.paragraph}>{site.about}</AppText>
          </View>
          <View style={styles.section}>
            <AppText size={19} weight="900">Wildlife to Watch</AppText>
            <View style={styles.chips}>
              {site.wildlife.map(name => (
                <View key={name} style={styles.chip}>
                  <AppText size={12} weight="800" color={colors.mutedStrong}>◇ {name}</AppText>
                </View>
              ))}
            </View>
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
    height: 310,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 4, 20, 0.38)',
  },
  heroButtons: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroCopy: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  body: {
    padding: 20,
    gap: 22,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  planPanel: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planCopy: {
    flex: 1,
    gap: 6,
  },
  planButton: {
    width: 92,
    minHeight: 46,
    borderRadius: radii.round,
  },
  section: {
    gap: 12,
  },
  paragraph: {
    lineHeight: 24,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: radii.round,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(104, 181, 74, 0.08)',
  },
});
