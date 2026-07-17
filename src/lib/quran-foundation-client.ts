import { createServerClient } from '@quranjs/api/server';
import type { VerseKey } from '@quranjs/api';

export const quranClient = createServerClient({
  clientId: process.env.EXPO_PUBLIC_QURAN_CLIENT_ID!,
  clientSecret: process.env.EXPO_PUBLIC_QURAN_CLIENT_SECRET!,
  services: {
    oauth2BaseUrl: process.env.EXPO_PUBLIC_QURAN_OAUTH_ENDPOINT,
    gatewayUrl: process.env.EXPO_PUBLIC_QURAN_GATEWAY,
  },
});

export const DEFAULT_RECITER_ID = 7; // Mishari Rashid al-`Afasy

export type Reciter = { id: number; name: string };

let recitersCache: Reciter[] | null = null;

export async function getReciters(): Promise<Reciter[]> {
  if (recitersCache) return recitersCache;
  const reciters = await quranClient.resources.findAllRecitations();
  recitersCache = reciters
    .filter((r) => r.id != null && r.reciterName)
    .map((r) => ({ id: r.id!, name: r.reciterName! }));
  return recitersCache;
}

const audioUrlCache = new Map<string, string | null>();

export async function getVerseAudioUrl(
  verseKey: string,
  reciterId: number = DEFAULT_RECITER_ID,
): Promise<string | null> {
  const cacheKey = `${reciterId}:${verseKey}`;
  if (audioUrlCache.has(cacheKey)) return audioUrlCache.get(cacheKey)!;
  try {
    // VerseKey is a per-chapter literal union derived from compile-time data; ours come from
    // our own fetched page data at runtime, so they're valid but not literal-checkable here.
    const { audioFiles } = await quranClient.audio.findVerseRecitationsByKey(
      verseKey as VerseKey,
      String(reciterId),
    );
    const url = audioFiles[0]?.audioUrl ?? null;
    audioUrlCache.set(cacheKey, url);
    return url;
  } catch {
    // A single verse missing a recitation shouldn't sink a whole page/queue fetch.
    audioUrlCache.set(cacheKey, null);
    return null;
  }
}

export async function getVerseAudioUrls(
  verseKeys: string[],
  reciterId: number = DEFAULT_RECITER_ID,
): Promise<(string | null)[]> {
  return Promise.all(verseKeys.map((key) => getVerseAudioUrl(key, reciterId)));
}
