import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import {
  cancelQuranReminder,
  requestNotificationPermissionAsync,
  REMINDER_PRAYERS,
  ReminderPrayer,
  scheduleQuranReminder,
  scheduleUpcomingPrayerNotifications,
  scheduleWeMissYouReminder,
} from '@/lib/notifications';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const STORAGE_KEY = 'notificationPreferences';
const DEFAULT_QURAN_REMINDER_TIME = { hour: 20, minute: 0 };
const WE_MISS_YOU_DAYS_AHEAD = 3;

type PrayerNotificationMap = Record<ReminderPrayer, boolean>;

const DEFAULT_PRAYER_NOTIFICATIONS: PrayerNotificationMap = Object.fromEntries(
  REMINDER_PRAYERS.map((prayer) => [prayer, false]),
) as PrayerNotificationMap;

type Preferences = {
  prayerNotifications: PrayerNotificationMap;
  quranReminderEnabled: boolean;
  quranReminderTime: { hour: number; minute: number };
};

const DEFAULT_PREFERENCES: Preferences = {
  prayerNotifications: DEFAULT_PRAYER_NOTIFICATIONS,
  quranReminderEnabled: false,
  quranReminderTime: DEFAULT_QURAN_REMINDER_TIME,
};

type NotificationsContextValue = Preferences & {
  setPrayerNotificationEnabled: (prayer: ReminderPrayer, enabled: boolean) => void;
  setQuranReminderEnabled: (enabled: boolean) => void;
  setQuranReminderTime: (time: { hour: number; minute: number }) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { coords, method } = usePrayerTimes();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const preferencesRef = useRef(preferences);
  preferencesRef.current = preferences;
  const coordsRef = useRef(coords);
  coordsRef.current = coords;
  const methodRef = useRef(method);
  methodRef.current = method;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const saved = JSON.parse(raw);
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...saved,
          prayerNotifications: { ...DEFAULT_PRAYER_NOTIFICATIONS, ...saved.prayerNotifications },
        });
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: Preferences) => {
    setPreferences(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  // Pre-schedules several days of prayer notifications whenever location/method/the enabled map
  // change, and again every time the app is brought to the foreground — so the rolling window
  // stays fresh even after the app hasn't been opened for a day or more.
  useEffect(() => {
    if (!loaded || !coords || !method) return;
    scheduleUpcomingPrayerNotifications(coords, method, preferences.prayerNotifications);
    scheduleWeMissYouReminder(WE_MISS_YOU_DAYS_AHEAD);
  }, [loaded, coords, method, preferences.prayerNotifications]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const { current: currentCoords } = coordsRef;
      const { current: currentMethod } = methodRef;
      if (!currentCoords || !currentMethod) return;
      scheduleUpcomingPrayerNotifications(
        currentCoords,
        currentMethod,
        preferencesRef.current.prayerNotifications,
      );
      scheduleWeMissYouReminder(WE_MISS_YOU_DAYS_AHEAD);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (preferences.quranReminderEnabled) {
      scheduleQuranReminder(preferences.quranReminderTime.hour, preferences.quranReminderTime.minute);
    } else {
      cancelQuranReminder();
    }
  }, [loaded, preferences.quranReminderEnabled, preferences.quranReminderTime]);

  const setPrayerNotificationEnabled = useCallback(
    async (prayer: ReminderPrayer, enabled: boolean) => {
      if (enabled && !(await requestNotificationPermissionAsync())) return;
      persist({
        ...preferences,
        prayerNotifications: { ...preferences.prayerNotifications, [prayer]: enabled },
      });
    },
    [persist, preferences],
  );

  const setQuranReminderEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !(await requestNotificationPermissionAsync())) return;
      persist({ ...preferences, quranReminderEnabled: enabled });
    },
    [persist, preferences],
  );

  const setQuranReminderTime = useCallback(
    (time: { hour: number; minute: number }) => {
      persist({ ...preferences, quranReminderTime: time });
    },
    [persist, preferences],
  );

  return (
    <NotificationsContext.Provider
      value={{
        ...preferences,
        setPrayerNotificationEnabled,
        setQuranReminderEnabled,
        setQuranReminderTime,
      }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationPreferences() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationPreferences must be used within a NotificationsProvider');
  }
  return context;
}
