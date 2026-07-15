import * as Notifications from 'expo-notifications';

import { PrayerCalculationMethodKey } from '@/constants/prayer-methods';
import { computePrayerTimes, computeTahajjudTime } from '@/lib/prayer-times';

const GREETING = 'Salam Fellow Muslim';

/** Stay safely under iOS's ~64 pending local notification cap while still covering several days. */
const MAX_PENDING_PRAYER_NOTIFICATIONS = 56;
const MAX_DAYS_AHEAD = 7;
const MIN_DAYS_AHEAD = 2;

export const CORE_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type CorePrayer = (typeof CORE_PRAYERS)[number];

export type ReminderPrayer = CorePrayer | 'sunrise' | 'tahajjud';
export const REMINDER_PRAYERS: readonly ReminderPrayer[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
  'tahajjud',
];

const PRAYER_LABEL: Record<CorePrayer, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

/** The prayer whose window closes when this one's window opens (used for the "missed prayer" nudge). */
const NEXT_WINDOW: Record<CorePrayer, 'sunrise' | CorePrayer> = {
  fajr: 'sunrise',
  dhuhr: 'asr',
  asr: 'maghrib',
  maghrib: 'isha',
  isha: 'fajr', // next day's fajr
};

type NotificationKind = 'prayer-at-time' | 'prayer-5min' | 'prayer-missed' | 'sunrise' | 'tahajjud';

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissionAsync(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function cancelWhere(predicate: (data: Record<string, string> | null | undefined) => boolean) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((notification) => predicate(notification.content.data as Record<string, string>))
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
  );
}

async function cancelPrayerNotifications(kinds: NotificationKind[], prayer?: CorePrayer) {
  await cancelWhere((data) => {
    if (!data || !kinds.includes(data.kind as NotificationKind)) return false;
    if (prayer && data.prayer !== prayer) return false;
    return true;
  });
}

async function scheduleAt(date: Date, title: string, body: string, data: Record<string, string>) {
  if (date.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

function slotsPerDay(enabled: Record<ReminderPrayer, boolean>): number {
  let count = 0;
  for (const prayer of CORE_PRAYERS) if (enabled[prayer]) count += 3; // at-time + 5min + missed
  if (enabled.sunrise) count += 1;
  if (enabled.tahajjud) count += 1;
  return count;
}

/**
 * Pre-schedules several days of enabled prayer notifications at once (local notifications fire
 * whether or not the app is running). Call on app start/foreground, location change, or a bell
 * toggle — it recomputes from scratch each time, so it stays accurate even after gaps.
 */
export async function scheduleUpcomingPrayerNotifications(
  coords: { latitude: number; longitude: number },
  method: PrayerCalculationMethodKey,
  enabled: Record<ReminderPrayer, boolean>,
) {
  await cancelPrayerNotifications(['prayer-at-time', 'prayer-5min', 'prayer-missed', 'sunrise', 'tahajjud']);

  const perDay = slotsPerDay(enabled);
  if (perDay === 0) return;
  const daysAhead = Math.max(
    MIN_DAYS_AHEAD,
    Math.min(MAX_DAYS_AHEAD, Math.floor(MAX_PENDING_PRAYER_NOTIFICATIONS / perDay)),
  );

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const times = computePrayerTimes(coords.latitude, coords.longitude, method, date);
    const nextFajr = computePrayerTimes(coords.latitude, coords.longitude, method, nextDate).fajr;

    for (const prayer of CORE_PRAYERS) {
      if (!enabled[prayer]) continue;
      const label = PRAYER_LABEL[prayer];
      const time = times[prayer];

      await scheduleAt(time, `${GREETING}, it's ${label} time`, '', { kind: 'prayer-at-time', prayer });

      await scheduleAt(new Date(time.getTime() - 5 * 60000), `${GREETING}, 5 mins till ${label}`, '', {
        kind: 'prayer-5min',
        prayer,
      });

      const windowEndKey = NEXT_WINDOW[prayer];
      const windowEnd = windowEndKey === 'fajr' ? nextFajr : times[windowEndKey];
      await scheduleAt(
        new Date(windowEnd.getTime() - 10 * 60000),
        `${GREETING}, we saw you didn't pray ${label}`,
        "There's 10 mins left, go pray.",
        { kind: 'prayer-missed', prayer },
      );
    }

    if (enabled.sunrise) {
      await scheduleAt(times.sunrise, `${GREETING}, it's Sunrise as well`, '', {
        kind: 'sunrise',
        prayer: 'sunrise',
      });
    }

    if (enabled.tahajjud) {
      const tahajjudTime = computeTahajjudTime(times.maghrib, nextFajr);
      await scheduleAt(
        tahajjudTime,
        `${GREETING}, it's Tahajjud time`,
        "Dua in Tahajjud is like an arrow that doesn't miss its target.",
        { kind: 'tahajjud', prayer: 'tahajjud' },
      );
    }
  }
}

/** Cancels the still-pending "missed prayer" nudge for today — call when the user marks a prayer as prayed. */
export async function cancelMissedPrayerNotification(prayer: CorePrayer) {
  await cancelPrayerNotifications(['prayer-missed'], prayer);
}

export async function scheduleQuranReminder(hour: number, minute: number) {
  await cancelWhere((data) => data?.type === 'quran-reminder');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${GREETING}, come and read 1 page of Qur'an`,
      body: 'Did you know? Each letter you read is equal to 10 good deeds.',
      data: { type: 'quran-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function cancelQuranReminder() {
  await cancelWhere((data) => data?.type === 'quran-reminder');
}

/**
 * Schedules a re-engagement nudge for `daysAhead` from now, replacing any previous one. Call this
 * every time the app is opened — as long as the user keeps opening it, this keeps getting pushed
 * further out and never fires; if they stop, the last-scheduled one delivers on its own.
 */
export async function scheduleWeMissYouReminder(daysAhead: number) {
  await cancelWhere((data) => data?.type === 'we-miss-you');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${GREETING}, we miss you`,
      body: 'Come back for prayer times, adhkar, and a page of Qur’an.',
      data: { type: 'we-miss-you' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
    },
  });
}
