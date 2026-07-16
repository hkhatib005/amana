import { createServerClient } from '@quranjs/api/server';

/**
 * Pre-Production credentials for now (see .env.local). Swap to the Production
 * client ID/secret/oauth endpoint/gateway before a release build.
 */
export const quranClient = createServerClient({
  clientId: process.env.EXPO_PUBLIC_QURAN_CLIENT_ID!,
  clientSecret: process.env.EXPO_PUBLIC_QURAN_CLIENT_SECRET!,
  services: {
    oauth2BaseUrl: process.env.EXPO_PUBLIC_QURAN_OAUTH_ENDPOINT,
    gatewayUrl: process.env.EXPO_PUBLIC_QURAN_GATEWAY,
  },
});

export const DEFAULT_RECITER_ID = 7; // Mishari Rashid al-`Afasy

const audioUrlCache = new Map<string, string | null>();

export async function getVerseAudioUrl(
  verseKey: string,
  reciterId: number = DEFAULT_RECITER_ID,
): Promise<string | null> {
  const cacheKey = `${reciterId}:${verseKey}`;
  if (audioUrlCache.has(cacheKey)) return audioUrlCache.get(cacheKey)!;
  try {
    const { audioFiles } = await quranClient.audio.findVerseRecitationsByKey(verseKey, reciterId);
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
