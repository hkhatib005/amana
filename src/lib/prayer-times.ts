import { Coordinates, PrayerTimes } from 'adhan';

import {
  DefaultPrayerMadhab,
  PrayerCalculationMethodKey,
  PrayerCalculationMethods,
  PrayerMadhabKey,
  PrayerMadhabs,
} from '@/constants/prayer-methods';

export type DailyPrayerTimes = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
};

export function computePrayerTimes(
  latitude: number,
  longitude: number,
  method: PrayerCalculationMethodKey,
  madhab: PrayerMadhabKey = DefaultPrayerMadhab,
  date: Date = new Date(),
): DailyPrayerTimes {
  const coordinates = new Coordinates(latitude, longitude);
  const params = PrayerCalculationMethods[method].factory();
  params.madhab = PrayerMadhabs[madhab].value;
  const times = new PrayerTimes(coordinates, date, params);

  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

/** Per the traditional window: after Fajr is morning adhkar time, after Asr is evening. */
export function isMorningAdhkarTime(fajr: Date, asr: Date, now: Date = new Date()): boolean {
  return now.getTime() >= fajr.getTime() && now.getTime() < asr.getTime();
}

/** Start of the last third of the night (Maghrib → next day's Fajr) — the recommended Tahajjud window. */
export function computeTahajjudTime(maghrib: Date, nextFajr: Date): Date {
  const nightMs = nextFajr.getTime() - maghrib.getTime();
  return new Date(maghrib.getTime() + (2 * nightMs) / 3);
}

const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export function currentAndNextPrayer(times: DailyPrayerTimes, now: Date = new Date()) {
  const upcomingIndex = PRAYER_ORDER.findIndex((key) => times[key].getTime() > now.getTime());

  if (upcomingIndex === -1) {
    return { current: 'isha' as const, next: null };
  }
  if (upcomingIndex === 0) {
    return { current: null, next: PRAYER_ORDER[0] };
  }
  return { current: PRAYER_ORDER[upcomingIndex - 1], next: PRAYER_ORDER[upcomingIndex] };
}
