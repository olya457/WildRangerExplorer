import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {Pressable, Share, StyleSheet, View} from 'react-native';
import {AppText} from '../components/AppText';
import {PrimaryButton} from '../components/Buttons';
import {Screen} from '../components/Screen';
import {SearchField} from '../components/SearchField';
import {SegmentedControl} from '../components/SegmentedControl';
import {fieldNotes} from '../data';
import {useStorage} from '../storage/StorageProvider';
import {colors, radii} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type NoteMode = 'all' | 'land' | 'water' | 'risk';
type ChallengeDifficulty = 'scout' | 'tracker' | 'warden';

export function FieldNotesScreen() {
  const navigation = useNavigation<Navigation>();
  const {bestChallengeScore} = useStorage();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<NoteMode>('all');
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>('tracker');
  const dailyNote = useMemo(() => fieldNotes[new Date().getDate() % fieldNotes.length], []);

  const visibleNotes = useMemo(() => {
    const text = query.trim().toLowerCase();
    const source = fieldNotes.filter(note => {
      const haystack = `${note.category} ${note.text}`.toLowerCase();

      if (mode === 'land') {
        return /forest|mountain|desert|savanna|grassland|climbing|herd|predator|territory/.test(haystack);
      }

      if (mode === 'water') {
        return /ocean|marine|water|wetland|reef|coastal|seal|turtle|whale|fish/.test(haystack);
      }

      if (mode === 'risk') {
        return /survival|protection|defense|threat|camouflage|instinct|alertness/.test(haystack);
      }

      return true;
    });

    if (!text) {
      return source;
    }

    return source.filter(note =>
      [note.category, note.text].some(value => value.toLowerCase().includes(text)),
    );
  }, [mode, query]);

  const shareNote = (category: string, text: string) => {
    Share.share({message: `${category}: ${text}`}).catch(() => {});
  };

  return (
    <Screen scroll withTabBar>
      <AppText size={24} weight="900">Field Notes</AppText>
      <View style={styles.dailyCard}>
        <View style={styles.dailyIcon}>
          <AppText size={24}>{dailyNote.icon}</AppText>
        </View>
        <View style={styles.dailyCopy}>
          <AppText size={11} weight="900" color={colors.muted}>DAILY SIGNAL</AppText>
          <AppText size={14} weight="700" color={colors.mutedStrong} style={styles.factText}>{dailyNote.text}</AppText>
        </View>
      </View>
      <View style={styles.challengeCard}>
        <View style={styles.challengeCopy}>
          <AppText size={17} weight="900">Trail Challenge</AppText>
          <AppText size={12} color={colors.mutedStrong}>Best score {bestChallengeScore}</AppText>
          <SegmentedControl<ChallengeDifficulty>
            value={difficulty}
            onChange={setDifficulty}
            options={[
              {label: 'Scout', value: 'scout'},
              {label: 'Track', value: 'tracker'},
              {label: 'Warden', value: 'warden'},
            ]}
          />
          <PrimaryButton
            title="Start"
            icon="▶"
            onPress={() => navigation.navigate('Challenge', {difficulty})}
            style={styles.challengeButton}
          />
        </View>
        <AppText size={58} style={styles.challengeGlyph}>✦</AppText>
      </View>
      <SearchField value={query} onChangeText={setQuery} placeholder="Search field notes..." />
      <View style={styles.modeWrap}>
        <SegmentedControl<NoteMode>
          value={mode}
          onChange={setMode}
          options={[
            {label: 'All', value: 'all'},
            {label: 'Land', value: 'land'},
            {label: 'Water', value: 'water'},
            {label: 'Risk', value: 'risk'},
          ]}
        />
      </View>
      <View style={styles.list}>
        {visibleNotes.map(note => (
          <View key={note.id} style={styles.factCard}>
            <View style={styles.factIcon}>
              <AppText size={21}>{note.icon}</AppText>
            </View>
            <View style={styles.factBody}>
              <View style={styles.factHeader}>
                <View style={styles.factBadge}>
                  <AppText size={10} weight="900" color={colors.mutedStrong}>{note.category}</AppText>
                </View>
                <Pressable onPress={() => shareNote(note.category, note.text)} style={styles.share}>
                  <AppText size={14}>↗</AppText>
                </Pressable>
              </View>
              <AppText size={14} weight="600" color={colors.mutedStrong} style={styles.factText}>{note.text}</AppText>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dailyCard: {
    marginTop: 14,
    minHeight: 118,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  dailyIcon: {
    width: 38,
    alignItems: 'center',
    paddingTop: 2,
  },
  dailyCopy: {
    flex: 1,
    gap: 8,
  },
  challengeCard: {
    minHeight: 194,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 18,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 14,
  },
  challengeCopy: {
    maxWidth: '82%',
    gap: 10,
  },
  challengeButton: {
    minHeight: 42,
    width: 112,
    borderRadius: radii.round,
    marginTop: 2,
  },
  challengeGlyph: {
    position: 'absolute',
    right: 22,
    top: 34,
    opacity: 0.22,
  },
  modeWrap: {
    marginTop: 14,
  },
  list: {
    marginTop: 14,
    gap: 14,
  },
  factCard: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  factIcon: {
    width: 30,
    alignItems: 'center',
    paddingTop: 2,
  },
  factBody: {
    flex: 1,
    gap: 10,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.round,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  share: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  factText: {
    lineHeight: 22,
  },
});
