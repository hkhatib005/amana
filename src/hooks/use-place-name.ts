import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

type PlaceName = { city: string | null; country: string | null };

export function usePlaceName(coords: { latitude: number; longitude: number } | null): PlaceName {
  const [place, setPlace] = useState<PlaceName>({ city: null, country: null });

  useEffect(() => {
    if (!coords) return;
    Location.reverseGeocodeAsync(coords)
      .then(([result]) =>
        setPlace({ city: result?.city ?? result?.subregion ?? null, country: result?.country ?? null }),
      )
      .catch(() => {});
  }, [coords]);

  return place;
}

export function useCityName(coords: { latitude: number; longitude: number } | null) {
  return usePlaceName(coords).city;
}
