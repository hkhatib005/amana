import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'quranTextSizeScale';

export const DEFAULT_TEXT_SIZE_SCALE = 1;

export const TEXT_SIZE_OPTIONS = [
  { label: 'Small', scale: 0.85 },
  { label: 'Medium', scale: 1 },
  { label: 'Large', scale: 1.15 },
  { label: 'X-Large', scale: 1.35 },
] as const;

export async function getTextSizeScale(): Promise<number> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? Number(raw) : DEFAULT_TEXT_SIZE_SCALE;
}

export async function setTextSizeScale(scale: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, String(scale));
}
