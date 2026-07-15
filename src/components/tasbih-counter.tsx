import AsyncStorage from '@react-native-async-storage/async-storage';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const STORAGE_KEY = 'tasbihCount';
const BEADS_PER_ROUND = 33;
const RING_SIZE = 108;
const RING_RADIUS = RING_SIZE / 2 - 8;

function Bead({ filled, active }: { filled: boolean; active: boolean }) {
  const scale = useSharedValue(1);
  const theme = useTheme();

  useEffect(() => {
    if (active) {
      scale.value = withSequence(withTiming(1.7, { duration: 120 }), withTiming(1, { duration: 220 }));
    }
  }, [active, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bead,
        animatedStyle,
        {
          backgroundColor: filled ? '#2E7D32' : theme.backgroundSelected,
        },
      ]}
    />
  );
}

export function TasbihCounter() {
  const [count, setCount] = useState(0);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setCount(Number(saved));
    });
  }, []);

  const round = Math.floor(count / BEADS_PER_ROUND);
  const positionInRound = count % BEADS_PER_ROUND;

  useEffect(() => {
    if (round > 0 && positionInRound === 0) {
      ringScale.value = withSequence(withTiming(1.15, { duration: 150 }), withTiming(1, { duration: 250 }));
    }
  }, [round, positionInRound, ringScale]);

  function increment() {
    setCount((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  function reset() {
    setCount(0);
    AsyncStorage.setItem(STORAGE_KEY, '0');
  }

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="smallBold">Tasbih</ThemedText>
        <Pressable onPress={reset} hitSlop={8}>
          <SymbolView
            name={{ ios: 'arrow.counterclockwise', android: 'refresh', web: 'refresh' }}
            size={16}
          />
        </Pressable>
      </View>

      <Pressable onPress={increment}>
        <Animated.View style={[styles.ringWrapper, ringAnimatedStyle]}>
          {Array.from({ length: BEADS_PER_ROUND }).map((_, index) => {
            const angle = (index / BEADS_PER_ROUND) * 2 * Math.PI - Math.PI / 2;
            const x = RING_RADIUS * Math.cos(angle);
            const y = RING_RADIUS * Math.sin(angle);
            const filled = index < positionInRound;
            const active = positionInRound > 0 && index === positionInRound - 1;
            return (
              <View key={index} style={[styles.beadSlot, { transform: [{ translateX: x }, { translateY: y }] }]}>
                <Bead filled={filled} active={active} />
              </View>
            );
          })}

          <View style={styles.centerText}>
            <ThemedText type="title" style={[styles.count, { color: '#2E7D32' }]}>
              {positionInRound}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {round > 0 ? `${round} rounds` : 'tap a bead'}
            </ThemedText>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beadSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bead: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  centerText: {
    alignItems: 'center',
  },
  count: {
    fontSize: 28,
    lineHeight: 32,
  },
});
