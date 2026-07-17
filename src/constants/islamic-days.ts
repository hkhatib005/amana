export type IslamicDayEvent = {
  hijriMonth: number;
  hijriDay: number;
  name: string;
  emoji: string;
};

/**
 * Fixed Hijri-calendar occasions. Dates like the start of Ramadan and Eid are
 * shown here as calculated from the tabular Umm al-Qura calendar; your local
 * masjid's moon-sighting announcement may differ by a day.
 */
export const ISLAMIC_DAY_EVENTS: IslamicDayEvent[] = [
  { hijriMonth: 1, hijriDay: 1, name: 'Islamic New Year', emoji: '🌙' },
  { hijriMonth: 1, hijriDay: 10, name: 'Day of Ashura', emoji: '🤲' },
  { hijriMonth: 7, hijriDay: 27, name: "Isra and Mi'raj", emoji: '✨' },
  { hijriMonth: 8, hijriDay: 15, name: "Mid-Sha'ban", emoji: '🌕' },
  { hijriMonth: 9, hijriDay: 1, name: 'Start of Ramadan', emoji: '🌙' },
  { hijriMonth: 9, hijriDay: 27, name: 'Laylat al-Qadr (commonly observed)', emoji: '⭐' },
  { hijriMonth: 10, hijriDay: 1, name: 'Eid al-Fitr', emoji: '🎉' },
  { hijriMonth: 12, hijriDay: 9, name: 'Day of Arafah', emoji: '🕋' },
  { hijriMonth: 12, hijriDay: 10, name: 'Eid al-Adha', emoji: '🐑' },
];
