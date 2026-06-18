import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, ImageBackground, StyleSheet, View} from 'react-native';
import {expeditionVisuals} from '../assets/assets';
import {colors} from '../theme/theme';
import {useStorage} from '../storage/StorageProvider';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Launch'>;

export function LaunchScreen({navigation}: Props) {
  const {ready, hasSeenOnboarding} = useStorage();
  const values = useMemo(() => [0, 1, 2, 3].map(() => new Animated.Value(0.4)), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 180),
          Animated.timing(value, {toValue: 1, duration: 420, useNativeDriver: true}),
          Animated.timing(value, {toValue: 0.4, duration: 420, useNativeDriver: true}),
          Animated.delay(260),
        ]),
      ),
    );

    animations.forEach(animation => animation.start());

    return () => animations.forEach(animation => animation.stop());
  }, [values]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    timer.current = setTimeout(() => {
      navigation.replace(hasSeenOnboarding ? 'TrailTabs' : 'Briefing');
    }, 1800);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [hasSeenOnboarding, navigation, ready]);

  return (
    <ImageBackground source={expeditionVisuals.baseCampBackdrop} style={styles.root} resizeMode="cover">
      <View style={styles.dots}>
        {values.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: value,
                transform: [{scale: value.interpolate({inputRange: [0.4, 1], outputRange: [0.85, 1.2]})}],
              },
            ]}
          />
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 18,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green,
  },
});
