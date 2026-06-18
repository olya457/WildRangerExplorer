import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Image, ImageBackground, LayoutChangeEvent, Pressable, StyleSheet, View} from 'react-native';
import {expeditionVisuals} from '../assets/assets';
import {AppText} from '../components/AppText';
import {PrimaryButton} from '../components/Buttons';
import {Screen} from '../components/Screen';
import {trailGuides} from '../data';
import {colors, radii} from '../theme/theme';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'RescueRunPlay'>;
type RescuePace = 'steady' | 'rapid' | 'expert';
type TokenKind = 'supply' | 'cache' | 'hazard';

const guideSize = 74;
const tokenSize = 44;
const paceRules: Record<RescuePace, {step: number; lifetime: number; label: string}> = {
  steady: {step: 32, lifetime: 13800, label: 'Steady'},
  rapid: {step: 38, lifetime: 11200, label: 'Rapid'},
  expert: {step: 44, lifetime: 8800, label: 'Expert'},
};
const tokenScore: Record<TokenKind, number> = {
  supply: 10,
  cache: 22,
  hazard: -8,
};

export function RescueRunPlayScreen({route, navigation}: Props) {
  const pace = route.params.pace;
  const rules = paceRules[pace];
  const guide = trailGuides.find(item => item.id === route.params.guideId) ?? trailGuides[0];
  const [field, setField] = useState({width: 0, height: 0});
  const [position, setPosition] = useState({x: 0, y: 0});
  const [token, setToken] = useState<{id: number; x: number; y: number; kind: TokenKind} | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [paused, setPaused] = useState(false);

  const lifeMarks = useMemo(() => Array.from({length: 3}, (_, index) => (index < lives ? '♥' : '♡')).join(' '), [lives]);
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

  const spawnToken = useCallback(() => {
    if (field.width <= tokenSize || field.height <= tokenSize) {
      return;
    }

    const roll = Math.random();
    const kind: TokenKind = roll > 0.82 ? 'hazard' : roll > 0.58 ? 'cache' : 'supply';

    setToken({
      id: Date.now(),
      kind,
      x: Math.random() * (field.width - tokenSize - 24) + 12,
      y: Math.random() * (field.height * 0.58 - tokenSize) + 30,
    });
  }, [field.height, field.width]);

  const onFieldLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setField({width, height});
    setPosition({
      x: width / 2 - guideSize / 2,
      y: height * 0.62,
    });
  };

  const finish = useCallback(() => {
    navigation.replace('RescueRunResult', {score, guideId: guide.id, pace});
  }, [guide.id, navigation, pace, score]);

  useEffect(() => {
    if (field.width && !token) {
      spawnToken();
    }
  }, [field.width, spawnToken, token]);

  useEffect(() => {
    if (!token || paused || lives <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      if (token.kind !== 'hazard') {
        setLives(value => value - 1);
      }
      spawnToken();
    }, rules.lifetime);

    return () => clearTimeout(timer);
  }, [lives, paused, rules.lifetime, spawnToken, token]);

  useEffect(() => {
    if (lives <= 0) {
      finish();
    }
  }, [finish, lives]);

  useEffect(() => {
    if (!token || paused || lives <= 0) {
      return;
    }

    const guideCenter = {
      x: position.x + guideSize / 2,
      y: position.y + guideSize / 2,
    };
    const tokenCenter = {
      x: token.x + tokenSize / 2,
      y: token.y + tokenSize / 2,
    };
    const distance = Math.hypot(guideCenter.x - tokenCenter.x, guideCenter.y - tokenCenter.y);

    if (distance < 54) {
      if (token.kind === 'hazard') {
        setScore(value => Math.max(0, value + tokenScore.hazard));
        setLives(value => value - 1);
      } else {
        setScore(value => value + tokenScore[token.kind]);
      }
      spawnToken();
    }
  }, [lives, paused, position.x, position.y, spawnToken, token]);

  const move = (dx: number, dy: number) => {
    setPosition(value => ({
      x: clamp(value.x + dx, 0, Math.max(0, field.width - guideSize)),
      y: clamp(value.y + dy, 0, Math.max(0, field.height - guideSize)),
    }));
  };

  if (paused) {
    return (
      <Screen contentStyle={styles.pause}>
        <AppText size={58}>Ⅱ</AppText>
        <AppText size={30} weight="900">Paused</AppText>
        <AppText color={colors.mutedStrong}>{rules.label} run held</AppText>
        <PrimaryButton title="Resume" onPress={() => setPaused(false)} style={styles.pauseButton} />
        <Pressable onPress={() => navigation.navigate('TrailTabs', {screen: 'RescueRun'})} style={styles.textButton}>
          <AppText color={colors.mutedStrong} weight="800">Exit</AppText>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen padded={false} contentStyle={styles.root}>
      <View style={styles.top}>
        <AppText size={20} color={colors.orange}>{lifeMarks}</AppText>
        <View style={styles.score}>
          <AppText size={12} color={colors.mutedStrong}>{rules.label}</AppText>
          <AppText size={22} weight="900">{score}</AppText>
        </View>
        <Pressable onPress={() => setPaused(true)} style={styles.pauseCircle}>
          <AppText>Ⅱ</AppText>
        </Pressable>
      </View>
      <ImageBackground source={expeditionVisuals.baseCampBackdrop} resizeMode="cover" style={styles.field} imageStyle={styles.fieldImage} onLayout={onFieldLayout}>
        {token ? (
          <View style={[styles.token, styles[token.kind], {left: token.x, top: token.y}]}>
            <AppText size={22}>{token.kind === 'hazard' ? '×' : token.kind === 'cache' ? '✦' : '◆'}</AppText>
          </View>
        ) : null}
        <Image source={guide.image} resizeMode="contain" style={[styles.guide, {left: position.x, top: position.y}]} />
        <View style={styles.controls}>
          <Arrow label="↑" onPress={() => move(0, -rules.step)} />
          <View style={styles.controlRow}>
            <Arrow label="←" onPress={() => move(-rules.step, 0)} />
            <View style={styles.centerDot} />
            <Arrow label="→" onPress={() => move(rules.step, 0)} />
          </View>
          <Arrow label="↓" onPress={() => move(0, rules.step)} />
        </View>
      </ImageBackground>
    </Screen>
  );
}

function Arrow({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.arrow, pressed && styles.pressed]}>
      <AppText size={25}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 18,
  },
  top: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  score: {
    alignItems: 'center',
    gap: 2,
  },
  pauseCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  field: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldImage: {
    borderRadius: radii.md,
  },
  guide: {
    position: 'absolute',
    width: guideSize,
    height: guideSize,
  },
  token: {
    position: 'absolute',
    width: tokenSize,
    height: tokenSize,
    borderRadius: tokenSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  supply: {
    borderColor: colors.green,
    backgroundColor: 'rgba(104, 181, 74, 0.25)',
  },
  cache: {
    borderColor: colors.amber,
    backgroundColor: 'rgba(244, 163, 0, 0.25)',
  },
  hazard: {
    borderColor: colors.red,
    backgroundColor: 'rgba(242, 71, 88, 0.28)',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  arrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  centerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
  },
  pause: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  pauseButton: {
    width: '50%',
    marginTop: 10,
  },
  textButton: {
    padding: 12,
  },
  pressed: {
    opacity: 0.78,
  },
});
