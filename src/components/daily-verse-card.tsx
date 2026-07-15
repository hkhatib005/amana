import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDailyVerse } from '@/hooks/use-daily-verse';

export function DailyVerseCard() {
  const { loading, verse, error } = useDailyVerse();

  if (loading || error || !verse) {
    return (
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="small" themeColor="textSecondary">
          {loading ? 'Loading today’s verse…' : error}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText style={styles.arabic}>{verse.arabic}</ThemedText>
      <ThemedText type="small">{verse.translation}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Qur&apos;an {verse.verseKey}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  arabic: {
    fontSize: 22,
    lineHeight: 36,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
