import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EVENING_OPENER, MORNING_OPENER } from '@/constants/adhkar-openers';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { AdhkarVerse, getAdhkarVerses } from '@/lib/adhkar';
import { isMorningAdhkarTime } from '@/lib/prayer-times';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

export default function AdhkarScreen() {
  const { times } = usePrayerTimes();
  const [state, setState] = useState<{
    loading: boolean;
    verses: AdhkarVerse[] | null;
    error: string | null;
  }>({ loading: true, verses: null, error: null });

  useEffect(() => {
    getAdhkarVerses()
      .then((verses) => setState({ loading: false, verses, error: null }))
      .catch(() => setState({ loading: false, verses: null, error: "Couldn't load adhkar." }));
  }, []);

  const isMorning = times ? isMorningAdhkarTime(times.fajr, times.asr) : true;
  const opener = isMorning ? MORNING_OPENER : EVENING_OPENER;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>
            {isMorning ? 'Morning Adhkar' : 'Evening Adhkar'}
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.arabic}>{opener.arabic}</ThemedText>
            <ThemedText type="small">{opener.translation}</ThemedText>
          </ThemedView>

          {state.loading && <ThemedText type="small">Loading…</ThemedText>}

          {state.error && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText>{state.error}</ThemedText>
            </ThemedView>
          )}

          {state.verses?.map((verse) => (
            <ThemedView key={verse.key} type="backgroundElement" style={styles.card}>
              <ThemedText style={styles.arabic}>{verse.arabic}</ThemedText>
              <ThemedText type="small">{verse.translation}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Qur&apos;an {verse.key}
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    alignSelf: 'flex-start',
    paddingTop: Spacing.three,
  },
  card: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  arabic: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
