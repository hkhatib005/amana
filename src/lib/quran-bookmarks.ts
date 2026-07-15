import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'quranBookmarks';

export type QuranBookmark = {
  verseKey: string;
  chapterName: string;
  arabic: string;
  translation: string;
  savedAt: string;
};

export async function getBookmarks(): Promise<QuranBookmark[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function isBookmarked(verseKey: string): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return bookmarks.some((b) => b.verseKey === verseKey);
}

export async function toggleBookmark(
  entry: Omit<QuranBookmark, 'savedAt'>,
): Promise<QuranBookmark[]> {
  const bookmarks = await getBookmarks();
  const exists = bookmarks.some((b) => b.verseKey === entry.verseKey);
  const updated = exists
    ? bookmarks.filter((b) => b.verseKey !== entry.verseKey)
    : [{ ...entry, savedAt: new Date().toISOString() }, ...bookmarks];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
