import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {AppText} from '../components/AppText';
import {SpeciesCard} from '../components/Cards';
import {Screen} from '../components/Screen';
import {SearchField} from '../components/SearchField';
import {SegmentedControl} from '../components/SegmentedControl';
import {speciesCatalog} from '../data';
import {colors, radii} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type SpeciesMode = 'all' | 'risk' | 'mammal' | 'other';

export function SpeciesScreen() {
  const navigation = useNavigation<Navigation>();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SpeciesMode>('all');

  const atRiskCount = useMemo(
    () => speciesCatalog.filter(item => item.status.includes('Endangered') || item.status.includes('Vulnerable')).length,
    [],
  );

  const visibleSpecies = useMemo(() => {
    const text = query.trim().toLowerCase();
    const filteredByMode = speciesCatalog.filter(item => {
      if (mode === 'risk') {
        return item.status.includes('Endangered') || item.status.includes('Vulnerable');
      }

      if (mode === 'mammal') {
        return item.tag === 'Mammal';
      }

      if (mode === 'other') {
        return item.tag !== 'Mammal';
      }

      return true;
    });

    if (!text) {
      return filteredByMode;
    }

    return filteredByMode.filter(item =>
      [item.name, item.tag, item.habitat, item.region, item.status].some(value =>
        value.toLowerCase().includes(text),
      ),
    );
  }, [mode, query]);

  return (
    <Screen scroll withTabBar>
      <AppText size={26} weight="900" style={styles.title}>Species Index</AppText>
      <View style={styles.summary}>
        <View>
          <AppText size={11} weight="900" color={colors.muted}>WATCHLIST</AppText>
          <AppText size={14} color={colors.mutedStrong}>Threat status, habitats, and field behaviors</AppText>
        </View>
        <AppText size={24} weight="900" color={colors.orange}>{atRiskCount}</AppText>
      </View>
      <SearchField value={query} onChangeText={setQuery} placeholder="Search species, region, habitat..." />
      <View style={styles.segment}>
        <SegmentedControl<SpeciesMode>
          value={mode}
          onChange={setMode}
          options={[
            {label: 'All', value: 'all'},
            {label: 'Risk', value: 'risk'},
            {label: 'Mammals', value: 'mammal'},
            {label: 'Other', value: 'other'},
          ]}
        />
      </View>
      {visibleSpecies.length ? (
        <View style={styles.grid}>
          {visibleSpecies.map((item, index) => (
            <View key={item.id} style={[styles.cell, index % 2 === 0 ? styles.left : styles.right]}>
              <SpeciesCard item={item} onPress={() => navigation.navigate('SpeciesBrief', {speciesId: item.id})} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <AppText color={colors.mutedStrong}>No species matched your filters</AppText>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 14,
  },
  summary: {
    minHeight: 74,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  segment: {
    marginTop: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 16,
  },
  cell: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  left: {
    paddingLeft: 0,
  },
  right: {
    paddingRight: 0,
  },
  empty: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
