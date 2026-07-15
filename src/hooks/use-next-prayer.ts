import { useEffect, useMemo, useState } from 'react';

import { computePrayerTimes, currentAndNextPrayer, DailyPrayerTimes } from '@/lib/prayer-times';

const PRAYER_NAME: Record<keyof DailyPrayerTimes, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export function useNextPrayer(
  times: DailyPrayerTimes | null,
  coords: { latitude: number; longitude: number } | null,
  method: Parameters<typeof computePrayerTimes>[2] | undefined,
  intervalMs = 60000,
) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return useMemo(() => {
    if (!times) return null;
    const { next } = currentAndNextPrayer(times, now);
    if (next) {
      return { name: PRAYER_NAME[next], time: times[next] };
    }
    if (!coords || !method) return null;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = computePrayerTimes(coords.latitude, coords.longitude, method, tomorrow);
    return { name: 'Fajr', time: tomorrowTimes.fajr };
  }, [times, coords, method, now]);
}
