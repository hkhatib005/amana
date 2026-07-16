import * as Notifications from 'expo-notifications';

import prayerVirtues from '@/constants/prayer-virtues.json';
import { PrayerCalculationMethodKey } from '@/constants/prayer-methods';
import { computePrayerTimes, computeTahajjudTime } from '@/lib/prayer-times';

const APP_TITLE = 'Amana - Muslim App';
const GREETING = 'Salam Fellow Muslim';

function body(message: string) {
  return `${GREETING}, ${message}`;
}

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

type VirtueFact = { text: string; source: string };
const PRAYER_VIRTUES = prayerVirtues as unknown as Record<CorePrayer, VirtueFact[]>;

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

/** YYYY-MM-DD in local time, used to build stable per-day notification identifiers. */
function dateStamp(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Deterministic per-day rotation so re-scheduling the same date never changes which fact was picked. */
function virtueForPrayer(prayer: CorePrayer, date: Date): VirtueFact {
  const facts = PRAYER_VIRTUES[prayer];
  return facts[dayOfYear(date) % facts.length];
}

/** Friday, using JS's Date#getDay() (Sunday = 0 ... Saturday = 6). */
function isFriday(date: Date) {
  return date.getDay() === 5;
}

/** iOS CalendarTrigger weekday numbering: Sunday = 1 ... Saturday = 7. */
const IOS_FRIDAY_WEEKDAY = 6;

type NotificationKind =
  | 'prayer-at-time'
  | 'prayer-15min'
  | 'prayer-missed'
  | 'sunrise'
  | 'tahajjud'
  | 'dhuhr-asr-dua'
  | 'friday-dua';

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

/**
 * `identifier` is deterministic (kind + prayer + date) so re-running this for the same slot
 * *replaces* the pending request in place (standard UNUserNotificationCenter behavior) instead of
 * racing with `cancelWhere` to avoid a duplicate — this is what actually prevents double-fires.
 */
async function scheduleAt(
  date: Date,
  title: string,
  message: string,
  data: Record<string, string>,
  identifier: string,
) {
  if (date.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body: message, data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

export type ExtraDailyToggles = {
  dhuhrAsrDuaEnabled: boolean;
  fridayDuaEnabled: boolean;
};

function slotsPerDay(enabled: Record<ReminderPrayer, boolean>, extra: ExtraDailyToggles): number {
  let count = 0;
  for (const prayer of CORE_PRAYERS) if (enabled[prayer]) count += 3; // at-time + 15min + missed
  if (enabled.sunrise) count += 1;
  if (enabled.tahajjud) count += 1;
  if (extra.dhuhrAsrDuaEnabled) count += 1;
  if (extra.fridayDuaEnabled) count += 1; // only actually fires 1 day in 7; counted every day as a safe upper bound
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
  extra: ExtraDailyToggles,
) {
  await cancelPrayerNotifications([
    'prayer-at-time',
    'prayer-15min',
    'prayer-missed',
    'sunrise',
    'tahajjud',
    'dhuhr-asr-dua',
    'friday-dua',
  ]);

  const perDay = slotsPerDay(enabled, extra);
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

    const stamp = dateStamp(date);

    for (const prayer of CORE_PRAYERS) {
      if (!enabled[prayer]) continue;
      const label = PRAYER_LABEL[prayer];
      const time = times[prayer];
      const fact = virtueForPrayer(prayer, date);

      await scheduleAt(
        time,
        APP_TITLE,
        body(`it's time to pray ${label}. ${fact.text} — ${fact.source}`),
        { kind: 'prayer-at-time', prayer },
        `prayer-at-time-${prayer}-${stamp}`,
      );

      await scheduleAt(
        new Date(time.getTime() - 15 * 60000),
        APP_TITLE,
        body(`${label} is in 15 minutes.`),
        { kind: 'prayer-15min', prayer },
        `prayer-15min-${prayer}-${stamp}`,
      );

      const windowEndKey = NEXT_WINDOW[prayer];
      const windowEnd = windowEndKey === 'fajr' ? nextFajr : times[windowEndKey];
      await scheduleAt(
        new Date(windowEnd.getTime() - 10 * 60000),
        APP_TITLE,
        body(`we saw you didn't pray ${label} — there's 10 minutes left, go pray.`),
        { kind: 'prayer-missed', prayer },
        `prayer-missed-${prayer}-${stamp}`,
      );
    }

    if (enabled.sunrise) {
      await scheduleAt(
        times.sunrise,
        APP_TITLE,
        body("it's Sunrise as well."),
        { kind: 'sunrise', prayer: 'sunrise' },
        `sunrise-${stamp}`,
      );
    }

    if (enabled.tahajjud) {
      const tahajjudTime = computeTahajjudTime(times.maghrib, nextFajr);
      await scheduleAt(
        tahajjudTime,
        APP_TITLE,
        body(
          'Tahajjud dua is like an arrow that does not miss its target — rise and make dua.',
        ),
        { kind: 'tahajjud', prayer: 'tahajjud' },
        `tahajjud-${stamp}`,
      );
    }

    if (extra.dhuhrAsrDuaEnabled) {
      const midpoint = new Date(times.dhuhr.getTime() + (times.asr.getTime() - times.dhuhr.getTime()) / 2);
      await scheduleAt(
        midpoint,
        APP_TITLE,
        body('the time between Dhuhr and Asr is blessed — make dua.'),
        { kind: 'dhuhr-asr-dua' },
        `dhuhr-asr-dua-${stamp}`,
      );
    }

    if (extra.fridayDuaEnabled && isFriday(date)) {
      await scheduleAt(
        new Date(times.maghrib.getTime() - 60 * 60000),
        APP_TITLE,
        body(
          'this is said to be one of the hours of acceptance on Friday — make dua.',
        ),
        { kind: 'friday-dua' },
        `friday-dua-${stamp}`,
      );
    }
  }
}

/** Cancels the still-pending "missed prayer" nudge for today — call when the user marks a prayer as prayed. */
export async function cancelMissedPrayerNotification(prayer: CorePrayer) {
  await cancelPrayerNotifications(['prayer-missed'], prayer);
}

export async function scheduleQuranReminder(hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    identifier: 'quran-reminder',
    content: {
      title: APP_TITLE,
      body: body("read some Qur'an today — each letter is 10 good deeds."),
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
  await Notifications.cancelScheduledNotificationAsync('quran-reminder');
}

const JUMUAH_MORNING_HOUR = 7;

export async function scheduleJumuahMorningReminder() {
  await Notifications.scheduleNotificationAsync({
    identifier: 'jumuah-morning',
    content: {
      title: APP_TITLE,
      body: body(
        "it's Jumu'ah — make ghusl, wear your best clothes, head early to the masjid, and read Surah Al-Kahf.",
      ),
      data: { type: 'jumuah-morning' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: IOS_FRIDAY_WEEKDAY,
      hour: JUMUAH_MORNING_HOUR,
      minute: 0,
      repeats: true,
    },
  });
}

export async function cancelJumuahMorningReminder() {
  await Notifications.cancelScheduledNotificationAsync('jumuah-morning');
}

/** Fixed daytime/evening hours rather than a literal "every 3 hours" (which would include the middle of the night). */
const FRIDAY_BLESSING_HOURS = [9, 12, 15, 18, 21];

export async function scheduleFridayBlessingsReminders() {
  await Promise.all(
    FRIDAY_BLESSING_HOURS.map((hour) =>
      Notifications.scheduleNotificationAsync({
        identifier: `friday-blessings-${hour}`,
        content: {
          title: APP_TITLE,
          body: body('send blessings upon the Prophet ﷺ.'),
          data: { type: 'friday-blessings', hour: String(hour) },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: IOS_FRIDAY_WEEKDAY,
          hour,
          minute: 0,
          repeats: true,
        },
      }),
    ),
  );
}

export async function cancelFridayBlessingsReminders() {
  await Promise.all(
    FRIDAY_BLESSING_HOURS.map((hour) =>
      Notifications.cancelScheduledNotificationAsync(`friday-blessings-${hour}`),
    ),
  );
}

/**
 * Schedules a re-engagement nudge for `daysAhead` from now, replacing any previous one. Call this
 * every time the app is opened — as long as the user keeps opening it, this keeps getting pushed
 * further out and never fires; if they stop, the last-scheduled one delivers on its own.
 */
export async function scheduleWeMissYouReminder(daysAhead: number) {
  await Notifications.scheduleNotificationAsync({
    identifier: 'we-miss-you',
    content: {
      title: APP_TITLE,
      body: body('we miss you — come back and track your prayers.'),
      data: { type: 'we-miss-you' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
    },
  });
}
