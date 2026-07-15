import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { computeStreak, dateKey, TrackedPrayer } from '@/lib/prayer-tracker';

const STORAGE_KEY = 'prayerCompletionByDate';

export function usePrayerTracker() {
  const [record, setRecord] = useState<Record<string, TrackedPrayer[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      setRecord(raw ? (JSON.parse(raw) as Record<string, TrackedPrayer[]>) : {});
      setLoading(false);
    });
  }, []);

  const todayKey = dateKey(new Date());
  const todayCompleted = record[todayKey] ?? [];

  const togglePrayer = useCallback(
    (prayer: TrackedPrayer) => {
      setRecord((prev) => {
        const current = prev[todayKey] ?? [];
        const next = current.includes(prayer)
          ? current.filter((p) => p !== prayer)
          : [...current, prayer];
        const updated = { ...prev, [todayKey]: next };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [todayKey],
  );

  return {
    loading,
    todayCompleted,
    togglePrayer,
    streak: computeStreak(record),
    record,
  };
}
