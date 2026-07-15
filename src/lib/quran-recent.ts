import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'quranRecentReads';
const MAX_RECENT = 3;

export type RecentRead = {
  chapterId: number;
  chapterName: string;
  chapterNameArabic: string;
  pageNumber: number;
  viewedAt: string;
};

export async function getRecentReads(): Promise<RecentRead[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function recordRecentRead(entry: Omit<RecentRead, 'viewedAt'>): Promise<void> {
  const existing = await getRecentReads();
  const withoutDuplicate = existing.filter((r) => r.chapterId !== entry.chapterId);
  const updated = [{ ...entry, viewedAt: new Date().toISOString() }, ...withoutDuplicate].slice(
    0,
    MAX_RECENT,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
