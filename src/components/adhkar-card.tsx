import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EVENING_OPENER, MORNING_OPENER } from '@/constants/adhkar-openers';
import { Spacing } from '@/constants/theme';
import { isMorningAdhkarTime } from '@/lib/prayer-times';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const MORNING_COLOR = '#C77F00';
const EVENING_COLOR = '#4C4AAE';

export function AdhkarCard() {
  const { times } = usePrayerTimes();
  if (!times) return null;

  const isMorning = isMorningAdhkarTime(times.fajr, times.asr);
  const opener = isMorning ? MORNING_OPENER : EVENING_OPENER;
  const accent = isMorning ? MORNING_COLOR : EVENING_COLOR;

  return (
    <Link href="/adhkar" asChild>
      <Pressable style={styles.container}>
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <ThemedText type="small" style={styles.badgeText}>
            {isMorning ? '☀️ Morning' : '🌙 Evening'}
          </ThemedText>
        </View>
        <ThemedText style={styles.arabic} numberOfLines={2}>
          {opener.arabic}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
          {opener.translation}
        </ThemedText>
        <ThemedText type="small" style={{ color: accent }}>
          View all →
        </ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.two,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.half,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  arabic: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
