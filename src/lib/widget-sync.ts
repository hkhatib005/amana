import { EVENING_OPENER, MORNING_OPENER } from '@/constants/adhkar-openers';
import { DailyPrayerTimes } from '@/lib/prayer-times';
import type { AdhkarWidgetProps } from '@/widgets/AdhkarWidget';
import type { NextPrayerWidgetProps } from '@/widgets/NextPrayerWidget';
import type { PrayerTimesWidgetPrayer, PrayerTimesWidgetProps } from '@/widgets/PrayerTimesWidget';

const PRAYER_LABELS: Record<keyof DailyPrayerTimes, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const PRAYER_ORDER: (keyof DailyPrayerTimes)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const TRACKED_PRAYER_KEYS: (keyof DailyPrayerTimes)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function buildNextPrayerTimeline(
  times: DailyPrayerTimes,
  followingFajr: Date,
): { date: Date; props: NextPrayerWidgetProps }[] {
  const toEntry = (date: Date, nextKey: keyof DailyPrayerTimes | null) => {
    const nextTime = nextKey ? times[nextKey] : followingFajr;
    const nextLabel = nextKey ? PRAYER_LABELS[nextKey] : 'Fajr';
    return { date, props: { prayerName: nextLabel, timeLabel: formatTime(nextTime), timestamp: nextTime.getTime() } };
  };

  return [
    toEntry(startOfDay(times.fajr), 'fajr'),
    ...PRAYER_ORDER.map((key, index) => toEntry(times[key], PRAYER_ORDER[index + 1] ?? null)),
  ];
}

export function buildPrayerTimesTimeline(times: DailyPrayerTimes): { date: Date; props: PrayerTimesWidgetProps }[] {
  const buildProps = (currentKey: keyof DailyPrayerTimes | null): PrayerTimesWidgetProps => ({
    prayers: TRACKED_PRAYER_KEYS.map(
      (key): PrayerTimesWidgetPrayer => ({
        key,
        label: PRAYER_LABELS[key],
        timeLabel: formatTime(times[key]),
        isCurrent: key === currentKey,
      }),
    ),
  });

  return [
    { date: startOfDay(times.fajr), props: buildProps(null) },
    ...PRAYER_ORDER.map((key) => ({
      date: times[key],
      props: buildProps(TRACKED_PRAYER_KEYS.includes(key) ? key : null),
    })),
  ];
}

export function buildAdhkarTimeline(
  days: { fajr: Date; asr: Date }[],
): { date: Date; props: AdhkarWidgetProps }[] {
  return days.flatMap(({ fajr, asr }) => [
    { date: fajr, props: { isMorning: true, arabic: MORNING_OPENER.arabic, translation: MORNING_OPENER.translation } },
    { date: asr, props: { isMorning: false, arabic: EVENING_OPENER.arabic, translation: EVENING_OPENER.translation } },
  ]);
}

const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function compassDirectionFromBearing(bearingDegrees: number): string {
  return COMPASS_DIRECTIONS[Math.round(bearingDegrees / 45) % 8];
}
