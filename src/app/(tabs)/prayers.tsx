import { Linking, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { currentAndNextPrayer, DailyPrayerTimes } from '@/lib/prayer-times';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const PRAYER_LABELS: { key: keyof DailyPrayerTimes; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'sunrise', label: 'Sunrise' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function PrayersScreen() {
  const { loading, permissionDenied, error, times, retry } = usePrayerTimes();
  const { current } = times ? currentAndNextPrayer(times) : { current: null };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Prayers
        </ThemedText>

        {loading && <ThemedText type="small">Finding your location…</ThemedText>}

        {!loading && permissionDenied && (
          <ThemedView type="backgroundElement" style={styles.messageCard}>
            <ThemedText>
              Location access is needed to calculate prayer times for where you are.
            </ThemedText>
            <Pressable onPress={() => Linking.openSettings()}>
              <ThemedText type="linkPrimary">Open Settings</ThemedText>
            </Pressable>
          </ThemedView>
        )}

        {!loading && error && (
          <ThemedView type="backgroundElement" style={styles.messageCard}>
            <ThemedText>{error}</ThemedText>
            <Pressable onPress={retry}>
              <ThemedText type="linkPrimary">Try Again</ThemedText>
            </Pressable>
          </ThemedView>
        )}

        {!loading && times && (
          <ThemedView type="backgroundElement" style={styles.prayerList}>
            {PRAYER_LABELS.map(({ key, label }) => (
              <ThemedView
                key={key}
                type={key === current ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.prayerRow}>
                <ThemedText type={key === current ? 'smallBold' : 'default'}>{label}</ThemedText>
                <ThemedText type="smallBold">{formatTime(times[key])}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
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
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    paddingTop: Spacing.three,
  },
  messageCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  prayerList: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
});
