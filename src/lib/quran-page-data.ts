import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'quranPageVerses:v1:';
const TRANSLATION_RESOURCE_ID = 20; // Saheeh International
export const TOTAL_MUSHAF_PAGES = 604;

export type QuranPageVerse = {
  key: string;
  chapterId: number;
  verseNumber: number;
  pageNumber: number;
  juzNumber: number;
  arabic: string;
  translation: string;
};

function stripFootnotes(text: string) {
  return text.replace(/<sup[^>]*>.*?<\/sup>/g, '').trim();
}

/**
 * Fetches all verses on a single mushaf page. Isolated behind this one function so the
 * community quran.com API used here can later be swapped for the official Quran Foundation
 * SDK (@quranjs/api) without touching any of the reader UI.
 */
export async function getPageVerses(pageNumber: number): Promise<QuranPageVerse[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}${pageNumber}`;
  const cachedRaw = await AsyncStorage.getItem(cacheKey);
  if (cachedRaw) return JSON.parse(cachedRaw);

  const response = await fetch(
    `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?fields=text_uthmani&translations=${TRANSLATION_RESOURCE_ID}&per_page=50`,
  );
  const data = await response.json();
  const verses: QuranPageVerse[] = data.verses.map(
    (verse: {
      verse_key: string;
      verse_number: number;
      page_number: number;
      juz_number: number;
      text_uthmani: string;
      translations: { text: string }[];
    }) => {
      const chapterId = Number(verse.verse_key.split(':')[0]);
      return {
        key: verse.verse_key,
        chapterId,
        verseNumber: verse.verse_number,
        pageNumber: verse.page_number,
        juzNumber: verse.juz_number,
        arabic: verse.text_uthmani,
        translation: stripFootnotes(verse.translations[0].text),
      };
    },
  );

  await AsyncStorage.setItem(cacheKey, JSON.stringify(verses));
  return verses;
}
