import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useFonts } from 'expo-font';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { SurahBanner } from '@/components/surah-banner';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { toArabicIndicDigits } from '@/lib/arabic-numerals';
import { QuranChapter } from '@/lib/quran-chapters';
import { getPageVerses, QuranPageVerse, TOTAL_MUSHAF_PAGES } from '@/lib/quran-page-data';
import { getVerseAudioUrl } from '@/lib/quran-foundation-client';

const QURAN_FONT_FAMILY = 'UthmanicHafs';

const PRELOAD_RADIUS = 2;

export const MANUSCRIPT_COLORS = {
  light: { background: '#FBF3E2', text: '#2A2018', textSecondary: '#8C7A5D' },
  dark: { background: '#1B1712', text: '#EDE0C8', textSecondary: '#A6926B' },
};

export function useManuscriptColors() {
  const scheme = useColorScheme();
  return MANUSCRIPT_COLORS[scheme === 'dark' ? 'dark' : 'light'];
}

export type MushafPageInfo = { pageNumber: number; juzNumber: number; chapterId: number };

type MushafPagerProps = {
  initialPageNumber: number;
  chapters: QuranChapter[];
  showTranslation: boolean;
  onPageInfoChange: (info: MushafPageInfo) => void;
};

function MushafPageContent({
  pageNumber,
  verses,
  chapters,
  showTranslation,
  fontFamily,
  activeVerseKey,
  loadingVerseKey,
  onVersePress,
}: {
  pageNumber: number;
  verses: QuranPageVerse[] | undefined;
  chapters: QuranChapter[];
  showTranslation: boolean;
  fontFamily: string | undefined;
  activeVerseKey: string | null;
  loadingVerseKey: string | null;
  onVersePress: (verseKey: string) => void;
}) {
  const theme = useManuscriptColors();

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
                <Text
                  onPress={() => onVersePress(verse.key)}
                  style={[
                    styles.flowingText,
                    { color: theme.text, fontFamily },
                    verse.key === activeVerseKey && styles.verseActive,
                    verse.key === loadingVerseKey && styles.verseLoading,
                  ]}>
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
                <Text
                  key={verse.key}
                  onPress={() => onVersePress(verse.key)}
                  style={[
                    verse.key === activeVerseKey && styles.verseActive,
                    verse.key === loadingVerseKey && styles.verseLoading,
                  ]}>
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

      <Text style={[styles.pageNumber, { color: theme.textSecondary }]}>
        {toArabicIndicDigits(pageNumber)}
      </Text>
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
  const [fontsLoaded] = useFonts({ [QURAN_FONT_FAMILY]: require('@/assets/fonts/UthmanicHafs.ttf') });
  const fontFamily = fontsLoaded ? QURAN_FONT_FAMILY : undefined;
  const manuscript = useManuscriptColors();

  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [loadingVerseKey, setLoadingVerseKey] = useState<string | null>(null);

  useEffect(() => {
    if (playerStatus.didJustFinish) setActiveVerseKey(null);
  }, [playerStatus.didJustFinish]);

  const playVerse = useCallback(
    async (verseKey: string) => {
      if (verseKey === activeVerseKey) {
        if (playerStatus.playing) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }
      setLoadingVerseKey(verseKey);
      try {
        const url = await getVerseAudioUrl(verseKey);
        if (!url) return;
        player.replace(url);
        player.play();
        setActiveVerseKey(verseKey);
      } finally {
        setLoadingVerseKey(null);
      }
    },
    [activeVerseKey, playerStatus.playing, player],
  );

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
      style={[styles.pager, { backgroundColor: manuscript.background }]}
      layoutDirection="rtl"
      initialPage={initialPageNumber - 1}
      offscreenPageLimit={PRELOAD_RADIUS}
      onPageSelected={(event) => setPageIndex(event.nativeEvent.position)}>
      {Array.from({ length: TOTAL_MUSHAF_PAGES }, (_, i) => {
        const pageNumber = i + 1;
        const withinWindow = Math.abs(pageNumber - (pageIndex + 1)) <= PRELOAD_RADIUS;
        return (
          <View key={pageNumber} style={[styles.page, { backgroundColor: manuscript.background }]}>
            {withinWindow && (
              <MushafPageContent
                pageNumber={pageNumber}
                verses={pagesData[pageNumber]}
                chapters={chapters}
                showTranslation={showTranslation}
                fontFamily={fontFamily}
                activeVerseKey={activeVerseKey}
                loadingVerseKey={loadingVerseKey}
                onVersePress={playVerse}
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
    paddingTop: 24,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowingText: {
    fontSize: 16,
    lineHeight: 44,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  pageNumber: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
  verseBlock: {
    marginBottom: 20,
  },
  verseLoading: {
    opacity: 0.5,
  },
  verseActive: {
    textDecorationLine: 'underline',
  },
  translationText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    marginTop: 8,
  },
});
