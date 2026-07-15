import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { cancelMissedPrayerNotification } from '@/lib/notifications';
import { computeStreak, dateKey, TrackedPrayer } from '@/lib/prayer-tracker';

const STORAGE_KEY = 'prayerCompletionByDate';

type PrayerTrackerContextValue = {
  loading: boolean;
  record: Record<string, TrackedPrayer[]>;
  todayCompleted: TrackedPrayer[];
  streak: number;
  togglePrayer: (prayer: TrackedPrayer) => void;
};

const PrayerTrackerContext = createContext<PrayerTrackerContextValue | null>(null);

export function PrayerTrackerProvider({ children }: { children: ReactNode }) {
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
        const wasCompleted = current.includes(prayer);
        const next = wasCompleted ? current.filter((p) => p !== prayer) : [...current, prayer];
        const updated = { ...prev, [todayKey]: next };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (!wasCompleted) cancelMissedPrayerNotification(prayer);
        return updated;
      });
    },
    [todayKey],
  );

  return (
    <PrayerTrackerContext.Provider
      value={{ loading, record, todayCompleted, streak: computeStreak(record), togglePrayer }}>
      {children}
    </PrayerTrackerContext.Provider>
  );
}

export function usePrayerTracker() {
  const context = useContext(PrayerTrackerContext);
  if (!context) {
    throw new Error('usePrayerTracker must be used within a PrayerTrackerProvider');
  }
  return context;
}
