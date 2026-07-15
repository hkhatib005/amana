import { ISLAMIC_DAY_EVENTS } from '@/constants/islamic-days';
import { gregorianToHijri, hijriToGregorian } from '@/lib/hijri-date';

export type UpcomingIslamicDay = {
  name: string;
  date: Date;
  daysAway: number;
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getUpcomingIslamicDays(today: Date = new Date()): UpcomingIslamicDay[] {
  const todayStart = startOfDay(today);
  const currentHijriYear = gregorianToHijri(todayStart).year;

  return ISLAMIC_DAY_EVENTS.map((event) => {
    let date = startOfDay(hijriToGregorian(currentHijriYear, event.hijriMonth, event.hijriDay));
    if (date.getTime() < todayStart.getTime()) {
      date = startOfDay(hijriToGregorian(currentHijriYear + 1, event.hijriMonth, event.hijriDay));
    }
    const daysAway = Math.round((date.getTime() - todayStart.getTime()) / 86400000);
    return { name: event.name, date, daysAway };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
}
