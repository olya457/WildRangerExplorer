import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {expeditionVisuals} from '../assets/assets';
import {AppText} from '../components/AppText';
import {SiteCard} from '../components/Cards';
import {Screen} from '../components/Screen';
import {SearchField} from '../components/SearchField';
import {SegmentedControl} from '../components/SegmentedControl';
import {protectedSites} from '../data';
import {useStorage} from '../storage/StorageProvider';
import {colors, radii} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ExpeditionMode = 'all' | 'planned' | 'saved';

export function ExpeditionsScreen() {
  const navigation = useNavigation<Navigation>();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ExpeditionMode>('all');
  const {
    savedSiteIds,
    plannedSiteIds,
    isSiteSaved,
    isSitePlanned,
    toggleSavedSite,
    togglePlannedSite,
  } = useStorage();

  const countries = useMemo(() => new Set(protectedSites.map(site => site.location)).size, []);
  const plannedSites = useMemo(
    () => protectedSites.filter(site => plannedSiteIds.includes(site.id)),
    [plannedSiteIds],
  );

  const visibleSites = useMemo(() => {
    const text = query.trim().toLowerCase();
    const source =
      mode === 'planned'
        ? plannedSites
        : mode === 'saved'
          ? protectedSites.filter(site => savedSiteIds.includes(site.id))
          : protectedSites;

    if (!text) {
      return source;
    }

    return source.filter(site =>
      [site.name, site.tag, site.location, site.area, ...site.wildlife].some(value =>
        value.toLowerCase().includes(text),
      ),
    );
  }, [mode, plannedSites, query, savedSiteIds]);

  const emptyMessage =
    mode === 'planned'
      ? 'Your field plan is empty'
      : mode === 'saved'
        ? 'No saved expedition sites yet'
        : 'No expedition sites match that search';

  return (
    <Screen scroll withTabBar>
      <AppText size={26} weight="900" style={styles.title}>Trailkeeper Atlas</AppText>
      <View style={styles.metrics}>
        <Metric label="Sites" value={String(protectedSites.length)} />
        <Metric label="Regions" value={String(countries)} />
        <Metric label="Plan" value={String(plannedSiteIds.length)} />
      </View>
      {plannedSites.length ? (
        <View style={styles.planStrip}>
          <View style={styles.planCopy}>
            <AppText size={11} weight="900" color={colors.muted}>FIELD PLAN</AppText>
            <AppText size={14} weight="800" numberOfLines={1}>
              {plannedSites.slice(0, 3).map(site => site.name).join('  /  ')}
            </AppText>
          </View>
          <AppText size={18} weight="900" color={colors.orange}>{plannedSites.length}</AppText>
        </View>
      ) : null}
      <SearchField value={query} onChangeText={setQuery} placeholder="Search place, country, wildlife..." />
      <View style={styles.segment}>
        <SegmentedControl<ExpeditionMode>
          value={mode}
          onChange={setMode}
          options={[
            {label: 'All', value: 'all'},
            {label: 'Plan', value: 'planned'},
            {label: 'Saved', value: 'saved'},
          ]}
        />
      </View>
      {visibleSites.length ? (
        <View style={styles.list}>
          {visibleSites.map(site => (
            <SiteCard
              key={site.id}
              item={site}
              saved={isSiteSaved(site.id)}
              planned={isSitePlanned(site.id)}
              onToggleSaved={() => toggleSavedSite(site.id)}
              onTogglePlanned={() => togglePlannedSite(site.id)}
              onPress={() => navigation.navigate('SiteBrief', {siteId: site.id})}
            />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Image source={expeditionVisuals.emptyTrailBackdrop} style={styles.emptyImage} resizeMode="cover" />
          <AppText size={15} color={colors.mutedStrong} align="center">{emptyMessage}</AppText>
        </View>
      )}
    </Screen>
  );
}

function Metric({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.metric}>
      <AppText size={11} color={colors.muted}>{label}</AppText>
      <AppText size={20} weight="900">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metric: {
    flex: 1,
    minHeight: 66,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  planStrip: {
    minHeight: 58,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  planCopy: {
    flex: 1,
    gap: 4,
  },
  segment: {
    marginTop: 16,
  },
  list: {
    gap: 16,
    marginTop: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 64,
  },
  emptyImage: {
    width: '74%',
    maxWidth: 260,
    aspectRatio: 1,
    borderRadius: radii.xl,
  },
});
