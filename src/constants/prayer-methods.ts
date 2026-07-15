import { CalculationMethod } from 'adhan';

export const PrayerCalculationMethods = {
  MuslimWorldLeague: { label: 'Muslim World League', factory: CalculationMethod.MuslimWorldLeague },
  NorthAmerica: { label: 'ISNA (North America)', factory: CalculationMethod.NorthAmerica },
  UmmAlQura: { label: 'Umm al-Qura (Makkah)', factory: CalculationMethod.UmmAlQura },
  Egyptian: { label: 'Egyptian General Authority', factory: CalculationMethod.Egyptian },
  Karachi: { label: 'University of Karachi', factory: CalculationMethod.Karachi },
} as const;

export type PrayerCalculationMethodKey = keyof typeof PrayerCalculationMethods;

export const DefaultPrayerCalculationMethod: PrayerCalculationMethodKey = 'MuslimWorldLeague';
