import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import {
  DefaultPrayerCalculationMethod,
  DefaultPrayerMadhab,
  NorthAmericaCalculationMethod,
  PrayerCalculationMethodKey,
  PrayerMadhabKey,
} from '@/constants/prayer-methods';
import { computePrayerTimes, DailyPrayerTimes } from '@/lib/prayer-times';

const METHOD_STORAGE_KEY = 'prayerCalculationMethod';
const MADHAB_STORAGE_KEY = 'prayerMadhab';

/** Countries where ISNA, not the global Muslim World League convention, is the local standard. */
const NORTH_AMERICA_COUNTRIES = new Set(['United States', 'Canada']);

/** Only called once, on a fresh install with no saved method — every later launch just reads storage. */
async function pickSensibleDefaultMethod(
  latitude: number,
  longitude: number,
): Promise<PrayerCalculationMethodKey> {
  try {
    const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (result?.country && NORTH_AMERICA_COUNTRIES.has(result.country)) {
      return NorthAmericaCalculationMethod;
    }
  } catch {
    // Reverse geocoding is best-effort for picking a sensible default; fall through if it fails.
  }
  return DefaultPrayerCalculationMethod;
}

type State = {
  loading: boolean;
  permissionDenied: boolean;
  error: string | null;
  times: DailyPrayerTimes | null;
  method: PrayerCalculationMethodKey;
  madhab: PrayerMadhabKey;
  coords: { latitude: number; longitude: number; altitude: number | null } | null;
};

type PrayerTimesContextValue = State & {
  setMethod: (method: PrayerCalculationMethodKey) => void;
  setMadhab: (madhab: PrayerMadhabKey) => void;
  retry: () => void;
};

const PrayerTimesContext = createContext<PrayerTimesContextValue | null>(null);

export function PrayerTimesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    loading: true,
    permissionDenied: false,
    error: null,
    times: null,
    method: DefaultPrayerCalculationMethod,
    madhab: DefaultPrayerMadhab,
    coords: null,
  });

  /** Tracks whether a calculation method has ever been resolved and saved for this install —
   * starts `true` only when storage had nothing on mount, and flips to `false` the moment a
   * method is successfully picked (smart-default or explicit) or saved. `retry()` reads this
   * instead of hardcoding `false`, so a first-launch user who denies location and later grants
   * it still gets the region-aware smart default on their retry, not silently the global one. */
  const needsSmartDefaultRef = useRef(false);

  /** `pickMethod` runs once on first-ever launch (no saved preference) to choose a sensible
   * region-aware default; every subsequent call already has a concrete method and skips it. */
  const load = useCallback(
    async (method: PrayerCalculationMethodKey, madhab: PrayerMadhabKey, pickMethod: boolean) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((prev) => ({ ...prev, loading: false, permissionDenied: true }));
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
        };

        const resolvedMethod = pickMethod
          ? await pickSensibleDefaultMethod(coords.latitude, coords.longitude)
          : method;
        if (pickMethod) {
          await AsyncStorage.setItem(METHOD_STORAGE_KEY, resolvedMethod);
          needsSmartDefaultRef.current = false;
        }

        const times = computePrayerTimes(coords.latitude, coords.longitude, resolvedMethod, madhab);
        setState({
          loading: false,
          permissionDenied: false,
          error: null,
          times,
          method: resolvedMethod,
          madhab,
          coords,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Couldn't determine your location. Check Location Services and try again.",
        }));
      }
    },
    [],
  );

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(METHOD_STORAGE_KEY), AsyncStorage.getItem(MADHAB_STORAGE_KEY)]).then(
      ([savedMethod, savedMadhab]) => {
        const method = (savedMethod as PrayerCalculationMethodKey | null) ?? DefaultPrayerCalculationMethod;
        const madhab = (savedMadhab as PrayerMadhabKey | null) ?? DefaultPrayerMadhab;
        needsSmartDefaultRef.current = savedMethod === null;
        load(method, madhab, savedMethod === null);
      },
    );
  }, [load]);

  const setMethod = useCallback(
    (method: PrayerCalculationMethodKey) => {
      AsyncStorage.setItem(METHOD_STORAGE_KEY, method);
      needsSmartDefaultRef.current = false;
      load(method, state.madhab, false);
    },
    [load, state.madhab],
  );

  const setMadhab = useCallback(
    (madhab: PrayerMadhabKey) => {
      AsyncStorage.setItem(MADHAB_STORAGE_KEY, madhab);
      load(state.method, madhab, false);
    },
    [load, state.method],
  );

  const retry = useCallback(
    () => load(state.method, state.madhab, needsSmartDefaultRef.current),
    [load, state.method, state.madhab],
  );

  return (
    <PrayerTimesContext.Provider value={{ ...state, setMethod, setMadhab, retry }}>
      {children}
    </PrayerTimesContext.Provider>
  );
}

export function usePrayerTimes() {
  const context = useContext(PrayerTimesContext);
  if (!context) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
}
