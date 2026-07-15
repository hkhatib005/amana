import { useFonts } from 'expo-font';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { SurahBanner } from '@/components/surah-banner';
import { useTheme } from '@/hooks/use-theme';
import { toArabicIndicDigits } from '@/lib/arabic-numerals';
import { QuranChapter } from '@/lib/quran-chapters';
import { getPageVerses, QuranPageVerse, TOTAL_MUSHAF_PAGES } from '@/lib/quran-page-data';

const QURAN_FONT_FAMILY = 'AmiriQuran';

const PRELOAD_RADIUS = 2;

export type MushafPageInfo = { pageNumber: number; juzNumber: number; chapterId: number };

type MushafPagerProps = {
  initialPageNumber: number;
  chapters: QuranChapter[];
  showTranslation: boolean;
  onPageInfoChange: (info: MushafPageInfo) => void;
};

function MushafPageContent({
  verses,
  chapters,
  showTranslation,
  fontFamily,
}: {
  verses: QuranPageVerse[] | undefined;
  chapters: QuranChapter[];
  showTranslation: boolean;
  fontFamily: string | undefined;
}) {
  const theme = useTheme();

  const segments = useMemo(() => {
    if (!verses) return [];
    const result: { showBanner: boolean; chapterId: number; verses: QuranPageVerse[] }[] = [];
    verses.forEach((verse, index) => {
      const isNewSurah =
        verse.verseNumber === 1 && (index === 0 || verses[index - 1].chapterId !== verse.chapterId);
      if (isNewSurah || result.length === 0) {
        result.push({ showBanner: isNewSurah, chapterId: verse.chapterId, verses: [verse] });
      } else {
        result[result.length - 1].verses.push(verse);
      }
    });
    return result;
  }, [verses]);

  if (!verses) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.pageBodyContent}>
      {segments.map((segment, i) => (
        <View key={i}>
          {segment.showBanner && (
            <SurahBanner
              nameArabic={chapters.find((c) => c.id === segment.chapterId)?.nameArabic ?? ''}
            />
          )}
          {showTranslation ? (
            segment.verses.map((verse) => (
              <View key={verse.key} style={styles.verseBlock}>
                <Text style={[styles.flowingText, { color: theme.text, fontFamily }]}>
                  {verse.arabic}
                  <Text style={{ color: theme.textSecondary }}>
                    {' '}
                    ﴿{toArabicIndicDigits(verse.verseNumber)}﴾
                  </Text>
                </Text>
                <Text style={[styles.translationText, { color: theme.textSecondary }]}>
                  {verse.translation}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.flowingText, { color: theme.text, fontFamily }]}>
              {segment.verses.map((verse) => (
                <Text key={verse.key}>
                  {verse.arabic}
                  <Text style={{ color: theme.textSecondary }}>
                    {' '}
                    ﴿{toArabicIndicDigits(verse.verseNumber)}﴾{' '}
                  </Text>
                </Text>
              ))}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

export function MushafPager({
  initialPageNumber,
  chapters,
  showTranslation,
  onPageInfoChange,
}: MushafPagerProps) {
  const pagerRef = useRef<PagerView>(null);
  const [pageIndex, setPageIndex] = useState(initialPageNumber - 1);
  const [pagesData, setPagesData] = useState<Record<number, QuranPageVerse[]>>({});
  const loadingPages = useRef<Set<number>>(new Set());
  const [fontsLoaded] = useFonts({ [QURAN_FONT_FAMILY]: require('@/assets/fonts/AmiriQuran.ttf') });
  const fontFamily = fontsLoaded ? QURAN_FONT_FAMILY : undefined;

  const loadPage = useCallback(
    (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > TOTAL_MUSHAF_PAGES) return;
      if (pagesData[pageNumber] || loadingPages.current.has(pageNumber)) return;
      loadingPages.current.add(pageNumber);
      getPageVerses(pageNumber)
        .then((verses) => setPagesData((prev) => ({ ...prev, [pageNumber]: verses })))
        .finally(() => loadingPages.current.delete(pageNumber));
    },
    [pagesData],
  );

  useEffect(() => {
    const current = pageIndex + 1;
    for (let p = current - PRELOAD_RADIUS; p <= current + PRELOAD_RADIUS; p += 1) {
      loadPage(p);
    }
  }, [pageIndex, loadPage]);

  useEffect(() => {
    const current = pageIndex + 1;
    const verses = pagesData[current];
    if (verses && verses.length > 0) {
      onPageInfoChange({ pageNumber: current, juzNumber: verses[0].juzNumber, chapterId: verses[0].chapterId });
    }
  }, [pageIndex, pagesData, onPageInfoChange]);

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pager}
      layoutDirection="rtl"
      initialPage={initialPageNumber - 1}
      offscreenPageLimit={PRELOAD_RADIUS}
      onPageSelected={(event) => setPageIndex(event.nativeEvent.position)}>
      {Array.from({ length: TOTAL_MUSHAF_PAGES }, (_, i) => {
        const pageNumber = i + 1;
        const withinWindow = Math.abs(pageNumber - (pageIndex + 1)) <= PRELOAD_RADIUS;
        return (
          <View key={pageNumber} style={styles.page}>
            {withinWindow && (
              <MushafPageContent
                verses={pagesData[pageNumber]}
                chapters={chapters}
                showTranslation={showTranslation}
                fontFamily={fontFamily}
              />
            )}
          </View>
        );
      })}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageBodyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowingText: {
    fontSize: 24,
    lineHeight: 52,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  verseBlock: {
    marginBottom: 20,
  },
  translationText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    marginTop: 8,
  },
});
