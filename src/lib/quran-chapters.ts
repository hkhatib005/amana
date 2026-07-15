import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'quranChaptersCache';

export type QuranChapter = {
  id: number;
  nameSimple: string;
  nameArabic: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: string;
  startPage: number;
};

export async function getQuranChapters(): Promise<QuranChapter[]> {
  const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
  if (cachedRaw) return JSON.parse(cachedRaw);

  const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
  const data = await response.json();
  const chapters: QuranChapter[] = data.chapters.map(
    (chapter: {
      id: number;
      name_simple: string;
      name_arabic: string;
      translated_name: { name: string };
      verses_count: number;
      revelation_place: string;
      pages: [number, number];
    }) => ({
      id: chapter.id,
      nameSimple: chapter.name_simple,
      nameArabic: chapter.name_arabic,
      translatedName: chapter.translated_name.name,
      versesCount: chapter.verses_count,
      revelationPlace: chapter.revelation_place,
      startPage: chapter.pages[0],
    }),
  );

  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(chapters));
  return chapters;
}
