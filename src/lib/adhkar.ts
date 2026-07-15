import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'adhkarVersesCache';
const TRANSLATION_RESOURCE_ID = 20; // Saheeh International

export type AdhkarVerse = {
  key: string;
  arabic: string;
  translation: string;
};

function stripFootnotes(text: string) {
  return text.replace(/<sup[^>]*>.*?<\/sup>/g, '').trim();
}

async function fetchVerse(key: string): Promise<AdhkarVerse> {
  const response = await fetch(
    `https://api.quran.com/api/v4/verses/by_key/${key}?fields=text_uthmani&translations=${TRANSLATION_RESOURCE_ID}`,
  );
  const data = await response.json();
  return {
    key: data.verse.verse_key,
    arabic: data.verse.text_uthmani,
    translation: stripFootnotes(data.verse.translations[0].text),
  };
}

async function fetchChapter(chapterId: number): Promise<AdhkarVerse[]> {
  const response = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?fields=text_uthmani&translations=${TRANSLATION_RESOURCE_ID}`,
  );
  const data = await response.json();
  return data.verses.map((verse: { verse_key: string; text_uthmani: string; translations: { text: string }[] }) => ({
    key: verse.verse_key,
    arabic: verse.text_uthmani,
    translation: stripFootnotes(verse.translations[0].text),
  }));
}

/**
 * Ayat al-Kursi and the three Quls (Al-Ikhlas, Al-Falaq, An-Nas) — the
 * verifiable Qur'anic core shared by both morning and evening adhkar.
 */
export async function getAdhkarVerses(): Promise<AdhkarVerse[]> {
  const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
  if (cachedRaw) return JSON.parse(cachedRaw);

  const [ayatAlKursi, ikhlas, falaq, nas] = await Promise.all([
    fetchVerse('2:255'),
    fetchChapter(112),
    fetchChapter(113),
    fetchChapter(114),
  ]);
  const verses = [ayatAlKursi, ...ikhlas, ...falaq, ...nas];
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(verses));
  return verses;
}
