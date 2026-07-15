import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { PrayerCalculationMethods } from '@/constants/prayer-methods';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

export default function SettingsScreen() {
  const { method, setMethod } = usePrayerTimes();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>

        <ThemedText type="smallBold">Prayer calculation method</ThemedText>

        <ThemedView type="backgroundElement" style={styles.optionList}>
          {Object.entries(PrayerCalculationMethods).map(([key, { label }]) => (
            <Pressable key={key} onPress={() => setMethod(key as keyof typeof PrayerCalculationMethods)}>
              <ThemedView
                type={key === method ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.optionRow}>
                <ThemedText type={key === method ? 'smallBold' : 'default'}>{label}</ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    paddingTop: Spacing.three,
  },
  optionList: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  optionRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
});
