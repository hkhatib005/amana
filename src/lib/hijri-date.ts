import umalqura from '@umalqura/core';

const { $: UmAlQura } = umalqura;

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export function hijriMonthName(month: number) {
  return HIJRI_MONTHS[month - 1];
}

export function gregorianToHijri(date: Date) {
  const { hy, hm, hd } = UmAlQura.gregorianToHijri(date);
  return { year: hy, month: hm, day: hd };
}

export function hijriToGregorian(hijriYear: number, hijriMonth: number, hijriDay: number): Date {
  return UmAlQura.toDate(hijriYear, hijriMonth, hijriDay);
}

export function formatHijriDate(date: Date = new Date()) {
  const { year, month, day } = gregorianToHijri(date);
  return `${day} ${hijriMonthName(month)} ${year} AH`;
}
