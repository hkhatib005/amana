import { useEffect, useState } from 'react';

import { CurrentWeather, getCurrentWeather } from '@/lib/weather';

export function useWeather(coords: { latitude: number; longitude: number } | null) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    getCurrentWeather(coords.latitude, coords.longitude)
      .then((result) => {
        if (!cancelled) setWeather(result);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [coords]);

  return weather;
}
