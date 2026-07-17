import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { dateKey, isDayComplete, TRACKED_PRAYERS, TrackedPrayer } from '@/lib/prayer-tracker';
import { usePrayerTracker } from '@/providers/prayer-tracker-provider';

const PRAYER_LABELS: Record<TrackedPrayer, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function lastSevenDays() {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
}

export default function TrackerScreen() {
  const { loading, todayCompleted, togglePrayer, streak, record } = usePrayerTracker();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <PageHeader title="Tracker" />

        {!loading && (
          <>
            <ThemedView type="backgroundElement" style={styles.streakCard}>
              <SymbolView
                name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
                tintColor="#E0722C"
                size={40}
              />
              <ThemedText type="title" style={styles.streakNumber}>
                {streak}
              </ThemedText>
              <ThemedText themeColor="textSecondary">day streak</ThemedText>
            </ThemedView>

            <View style={styles.weekRow}>
              {lastSevenDays().map((date) => {
                const complete = isDayComplete(record[dateKey(date)]);
                return (
                  <View key={dateKey(date)} style={styles.weekDay}>
                    <ThemedView
                      type={complete ? 'backgroundSelected' : 'backgroundElement'}
                      style={styles.weekDot}>
                      {complete && (
                        <SymbolView
                          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                          tintColor="#2E7D32"
                          size={14}
                        />
                      )}
                    </ThemedView>
                    <ThemedText type="small" themeColor="textSecondary">
                      {DAY_LETTERS[date.getDay()]}
                    </ThemedText>
                  </View>
                );
              })}
            </View>

            <ThemedText type="smallBold" style={styles.todayLabel}>
              Today
            </ThemedText>

            <ThemedView type="backgroundElement" style={styles.prayerList}>
              {TRACKED_PRAYERS.map((prayer) => {
                const checked = todayCompleted.includes(prayer);
                return (
                  <Pressable key={prayer} onPress={() => togglePrayer(prayer)}>
                    <View style={styles.prayerRow}>
                      <ThemedText type={checked ? 'smallBold' : 'default'}>
                        {PRAYER_LABELS[prayer]}
                      </ThemedText>
                      <SymbolView
                        name={{
                          ios: checked ? 'checkmark.circle.fill' : 'circle',
                          android: checked ? 'check_circle' : 'radio_button_unchecked',
                          web: checked ? 'check_circle' : 'radio_button_unchecked',
                        }}
                        tintColor={checked ? '#2E7D32' : undefined}
                        size={24}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </ThemedView>
          </>
        )}
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
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  streakCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: Spacing.five,
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  streakNumber: {
    fontSize: 40,
    lineHeight: 46,
  },
  weekRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: {
    alignSelf: 'flex-start',
  },
  prayerList: {
    alignSelf: 'stretch',
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
});
