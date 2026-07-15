/**
 * The (chapter, verse) where each of the 30 Juz' begins, verified against
 * the quran.com API's by_juz endpoint (the first verse returned per juz).
 */
export const JUZ_BOUNDARIES: { juz: number; chapter: number; verse: number }[] = [
  { juz: 1, chapter: 1, verse: 1 },
  { juz: 2, chapter: 2, verse: 142 },
  { juz: 3, chapter: 2, verse: 253 },
  { juz: 4, chapter: 3, verse: 93 },
  { juz: 5, chapter: 4, verse: 24 },
  { juz: 6, chapter: 4, verse: 148 },
  { juz: 7, chapter: 5, verse: 82 },
  { juz: 8, chapter: 6, verse: 111 },
  { juz: 9, chapter: 7, verse: 88 },
  { juz: 10, chapter: 8, verse: 41 },
  { juz: 11, chapter: 9, verse: 93 },
  { juz: 12, chapter: 11, verse: 6 },
  { juz: 13, chapter: 12, verse: 53 },
  { juz: 14, chapter: 15, verse: 1 },
  { juz: 15, chapter: 17, verse: 1 },
  { juz: 16, chapter: 18, verse: 75 },
  { juz: 17, chapter: 21, verse: 1 },
  { juz: 18, chapter: 23, verse: 1 },
  { juz: 19, chapter: 25, verse: 21 },
  { juz: 20, chapter: 27, verse: 56 },
  { juz: 21, chapter: 29, verse: 46 },
  { juz: 22, chapter: 33, verse: 31 },
  { juz: 23, chapter: 36, verse: 28 },
  { juz: 24, chapter: 39, verse: 32 },
  { juz: 25, chapter: 41, verse: 47 },
  { juz: 26, chapter: 46, verse: 1 },
  { juz: 27, chapter: 51, verse: 31 },
  { juz: 28, chapter: 58, verse: 1 },
  { juz: 29, chapter: 67, verse: 1 },
  { juz: 30, chapter: 78, verse: 1 },
];

/** The juz that a chapter's own verse 1 falls within. */
export function startingJuzForChapter(chapterId: number): number {
  let result = 1;
  for (const boundary of JUZ_BOUNDARIES) {
    const boundaryIsAtOrBeforeChapterStart =
      boundary.chapter < chapterId || (boundary.chapter === chapterId && boundary.verse <= 1);
    if (boundaryIsAtOrBeforeChapterStart) {
      result = boundary.juz;
    }
  }
  return result;
}

/**
 * The mushaf page each Juz' begins on — standard, fixed across the 604-page Madani mushaf
 * layout used by quran.com and virtually every Qur'an app.
 */
export const JUZ_START_PAGES: number[] = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export function startingPageForJuz(juz: number): number {
  return JUZ_START_PAGES[juz - 1] ?? 1;
}
