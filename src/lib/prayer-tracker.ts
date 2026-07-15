export const TRACKED_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type TrackedPrayer = (typeof TRACKED_PRAYERS)[number];

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDayComplete(completed: readonly TrackedPrayer[] | undefined): boolean {
  return TRACKED_PRAYERS.every((prayer) => completed?.includes(prayer));
}

/**
 * Counts backward from today. If today isn't complete yet, the streak still
 * reflects the run ending yesterday (a day isn't "lost" until it's over).
 */
export function computeStreak(
  record: Record<string, readonly TrackedPrayer[]>,
  today: Date = new Date(),
): number {
  const cursor = new Date(today);
  let streak = 0;

  if (!isDayComplete(record[dateKey(cursor)])) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (isDayComplete(record[dateKey(cursor)])) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
