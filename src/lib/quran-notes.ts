import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'quranNotes';

export type QuranNote = {
  verseKey: string;
  chapterName: string;
  text: string;
  updatedAt: string;
};

export async function getNotes(): Promise<QuranNote[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getNoteForVerse(verseKey: string): Promise<string | null> {
  const notes = await getNotes();
  return notes.find((n) => n.verseKey === verseKey)?.text ?? null;
}

export async function setNote(verseKey: string, chapterName: string, text: string): Promise<void> {
  const notes = await getNotes();
  const withoutExisting = notes.filter((n) => n.verseKey !== verseKey);
  const updated = text.trim()
    ? [{ verseKey, chapterName, text: text.trim(), updatedAt: new Date().toISOString() }, ...withoutExisting]
    : withoutExisting;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
