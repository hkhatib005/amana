import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { setHasCompletedOnboarding } from '@/lib/onboarding';
import { useNotificationPreferences } from '@/providers/notifications-provider';

const ACCENT = '#3c87f7';

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { completeOnboarding } = useNotificationPreferences();
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [quranReminder, setQuranReminder] = useState(true);
  const [dhuhrAsrDua, setDhuhrAsrDua] = useState(true);
  const [fridayReminders, setFridayReminders] = useState(true);
  const [tahajjud, setTahajjud] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    setSubmitting(true);
    await completeOnboarding({ prayerReminders, tahajjud, quranReminder, dhuhrAsrDua, fridayReminders });
    await setHasCompletedOnboarding();
    onDone();
  }

  async function handleSkip() {
    setSubmitting(true);
    await setHasCompletedOnboarding();
    onDone();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>
            Welcome to Amana
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Let&apos;s get a couple things set up.
          </ThemedText>

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Location
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              Amana uses your location to calculate accurate prayer times and the Qibla direction
              for where you are. You&apos;ll be asked to allow this in a moment — it&apos;s required
              for the app to work.
            </ThemedText>
          </ThemedView>

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Notifications
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHint}>
            Pick what you&apos;d like reminders for. You can change any of this later in Settings.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabelGroup}>
                <ThemedText>Prayer time reminders</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  15 minutes before, and when each prayer starts
                </ThemedText>
              </View>
              <Switch value={prayerReminders} onValueChange={setPrayerReminders} />
            </View>

            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Daily Qur&apos;an reminder</ThemedText>
              <Switch value={quranReminder} onValueChange={setQuranReminder} />
            </View>

            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Wednesday Dua (Dhuhr–Asr)</ThemedText>
              <Switch value={dhuhrAsrDua} onValueChange={setDhuhrAsrDua} />
            </View>

            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Friday (Jumu&apos;ah) reminders</ThemedText>
              <Switch value={fridayReminders} onValueChange={setFridayReminders} />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelGroup}>
                <ThemedText>Tahajjud reminder</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Fires in the middle of the night
                </ThemedText>
              </View>
              <Switch value={tahajjud} onValueChange={setTahajjud} />
            </View>
          </ThemedView>

          <Pressable
            onPress={handleContinue}
            disabled={submitting}
            style={[styles.continueButton, submitting && styles.buttonDisabled]}>
            <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
          </Pressable>

          <Pressable onPress={handleSkip} disabled={submitting} hitSlop={8}>
            <ThemedText type="link" themeColor="textSecondary" style={styles.skipText}>
              Skip for now
            </ThemedText>
          </Pressable>
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
    alignItems: 'center',
  },
  scroll: {
    alignSelf: 'stretch',
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    marginBottom: Spacing.four,
  },
  sectionLabel: {
    marginTop: Spacing.three,
  },
  sectionHint: {
    marginTop: -Spacing.one,
    marginBottom: Spacing.one,
  },
  card: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  switchLabel: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  switchLabelGroup: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  continueButton: {
    marginTop: Spacing.five,
    backgroundColor: ACCENT,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  skipText: {
    marginTop: Spacing.three,
    textAlign: 'center',
  },
});
