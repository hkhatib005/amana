import { CalculationMethod, Madhab } from 'adhan';

export const PrayerCalculationMethods = {
  MuslimWorldLeague: { label: 'Muslim World League', factory: CalculationMethod.MuslimWorldLeague },
  NorthAmerica: { label: 'ISNA (North America)', factory: CalculationMethod.NorthAmerica },
  UmmAlQura: { label: 'Umm al-Qura (Makkah)', factory: CalculationMethod.UmmAlQura },
  Egyptian: { label: 'Egyptian General Authority', factory: CalculationMethod.Egyptian },
  Karachi: { label: 'University of Karachi', factory: CalculationMethod.Karachi },
} as const;

export type PrayerCalculationMethodKey = keyof typeof PrayerCalculationMethods;

export const DefaultPrayerCalculationMethod: PrayerCalculationMethodKey = 'MuslimWorldLeague';

/** North American convention: default new installs here to ISNA rather than the global MWL default. */
export const NorthAmericaCalculationMethod: PrayerCalculationMethodKey = 'NorthAmerica';

/**
 * Asr juristic method: the "standard" majority convention (Shafi'i, Maliki, Hanbali — shadow
 * length factor 1) starts Asr earlier than the Hanafi convention (shadow length factor 2).
 */
export const PrayerMadhabs = {
  Shafi: { label: 'Standard (Shafi, Maliki, Hanbali)', value: Madhab.Shafi },
  Hanafi: { label: 'Hanafi', value: Madhab.Hanafi },
} as const;

export type PrayerMadhabKey = keyof typeof PrayerMadhabs;

export const DefaultPrayerMadhab: PrayerMadhabKey = 'Shafi';
