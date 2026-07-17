import { Linking, Platform } from 'react-native';

export type NearbyMasjid = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  address: string | null;
};

const SEARCH_RADIUS_METERS = 8000;
const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const EARTH_RADIUS_KM = 6371;

type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export async function getNearbyMasjids(latitude: number, longitude: number): Promise<NearbyMasjid[]> {
  const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});way["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude}););out center 30;`;

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch nearby mosques.');
  }

  const data: { elements: OverpassElement[] } = await response.json();

  return data.elements
    .map((element) => toNearbyMasjid(element, latitude, longitude))
    .filter((masjid): masjid is NearbyMasjid => masjid !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function toNearbyMasjid(element: OverpassElement, latitude: number, longitude: number): NearbyMasjid | null {
  const center = element.center ?? (element.lat != null && element.lon != null ? { lat: element.lat, lon: element.lon } : null);
  if (!center) return null;

  const tags = element.tags ?? {};
  return {
    id: `${element.type}/${element.id}`,
    name: tags.name ?? 'Mosque',
    latitude: center.lat,
    longitude: center.lon,
    distanceKm: haversineDistanceKm(latitude, longitude, center.lat, center.lon),
    address: formatAddress(tags),
  };
}

function formatAddress(tags: Record<string, string>): string | null {
  const street = tags['addr:housenumber'] ? `${tags['addr:housenumber']} ${tags['addr:street']}` : tags['addr:street'];
  const parts = [street, tags['addr:city']].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function openDirectionsToMasjid(masjid: NearbyMasjid): void {
  const label = encodeURIComponent(masjid.name);
  const url =
    Platform.select({
      ios: `maps://?daddr=${masjid.latitude},${masjid.longitude}&q=${label}`,
      android: `geo:${masjid.latitude},${masjid.longitude}?q=${masjid.latitude},${masjid.longitude}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${masjid.latitude},${masjid.longitude}`,
    }) ?? `https://www.google.com/maps/dir/?api=1&destination=${masjid.latitude},${masjid.longitude}`;

  Linking.openURL(url).catch(() => {});
}
