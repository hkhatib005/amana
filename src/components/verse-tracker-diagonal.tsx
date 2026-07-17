import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { BrandBlue, Spacing } from '@/constants/theme';
import { useDailyVerse } from '@/hooks/use-daily-verse';
import { isDayComplete, TRACKED_PRAYERS, TrackedPrayer } from '@/lib/prayer-tracker';
import { usePrayerTracker } from '@/providers/prayer-tracker-provider';

const VERSE_GOLD = '#D4A017';
const TRACKER_GREEN = BrandBlue;

const PRAYER_LETTERS: Record<TrackedPrayer, string> = {
  fajr: 'F',
  dhuhr: 'D',
  asr: 'A',
  maghrib: 'M',
  isha: 'I',
};

function weekdayName(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

function longDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export function VerseTrackerDiagonal() {
  const { loading, verse, error } = useDailyVerse();
  const { streak, todayCompleted, togglePrayer } = usePrayerTracker();
  const complete = isDayComplete(todayCompleted);

  return (
    <View style={styles.card}>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 100 100"
        preserveAspectRatio="none">
        <Polygon points="0,0 100,0 100,100" fill={VERSE_GOLD} />
        <Polygon points="0,0 0,100 100,100" fill={TRACKER_GREEN} />
        <Line
          x1={0}
          y1={0}
          x2={100}
          y2={100}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </Svg>

      <View style={styles.versePane} pointerEvents="none">
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

      <View style={styles.trackerPane}>
        <ThemedText type="smallBold" style={styles.overlayText}>
          Salah Tracker
        </ThemedText>

        <View style={styles.prayerRow}>
          {TRACKED_PRAYERS.map((prayer) => {
            const checked = todayCompleted.includes(prayer);
            return (
              <Pressable
                key={prayer}
                onPress={() => togglePrayer(prayer)}
                style={styles.prayerToggle}
                hitSlop={4}>
                <View style={[styles.prayerCircle, checked && styles.prayerCircleChecked]}>
                  {checked && (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      tintColor={TRACKER_GREEN}
                      size={13}
                    />
                  )}
                </View>
                <ThemedText type="small" style={styles.overlayText}>
                  {PRAYER_LETTERS[prayer]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Link href="/tracker" asChild>
          <Pressable style={styles.trackerHeader}>
            <View>
              <View style={styles.weekdayRow}>
                <ThemedText style={styles.weekday}>{weekdayName(new Date())}</ThemedText>
                <View style={styles.streakChip}>
                  <SymbolView
                    name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
                    tintColor="#ffffff"
                    size={14}
                  />
                  <ThemedText type="smallBold" style={styles.overlayText}>
                    {streak}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="small" style={styles.overlayTextMuted}>
                {longDate(new Date())}
              </ThemedText>
            </View>
          </Pressable>
        </Link>

        {complete && (
          <ThemedText type="small" style={styles.acceptedNote}>
            May Allah accept 🤲
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    height: 320,
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  versePane: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    maxWidth: '70%',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  trackerPane: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.four,
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  trackerHeader: {
    alignItems: 'flex-start',
  },
  weekdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  weekday: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  prayerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  prayerToggle: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  prayerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerCircleChecked: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  acceptedNote: {
    color: '#ffffff',
    fontStyle: 'italic',
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
