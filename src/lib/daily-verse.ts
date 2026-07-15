import AsyncStorage from '@react-native-async-storage/async-storage';

import { DAILY_VERSE_KEYS } from '@/constants/daily-verses';
import { dateKey } from '@/lib/prayer-tracker';

const CACHE_KEY = 'dailyVerseCache';
const TRANSLATION_RESOURCE_ID = 20; // Saheeh International

export type DailyVerse = {
  date: string;
  verseKey: string;
  arabic: string;
  translation: string;
};

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function verseKeyForToday(date: Date = new Date()) {
  return DAILY_VERSE_KEYS[dayOfYear(date) % DAILY_VERSE_KEYS.length];
}

function stripFootnotes(text: string) {
  return text.replace(/<sup[^>]*>.*?<\/sup>/g, '').trim();
}

export async function getDailyVerse(): Promise<DailyVerse> {
  const today = dateKey(new Date());
  const verseKey = verseKeyForToday();

  const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
  const cached: DailyVerse | null = cachedRaw ? JSON.parse(cachedRaw) : null;
  if (cached && cached.date === today && cached.verseKey === verseKey) {
    return cached;
  }

  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${verseKey}?fields=text_uthmani&translations=${TRANSLATION_RESOURCE_ID}`,
    );
    const data = await response.json();
    const verse: DailyVerse = {
      date: today,
      verseKey,
      arabic: data.verse.text_uthmani,
      translation: stripFootnotes(data.verse.translations[0].text),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(verse));
    return verse;
  } catch (fetchError) {
    if (cached) return cached;
    throw fetchError;
  }
}
