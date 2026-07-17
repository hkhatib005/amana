import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatHijriDate } from '@/lib/hijri-date';
import { getUpcomingIslamicDays, UpcomingIslamicDay } from '@/lib/islamic-days';

const ACCENT = '#C9A227';
const ACCENT_SOFT = 'rgba(201, 162, 39, 0.16)';

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDaysAway(daysAway: number) {
  if (daysAway === 0) return 'Today';
  if (daysAway === 1) return 'Tomorrow';
  return `In ${daysAway} days`;
}

function DaysAwayPill({ daysAway, prominent }: { daysAway: number; prominent?: boolean }) {
  const soon = daysAway <= 7;
  return (
    <View
      style={[
        styles.pill,
        soon && styles.pillSoon,
        prominent && styles.pillProminent,
        prominent && soon && styles.pillProminentSoon,
      ]}>
      <ThemedText
        type={prominent ? 'smallBold' : 'small'}
        style={
          prominent && soon
            ? styles.pillTextOnAccent
            : soon
              ? styles.pillTextSoon
              : styles.pillTextMuted
        }>
        {formatDaysAway(daysAway)}
      </ThemedText>
    </View>
  );
}

function FeaturedCard({ event }: { event: UpcomingIslamicDay }) {
  return (
    <ThemedView type="backgroundElement" style={styles.featuredCard}>
      <View style={styles.featuredEmojiBadge}>
        <ThemedText style={styles.featuredEmoji}>{event.emoji}</ThemedText>
      </View>
      <ThemedText type="subtitle" style={styles.featuredName}>
        {event.name}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.featuredDate}>
        {formatDate(event.date)}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.featuredHijri}>
        {formatHijriDate(event.date)}
      </ThemedText>
      <DaysAwayPill daysAway={event.daysAway} prominent />
    </ThemedView>
  );
}

export default function IslamicDaysScreen() {
  const upcomingDays = getUpcomingIslamicDays();
  const [featured, ...rest] = upcomingDays;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <PageHeader title="Islamic Days" />

          {featured && (
            <>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                COMING UP
              </ThemedText>
              <FeaturedCard event={featured} />
            </>
          )}

          {rest.length > 0 && (
            <>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                LATER THIS YEAR
              </ThemedText>
              <ThemedView type="backgroundElement" style={styles.list}>
                {rest.map((event, index) => (
                  <View
                    key={event.name}
                    style={[styles.row, index > 0 && styles.rowDivider]}>
                    <View style={styles.rowEmojiBadge}>
                      <ThemedText style={styles.rowEmoji}>{event.emoji}</ThemedText>
                    </View>
                    <View style={styles.rowText}>
                      <ThemedText type="smallBold">{event.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {formatDate(event.date)}
                      </ThemedText>
                    </View>
                    <DaysAwayPill daysAway={event.daysAway} />
                  </View>
                ))}
              </ThemedView>
            </>
          )}

          <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
            Dates are calculated using the Umm al-Qura calendar. Ramadan, Eid, and other
            moon-sighting-dependent dates may be announced a day earlier or later by your local
            masjid.
          </ThemedText>
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
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.two,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    maxWidth: MaxContentWidth,
    width: '100%',
    letterSpacing: 0.5,
    marginTop: Spacing.three,
  },
  featuredCard: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.five,
    borderWidth: 1,
    borderColor: ACCENT_SOFT,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  featuredEmojiBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ACCENT_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  featuredEmoji: {
    fontSize: 36,
    lineHeight: 42,
  },
  featuredName: {
    textAlign: 'center',
  },
  featuredDate: {
    textAlign: 'center',
  },
  featuredHijri: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  list: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: 'transparent',
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
  },
  rowEmojiBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmoji: {
    fontSize: 19,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'transparent',
  },
  pill: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  pillProminent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  pillSoon: {
    backgroundColor: ACCENT_SOFT,
  },
  pillProminentSoon: {
    backgroundColor: ACCENT,
  },
  pillTextMuted: {
    opacity: 0.8,
  },
  pillTextSoon: {
    color: ACCENT,
  },
  pillTextOnAccent: {
    color: '#ffffff',
  },
  footnote: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    marginTop: Spacing.three,
  },
});
