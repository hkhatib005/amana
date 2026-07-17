import { useMemo } from 'react';

import { PrayerCalculationMethodKey, PrayerMadhabKey } from '@/constants/prayer-methods';
import { computePrayerTimes } from '@/lib/prayer-times';

export function useTomorrowFajr(
  coords: { latitude: number; longitude: number } | null,
  method: PrayerCalculationMethodKey | undefined,
  madhab: PrayerMadhabKey | undefined,
) {
  return useMemo(() => {
    if (!coords || !method) return null;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return computePrayerTimes(coords.latitude, coords.longitude, method, madhab, tomorrow).fajr;
  }, [coords, method, madhab]);
}
