import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandBlue, Spacing } from '@/constants/theme';
import { useDailyVerse } from '@/hooks/use-daily-verse';

export function VerseTrackerDiagonal() {
  const { loading, verse, error } = useDailyVerse();

  return (
    <View style={styles.card}>
      <View style={styles.versePane}>
        {loading || error || !verse ? (
          <ThemedText type="small" style={styles.overlayTextMuted}>
            {loading ? 'Loading today’s verse…' : error}
          </ThemedText>
        ) : (
          <>
            <ThemedText numberOfLines={2} style={styles.arabic}>
              {verse.arabic}
            </ThemedText>
            <ThemedText numberOfLines={3} style={[styles.translation, styles.overlayText]}>
              {verse.translation}
            </ThemedText>
            <ThemedText style={[styles.reference, styles.overlayTextMuted]}>
              Qur&apos;an {verse.verseKey}
            </ThemedText>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    borderRadius: Spacing.four,
    backgroundColor: BrandBlue,
    padding: Spacing.five,
  },
  versePane: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  arabic: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translation: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'right',
  },
  reference: {
    fontSize: 11,
    lineHeight: 15,
  },
  overlayText: {
    color: 'rgba(255,255,255,0.9)',
  },
  overlayTextMuted: {
    color: 'rgba(255,255,255,0.7)',
  },
});
