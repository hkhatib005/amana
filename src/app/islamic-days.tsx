import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getUpcomingIslamicDays } from '@/lib/islamic-days';

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDaysAway(daysAway: number) {
  if (daysAway === 0) return 'Today';
  if (daysAway === 1) return 'Tomorrow';
  return `In ${daysAway} days`;
}

export default function IslamicDaysScreen() {
  const upcomingDays = getUpcomingIslamicDays();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>
            Islamic Days
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.list}>
            {upcomingDays.map((event) => (
              <ThemedView key={event.name} style={styles.row}>
                <ThemedView style={styles.rowText}>
                  <ThemedText type="smallBold">{event.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatDate(event.date)}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatDaysAway(event.daysAway)}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary">
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
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    alignSelf: 'flex-start',
    paddingTop: Spacing.three,
  },
  list: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    backgroundColor: 'transparent',
  },
  rowText: {
    backgroundColor: 'transparent',
  },
});
