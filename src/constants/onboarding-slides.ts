import type { SFSymbol } from 'sf-symbols-typescript';

import { BrandBlue, BrandGold } from '@/constants/theme';

export type OnboardingSlide = {
  key: string;
  icon: SFSymbol;
  iconColor: string;
  title: string;
  description: string;
};

/** Shown once on first launch (welcome carousel) and replayable anytime from Settings. */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: 'welcome',
    icon: 'hand.wave.fill',
    iconColor: BrandGold,
    title: 'Salam Fellow Muslim,\nwelcome to Amana',
    description:
      "A calm companion for your prayers, Qur'an, and daily remembrance — all in one place. Here's a quick look around.",
  },
  {
    key: 'prayer-times',
    icon: 'clock.fill',
    iconColor: BrandGold,
    title: 'Prayer Times & Athan',
    description:
      'Accurate prayer times for wherever you are, with a gentle Athan reminder for each one. Find them on the Prayers tab.',
  },
  {
    key: 'qibla',
    icon: 'safari.fill',
    iconColor: BrandBlue,
    title: 'Qibla Compass',
    description: 'Point your phone and the compass shows you the exact direction to the Kaaba, wherever you are.',
  },
  {
    key: 'quran',
    icon: 'book.closed.fill',
    iconColor: BrandGold,
    title: "Qur'an Reader",
    description:
      'Tap the page to show the toolbar for reciter, text size, and translation. Long-press any verse to play it, bookmark it, add a note, or see its translation.',
  },
  {
    key: 'duas-tracker',
    icon: 'hands.sparkles.fill',
    iconColor: BrandBlue,
    title: 'Duas & Prayer Tracker',
    description: 'A library of daily duas, plus a simple tracker to mark off each prayer and build your streak.',
  },
  {
    key: 'reminders',
    icon: 'bell.fill',
    iconColor: BrandGold,
    title: 'Daily Reminders',
    description:
      "Gentle notifications for prayers, adhkar, and Friday sunnahs — all optional and customizable in Settings.",
  },
];
