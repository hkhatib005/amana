import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import {
  cancelFridayBlessingsReminders,
  cancelJumuahMorningReminder,
  cancelQuranReminder,
  CORE_PRAYERS,
  requestNotificationPermissionAsync,
  REMINDER_PRAYERS,
  ReminderPrayer,
  scheduleFridayBlessingsReminders,
  scheduleJumuahMorningReminder,
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
  dhuhrAsrDuaEnabled: boolean;
  jumuahMorningEnabled: boolean;
  fridayBlessingsEnabled: boolean;
  fridayDuaEnabled: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  prayerNotifications: DEFAULT_PRAYER_NOTIFICATIONS,
  quranReminderEnabled: false,
  quranReminderTime: DEFAULT_QURAN_REMINDER_TIME,
  dhuhrAsrDuaEnabled: false,
  jumuahMorningEnabled: false,
  fridayBlessingsEnabled: false,
  fridayDuaEnabled: false,
};

export type OnboardingSelections = {
  /** Bundles all 5 core prayers (fajr/dhuhr/asr/maghrib/isha). */
  prayerReminders: boolean;
  tahajjud: boolean;
  quranReminder: boolean;
  dhuhrAsrDua: boolean;
  /** Bundles Jumu'ah morning + send-blessings + hour-of-acceptance dua. */
  fridayReminders: boolean;
};

type NotificationsContextValue = Preferences & {
  setPrayerNotificationEnabled: (prayer: ReminderPrayer, enabled: boolean) => void;
  setQuranReminderEnabled: (enabled: boolean) => void;
  setQuranReminderTime: (time: { hour: number; minute: number }) => void;
  setDhuhrAsrDuaEnabled: (enabled: boolean) => void;
  setJumuahMorningEnabled: (enabled: boolean) => void;
  setFridayBlessingsEnabled: (enabled: boolean) => void;
  setFridayDuaEnabled: (enabled: boolean) => void;
  /** Applies a first-run onboarding selection as a single persisted update. Returns whether
   * notification permission was actually granted (false if the user picked anything but the OS
   * denied permission — everything is silently kept off in that case). */
  completeOnboarding: (selections: OnboardingSelections) => Promise<boolean>;
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
    scheduleUpcomingPrayerNotifications(coords, method, preferences.prayerNotifications, {
      dhuhrAsrDuaEnabled: preferences.dhuhrAsrDuaEnabled,
      fridayDuaEnabled: preferences.fridayDuaEnabled,
    });
    scheduleWeMissYouReminder(WE_MISS_YOU_DAYS_AHEAD);
  }, [
    loaded,
    coords,
    method,
    preferences.prayerNotifications,
    preferences.dhuhrAsrDuaEnabled,
    preferences.fridayDuaEnabled,
  ]);

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
        {
          dhuhrAsrDuaEnabled: preferencesRef.current.dhuhrAsrDuaEnabled,
          fridayDuaEnabled: preferencesRef.current.fridayDuaEnabled,
        },
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

  useEffect(() => {
    if (!loaded) return;
    if (preferences.jumuahMorningEnabled) {
      scheduleJumuahMorningReminder();
    } else {
      cancelJumuahMorningReminder();
    }
  }, [loaded, preferences.jumuahMorningEnabled]);

  useEffect(() => {
    if (!loaded) return;
    if (preferences.fridayBlessingsEnabled) {
      scheduleFridayBlessingsReminders();
    } else {
      cancelFridayBlessingsReminders();
    }
  }, [loaded, preferences.fridayBlessingsEnabled]);

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

  const setDhuhrAsrDuaEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !(await requestNotificationPermissionAsync())) return;
      persist({ ...preferences, dhuhrAsrDuaEnabled: enabled });
    },
    [persist, preferences],
  );

  const setJumuahMorningEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !(await requestNotificationPermissionAsync())) return;
      persist({ ...preferences, jumuahMorningEnabled: enabled });
    },
    [persist, preferences],
  );

  const setFridayBlessingsEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !(await requestNotificationPermissionAsync())) return;
      persist({ ...preferences, fridayBlessingsEnabled: enabled });
    },
    [persist, preferences],
  );

  const setFridayDuaEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !(await requestNotificationPermissionAsync())) return;
      persist({ ...preferences, fridayDuaEnabled: enabled });
    },
    [persist, preferences],
  );

  const completeOnboarding = useCallback(
    async (selections: OnboardingSelections) => {
      const anySelected =
        selections.prayerReminders ||
        selections.tahajjud ||
        selections.quranReminder ||
        selections.dhuhrAsrDua ||
        selections.fridayReminders;
      const granted = anySelected ? await requestNotificationPermissionAsync() : true;
      const effective = granted
        ? selections
        : {
            prayerReminders: false,
            tahajjud: false,
            quranReminder: false,
            dhuhrAsrDua: false,
            fridayReminders: false,
          };

      persist({
        ...preferences,
        prayerNotifications: {
          ...preferences.prayerNotifications,
          ...Object.fromEntries(CORE_PRAYERS.map((prayer) => [prayer, effective.prayerReminders])),
          tahajjud: effective.tahajjud,
        },
        quranReminderEnabled: effective.quranReminder,
        dhuhrAsrDuaEnabled: effective.dhuhrAsrDua,
        jumuahMorningEnabled: effective.fridayReminders,
        fridayBlessingsEnabled: effective.fridayReminders,
        fridayDuaEnabled: effective.fridayReminders,
      });

      return granted;
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
        setDhuhrAsrDuaEnabled,
        setJumuahMorningEnabled,
        setFridayBlessingsEnabled,
        setFridayDuaEnabled,
        completeOnboarding,
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
