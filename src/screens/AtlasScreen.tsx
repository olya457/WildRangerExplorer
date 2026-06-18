import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import {AppText} from '../components/AppText';
import {Screen} from '../components/Screen';
import {SegmentedControl} from '../components/SegmentedControl';
import {protectedSites} from '../data';
import {useStorage} from '../storage/StorageProvider';
import {colors, radii} from '../theme/theme';
import type {ProtectedSite} from '../types/models';
import type {RootStackParamList} from '../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type AtlasMode = 'world' | 'plan';

export function AtlasScreen() {
  const navigation = useNavigation<Navigation>();
  const {plannedSiteIds, isSitePlanned} = useStorage();
  const [mode, setMode] = useState<AtlasMode>('world');
  const visibleSites = useMemo(
    () => (mode === 'plan' ? protectedSites.filter(site => plannedSiteIds.includes(site.id)) : protectedSites),
    [mode, plannedSiteIds],
  );
  const [selected, setSelected] = useState<ProtectedSite | null>(visibleSites[0] ?? protectedSites[0]);

  const markerSites = visibleSites.length ? visibleSites : protectedSites;

  return (
    <Screen withTabBar padded={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText size={26} weight="900">Route Atlas</AppText>
          <AppText size={12} color={colors.mutedStrong}>Tap markers, build a plan, open field briefs</AppText>
        </View>
        <SegmentedControl<AtlasMode>
          value={mode}
          onChange={value => {
            setMode(value);
            const nextSites = value === 'plan' ? protectedSites.filter(site => plannedSiteIds.includes(site.id)) : protectedSites;
            setSelected(nextSites[0] ?? protectedSites[0]);
          }}
          options={[
            {label: 'World', value: 'world'},
            {label: 'Plan', value: 'plan'},
          ]}
        />
      </View>
      <View style={styles.mapWrap}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: -5,
            longitude: 22,
            latitudeDelta: 65,
            longitudeDelta: 65,
          }}
          showsCompass={false}
          showsMyLocationButton={false}>
          {markerSites.map(site => {
            const planned = isSitePlanned(site.id);

            return (
              <Marker
                key={site.id}
                coordinate={{latitude: site.latitude, longitude: site.longitude}}
                tracksViewChanges={false}
                onPress={() => setSelected(site)}>
                <View
                  style={[
                    styles.marker,
                    planned && styles.markerPlanned,
                    selected?.id === site.id && styles.markerActive,
                  ]}
                />
              </Marker>
            );
          })}
        </MapView>
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <AppText size={12} color={colors.mutedStrong}>{mode === 'plan' ? 'Planned Route' : 'Protected Site'}</AppText>
        </View>
        {selected ? (
          <View style={styles.selectedCard}>
            <View style={styles.selectedCopy}>
              <AppText size={12} color={colors.muted}>{selected.tag}</AppText>
              <AppText size={18} weight="900" numberOfLines={1}>{selected.name}</AppText>
              <AppText size={12} color={colors.mutedStrong}>⌖ {selected.location}</AppText>
            </View>
            <Pressable
              onPress={() => navigation.navigate('SiteBrief', {siteId: selected.id})}
              style={({pressed}) => [styles.viewButton, pressed && styles.pressed]}>
              <AppText size={13} weight="900">Open ›</AppText>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  headerCopy: {
    gap: 6,
  },
  mapWrap: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.amber,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.42)',
  },
  markerPlanned: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.green,
  },
  markerActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.orange,
  },
  legend: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderRadius: radii.round,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.amber,
  },
  selectedCard: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    minHeight: 96,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedCopy: {
    flex: 1,
    gap: 4,
  },
  viewButton: {
    minWidth: 74,
    height: 46,
    borderRadius: radii.round,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
