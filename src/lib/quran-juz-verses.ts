import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'quranJuzVerses:v2:';
const TRANSLATION_RESOURCE_ID = 20; // Saheeh International

export type QuranVerse = {
  key: string;
  chapterId: number;
  verseNumber: number;
  pageNumber: number;
  arabic: string;
  translation: string;
};

function stripFootnotes(text: string) {
  return text.replace(/<sup[^>]*>.*?<\/sup>/g, '').trim();
}

export async function getJuzVerses(juzNumber: number): Promise<QuranVerse[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}${juzNumber}`;
  const cachedRaw = await AsyncStorage.getItem(cacheKey);
  if (cachedRaw) return JSON.parse(cachedRaw);

  const response = await fetch(
    `https://api.quran.com/api/v4/verses/by_juz/${juzNumber}?fields=text_uthmani&translations=${TRANSLATION_RESOURCE_ID}&per_page=600`,
  );
  const data = await response.json();
  const verses: QuranVerse[] = data.verses.map(
    (verse: {
      verse_key: string;
      verse_number: number;
      page_number: number;
      text_uthmani: string;
      translations: { text: string }[];
    }) => {
      const chapterId = Number(verse.verse_key.split(':')[0]);
      return {
        key: verse.verse_key,
        chapterId,
        verseNumber: verse.verse_number,
        pageNumber: verse.page_number,
        arabic: verse.text_uthmani,
        translation: stripFootnotes(verse.translations[0].text),
      };
    },
  );

  await AsyncStorage.setItem(cacheKey, JSON.stringify(verses));
  return verses;
}
