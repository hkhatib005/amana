import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'quranReaderColorScheme';

export type ReaderColorScheme = 'system' | 'light' | 'dark';

export const DEFAULT_READER_COLOR_SCHEME: ReaderColorScheme = 'light';

export const READER_COLOR_SCHEME_OPTIONS: { label: string; value: ReaderColorScheme }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export async function getReaderColorScheme(): Promise<ReaderColorScheme> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : DEFAULT_READER_COLOR_SCHEME;
}

export async function setReaderColorScheme(scheme: ReaderColorScheme): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, scheme);
}
