import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { PrayerCalculationMethods } from '@/constants/prayer-methods';
import { useNotificationPreferences } from '@/providers/notifications-provider';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const QURAN_REMINDER_PRESETS = [
  { label: 'Morning · 8:00 AM', hour: 8, minute: 0 },
  { label: 'Afternoon · 2:00 PM', hour: 14, minute: 0 },
  { label: 'Evening · 8:00 PM', hour: 20, minute: 0 },
];

export default function SettingsScreen() {
  const { method, setMethod } = usePrayerTimes();
  const {
    quranReminderEnabled,
    setQuranReminderEnabled,
    quranReminderTime,
    setQuranReminderTime,
    dhuhrAsrDuaEnabled,
    setDhuhrAsrDuaEnabled,
    jumuahMorningEnabled,
    setJumuahMorningEnabled,
    fridayBlessingsEnabled,
    setFridayBlessingsEnabled,
    fridayDuaEnabled,
    setFridayDuaEnabled,
  } = useNotificationPreferences();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PageHeader title="Settings" />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
        <ThemedText type="smallBold">Notifications</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Turn on reminders per prayer using the bell icons on the Prayers tab.
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.optionList}>
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Daily Qur&apos;an reminder</ThemedText>
            <Switch value={quranReminderEnabled} onValueChange={setQuranReminderEnabled} />
          </View>

          {quranReminderEnabled && (
            <View style={styles.presetRow}>
              {QURAN_REMINDER_PRESETS.map((preset) => {
                const selected =
                  quranReminderTime.hour === preset.hour && quranReminderTime.minute === preset.minute;
                return (
                  <Pressable
                    key={preset.label}
                    onPress={() => setQuranReminderTime({ hour: preset.hour, minute: preset.minute })}>
                    <ThemedView
                      type={selected ? 'backgroundSelected' : 'backgroundElement'}
                      style={styles.presetChip}>
                      <ThemedText type={selected ? 'smallBold' : 'small'}>{preset.label}</ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Dua between Dhuhr and Asr</ThemedText>
            <Switch value={dhuhrAsrDuaEnabled} onValueChange={setDhuhrAsrDuaEnabled} />
          </View>
        </ThemedView>

        <ThemedText type="smallBold">Friday (Jumu&apos;ah)</ThemedText>

        <ThemedView type="backgroundElement" style={styles.optionList}>
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Friday sunnahs reminder</ThemedText>
            <Switch value={jumuahMorningEnabled} onValueChange={setJumuahMorningEnabled} />
          </View>
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Send blessings reminders</ThemedText>
            <Switch value={fridayBlessingsEnabled} onValueChange={setFridayBlessingsEnabled} />
          </View>
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Hour-of-acceptance dua</ThemedText>
            <Switch value={fridayDuaEnabled} onValueChange={setFridayDuaEnabled} />
          </View>
        </ThemedView>

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
        </ScrollView>
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
    maxWidth: MaxContentWidth,
  },
  scroll: {
    alignSelf: 'stretch',
    width: '100%',
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  hint: {
    marginTop: -Spacing.two,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  switchLabel: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  presetChip: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
