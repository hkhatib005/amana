import { setAudioModeAsync, useAudioPlaylist, useAudioPlaylistStatus } from 'expo-audio';
import { useFonts } from 'expo-font';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';

import { SurahBanner } from '@/components/surah-banner';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { toArabicIndicDigits } from '@/lib/arabic-numerals';
import { QuranChapter } from '@/lib/quran-chapters';
import { getPageVerses, QuranPageVerse, TOTAL_MUSHAF_PAGES } from '@/lib/quran-page-data';
import { getVerseAudioUrls } from '@/lib/quran-foundation-client';

const QURAN_FONT_FAMILY = 'UthmanicHafs';

const PRELOAD_RADIUS = 2;

const MANUSCRIPT_ACCENT = '#C9A227';

export const MANUSCRIPT_COLORS = {
  light: { background: '#FBF3E2', text: '#2A2018', textSecondary: '#8C7A5D' },
  dark: { background: '#1B1712', text: '#EDE0C8', textSecondary: '#A6926B' },
};

export function useManuscriptColors() {
  const scheme = useColorScheme();
  return MANUSCRIPT_COLORS[scheme === 'dark' ? 'dark' : 'light'];
}

export type MushafPageInfo = { pageNumber: number; juzNumber: number; chapterId: number };

export type PlaybackState = { playing: boolean; playbackRate: number } | null;

export type MushafPagerHandle = {
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  setPlaybackRate: (rate: number) => void;
};

type MushafPagerProps = {
  initialPageNumber: number;
  chapters: QuranChapter[];
  showTranslation: boolean;
  reciterId: number;
  textSizeScale: number;
  onPageInfoChange: (info: MushafPageInfo) => void;
  onPlaybackStateChange: (state: PlaybackState) => void;
};

function MushafPageContent({
  pageNumber,
  verses,
  chapters,
  showTranslation,
  fontFamily,
  activeVerseKey,
  loadingVerseKey,
  textSizeScale,
  onVersePress,
}: {
  pageNumber: number;
  verses: QuranPageVerse[] | undefined;
  chapters: QuranChapter[];
  showTranslation: boolean;
  fontFamily: string | undefined;
  activeVerseKey: string | null;
  loadingVerseKey: string | null;
  textSizeScale: number;
  onVersePress: (verseKey: string) => void;
}) {
  const theme = useManuscriptColors();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const baseFlowing = isLandscape ? { fontSize: 22, lineHeight: 62 } : { fontSize: 17, lineHeight: 48 };
  const baseTranslation = isLandscape ? { fontSize: 19, lineHeight: 28 } : { fontSize: 15, lineHeight: 22 };
  const flowingTextSize = {
    fontSize: Math.round(baseFlowing.fontSize * textSizeScale),
    lineHeight: Math.round(baseFlowing.lineHeight * textSizeScale),
  };
  const translationTextSize = {
    fontSize: Math.round(baseTranslation.fontSize * textSizeScale),
    lineHeight: Math.round(baseTranslation.lineHeight * textSizeScale),
  };

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
    <ScrollView
      style={styles.pageScroll}
      contentContainerStyle={styles.pageBodyContent}
      showsVerticalScrollIndicator={false}>
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
                    flowingTextSize,
                    { color: verse.key === activeVerseKey ? MANUSCRIPT_ACCENT : theme.text, fontFamily },
                    verse.key === loadingVerseKey && styles.verseLoading,
                  ]}>
                  {verse.arabic}
                  <Text style={{ color: theme.textSecondary }}>
                    {' '}
                    ﴿{toArabicIndicDigits(verse.verseNumber)}﴾
                  </Text>
                </Text>
                <Text style={[styles.translationText, translationTextSize, { color: theme.textSecondary }]}>
                  {verse.translation}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.flowingText, flowingTextSize, { color: theme.text, fontFamily }]}>
              {segment.verses.map((verse) => (
                <Text
                  key={verse.key}
                  onPress={() => onVersePress(verse.key)}
                  style={[
                    verse.key === activeVerseKey && { color: MANUSCRIPT_ACCENT },
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
    </ScrollView>
  );
}

export const MushafPager = forwardRef<MushafPagerHandle, MushafPagerProps>(function MushafPager(
  { initialPageNumber, chapters, showTranslation, reciterId, textSizeScale, onPageInfoChange, onPlaybackStateChange },
  ref,
) {
  const pagerRef = useRef<PagerView>(null);
  const [pageIndex, setPageIndex] = useState(initialPageNumber - 1);
  const [pagesData, setPagesData] = useState<Record<number, QuranPageVerse[]>>({});
  const loadingPages = useRef<Set<number>>(new Set());
  const [fontsLoaded] = useFonts({ [QURAN_FONT_FAMILY]: require('@/assets/fonts/UthmanicHafs.ttf') });
  const fontFamily = fontsLoaded ? QURAN_FONT_FAMILY : undefined;
  const manuscript = useManuscriptColors();

  const playlist = useAudioPlaylist({ loop: 'none' });
  const playlistStatus = useAudioPlaylistStatus(playlist);
  const playlistVerseKeysRef = useRef<string[]>([]);
  const playlistThroughPageRef = useRef<number>(0);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [loadingVerseKey, setLoadingVerseKey] = useState<string | null>(null);

  useEffect(() => {
    setAudioModeAsync({
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  // Rebuild the current queue with the new reciter's audio, resuming at the same verse.
  const prevReciterIdRef = useRef(reciterId);
  useEffect(() => {
    if (reciterId === prevReciterIdRef.current) return;
    prevReciterIdRef.current = reciterId;
    const keys = playlistVerseKeysRef.current;
    if (keys.length === 0) return;
    const resumeIndex = playlistStatus.currentIndex;
    const wasPlaying = playlistStatus.playing;
    getVerseAudioUrls(keys, reciterId).then((urls) => {
      playlist.clear();
      const newKeys: string[] = [];
      keys.forEach((key, i) => {
        const url = urls[i];
        if (!url) return;
        playlist.add({ uri: url });
        newKeys.push(key);
      });
      playlistVerseKeysRef.current = newKeys;
      const newIndex = Math.min(resumeIndex, newKeys.length - 1);
      if (newIndex >= 0) {
        playlist.skipTo(newIndex);
        if (wasPlaying) playlist.play();
      }
    });
  }, [reciterId, playlist, playlistStatus.currentIndex, playlistStatus.playing]);

  // Keep the highlighted verse in sync with the playlist's current track.
  useEffect(() => {
    if (playlistStatus.trackCount === 0) return;
    setActiveVerseKey(playlistVerseKeysRef.current[playlistStatus.currentIndex] ?? null);
  }, [playlistStatus.currentIndex, playlistStatus.trackCount]);

  useImperativeHandle(
    ref,
    () => ({
      play: () => playlist.play(),
      pause: () => playlist.pause(),
      next: () => playlist.next(),
      previous: () => playlist.previous(),
      stop: () => {
        playlist.clear();
        playlistVerseKeysRef.current = [];
        setActiveVerseKey(null);
      },
      setPlaybackRate: (rate: number) => {
        playlist.playbackRate = rate;
      },
    }),
    [playlist],
  );

  useEffect(() => {
    onPlaybackStateChange(
      activeVerseKey ? { playing: playlistStatus.playing, playbackRate: playlistStatus.playbackRate } : null,
    );
  }, [activeVerseKey, playlistStatus.playing, playlistStatus.playbackRate, onPlaybackStateChange]);

  // Clear the highlight once the last queued track finishes with nothing further to play.
  useEffect(() => {
    if (
      playlistStatus.didJustFinish &&
      playlistStatus.currentIndex >= playlistVerseKeysRef.current.length - 1
    ) {
      setActiveVerseKey(null);
    }
  }, [playlistStatus.didJustFinish, playlistStatus.currentIndex]);

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

  // Follow the playlist's current track across page boundaries without interrupting audio.
  useEffect(() => {
    const key = playlistVerseKeysRef.current[playlistStatus.currentIndex];
    if (!key) return;
    for (const [pageNumberKey, verses] of Object.entries(pagesData)) {
      if (verses.some((v) => v.key === key)) {
        const pageNumber = Number(pageNumberKey);
        if (pageNumber !== pageIndex + 1) {
          pagerRef.current?.setPage(pageNumber - 1);
        }
        break;
      }
    }
  }, [playlistStatus.currentIndex, pagesData, pageIndex]);

  // Extend the playlist as further pages finish loading, so playback never runs dry.
  useEffect(() => {
    if (playlistVerseKeysRef.current.length === 0) return;
    const nextPage = playlistThroughPageRef.current + 1;
    const nextVerses = pagesData[nextPage];
    if (!nextVerses) return;
    playlistThroughPageRef.current = nextPage;
    getVerseAudioUrls(
      nextVerses.map((v) => v.key),
      reciterId,
    ).then((urls) => {
      nextVerses.forEach((verse, i) => {
        const url = urls[i];
        if (!url) return;
        playlist.add({ uri: url });
        playlistVerseKeysRef.current.push(verse.key);
      });
    });
  }, [pagesData, playlist, reciterId]);

  const playVerse = useCallback(
    async (verseKey: string) => {
      if (verseKey === playlistVerseKeysRef.current[playlistStatus.currentIndex]) {
        if (playlistStatus.playing) {
          playlist.pause();
        } else {
          playlist.play();
        }
        return;
      }

      // Queue the tapped verse through the end of its page, then every already-loaded
      // consecutive page after it, so playback can flow forward without interruption.
      let startPage: number | null = null;
      let startIndex = 0;
      for (const [pageNumberKey, verses] of Object.entries(pagesData)) {
        const idx = verses.findIndex((v) => v.key === verseKey);
        if (idx !== -1) {
          startPage = Number(pageNumberKey);
          startIndex = idx;
          break;
        }
      }
      if (startPage === null) return;

      const queue: QuranPageVerse[] = [...pagesData[startPage].slice(startIndex)];
      let page = startPage + 1;
      while (pagesData[page]) {
        queue.push(...pagesData[page]);
        page += 1;
      }

      setLoadingVerseKey(verseKey);
      try {
        const urls = await getVerseAudioUrls(
          queue.map((v) => v.key),
          reciterId,
        );
        const keys: string[] = [];
        playlist.clear();
        queue.forEach((verse, i) => {
          const url = urls[i];
          if (!url) return;
          playlist.add({ uri: url });
          keys.push(verse.key);
        });
        playlistVerseKeysRef.current = keys;
        playlistThroughPageRef.current = page - 1;
        playlist.play();
      } finally {
        setLoadingVerseKey(null);
      }
    },
    [pagesData, playlist, playlistStatus.currentIndex, playlistStatus.playing, reciterId],
  );

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
                textSizeScale={textSizeScale}
                onVersePress={playVerse}
              />
            )}
          </View>
        );
      })}
    </PagerView>
  );
});

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageScroll: {
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
    fontSize: 17,
    lineHeight: 48,
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
  translationText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    marginTop: 8,
  },
});
