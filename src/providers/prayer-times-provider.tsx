import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { DefaultPrayerCalculationMethod, PrayerCalculationMethodKey } from '@/constants/prayer-methods';
import { computePrayerTimes, DailyPrayerTimes } from '@/lib/prayer-times';

const METHOD_STORAGE_KEY = 'prayerCalculationMethod';

type State = {
  loading: boolean;
  permissionDenied: boolean;
  error: string | null;
  times: DailyPrayerTimes | null;
  method: PrayerCalculationMethodKey;
  coords: { latitude: number; longitude: number; altitude: number | null } | null;
};

type PrayerTimesContextValue = State & {
  setMethod: (method: PrayerCalculationMethodKey) => void;
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
    coords: null,
  });

  const load = useCallback(async (method: PrayerCalculationMethodKey) => {
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
      const times = computePrayerTimes(coords.latitude, coords.longitude, method);
      setState({ loading: false, permissionDenied: false, error: null, times, method, coords });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Couldn't determine your location. Check Location Services and try again.",
      }));
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(METHOD_STORAGE_KEY).then((saved) => {
      const method = (saved as PrayerCalculationMethodKey | null) ?? DefaultPrayerCalculationMethod;
      load(method);
    });
  }, [load]);

  const setMethod = useCallback(
    (method: PrayerCalculationMethodKey) => {
      AsyncStorage.setItem(METHOD_STORAGE_KEY, method);
      load(method);
    },
    [load],
  );

  const retry = useCallback(() => load(state.method), [load, state.method]);

  return (
    <PrayerTimesContext.Provider value={{ ...state, setMethod, retry }}>
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
