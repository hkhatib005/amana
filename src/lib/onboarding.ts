import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hasCompletedOnboarding';

export async function getHasCompletedOnboarding(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw === 'true';
}

export async function setHasCompletedOnboarding(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, 'true');
}
