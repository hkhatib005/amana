import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MushafPager,
  MushafPageInfo,
  MushafPagerHandle,
  PlaybackState,
  useManuscriptColors,
} from '@/components/mushaf-pager';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getQuranChapters, QuranChapter } from '@/lib/quran-chapters';
import {
  DEFAULT_READER_COLOR_SCHEME,
  getReaderColorScheme,
  READER_COLOR_SCHEME_OPTIONS,
  setReaderColorScheme as persistReaderColorScheme,
} from '@/lib/quran-color-scheme';
import { DEFAULT_RECITER_ID, getReciters, Reciter } from '@/lib/quran-foundation-client';
import { recordRecentRead } from '@/lib/quran-recent';
import {
  DEFAULT_TEXT_SIZE_SCALE,
  getTextSizeScale,
  setTextSizeScale as persistTextSizeScale,
  TEXT_SIZE_OPTIONS,
} from '@/lib/quran-text-size';
import { useTabBarVisibility } from '@/providers/tab-bar-visibility-provider';

const PLAYBACK_RATES = [1, 1.25, 0.75];

export default function QuranReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const initialPageNumber = Number(id) || 1;
  const [chapters, setChapters] = useState<QuranChapter[] | null>(null);
  const [pageInfo, setPageInfo] = useState<MushafPageInfo | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [reciterId, setReciterId] = useState(DEFAULT_RECITER_ID);
  const [textSizeScale, setTextSizeScale] = useState(DEFAULT_TEXT_SIZE_SCALE);
  const [colorScheme, setColorScheme] = useState(DEFAULT_READER_COLOR_SCHEME);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(null);
  const pagerHandleRef = useRef<MushafPagerHandle>(null);
  const { setHidden: setTabBarHidden } = useTabBarVisibility();
  const manuscript = useManuscriptColors(colorScheme);

  function chooseColorScheme(scheme: typeof colorScheme) {
    setColorScheme(scheme);
    persistReaderColorScheme(scheme);
  }

  function cyclePlaybackRate() {
    if (!playbackState) return;
    const currentIndex = PLAYBACK_RATES.indexOf(playbackState.playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    pagerHandleRef.current?.setPlaybackRate(nextRate);
  }

  useEffect(() => {
    getQuranChapters().then(setChapters);
  }, []);

  useEffect(() => {
    getReciters().then(setReciters);
  }, []);

  useEffect(() => {
    getTextSizeScale().then(setTextSizeScale);
  }, []);

  useEffect(() => {
    getReaderColorScheme().then(setColorScheme);
  }, []);

  function chooseTextSizeScale(scale: number) {
    setTextSizeScale(scale);
    persistTextSizeScale(scale);
  }

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    setTabBarHidden(!chromeVisible);
    return () => setTabBarHidden(false);
  }, [chromeVisible, setTabBarHidden]);

  const handlePageInfoChange = useCallback(
    (info: MushafPageInfo) => {
      setPageInfo(info);
      const chapter = chapters?.find((c) => c.id === info.chapterId);
      if (chapter) {
        recordRecentRead({
          chapterId: chapter.id,
          chapterName: chapter.nameSimple,
          chapterNameArabic: chapter.nameArabic,
          pageNumber: info.pageNumber,
        });
      }
    },
    [chapters],
  );

  const currentChapterName = chapters?.find((c) => c.id === pageInfo?.chapterId)?.nameSimple;

  function toggleChrome() {
    setModeMenuOpen(false);
    setChromeVisible((prev) => !prev);
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: manuscript.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={20}
            />
          </Pressable>

          {chromeVisible && (
            <>
              <View style={styles.headerText}>
                <ThemedText type="smallBold" numberOfLines={1} style={{ color: manuscript.text }}>
                  {currentChapterName ?? ' '}
                </ThemedText>
                <ThemedText type="small" style={{ color: manuscript.textSecondary }}>
                  {pageInfo ? `Page ${pageInfo.pageNumber} · Juz' ${pageInfo.juzNumber}` : ' '}
                </ThemedText>
              </View>

              <Pressable
                onPress={() => pagerHandleRef.current?.playFirstVerseOfCurrentPage()}
                hitSlop={8}>
                <SymbolView
                  name={{ ios: 'play.circle', android: 'play_circle', web: 'play_circle' }}
                  size={22}
                />
              </Pressable>

              <Pressable onPress={() => setModeMenuOpen((prev) => !prev)} hitSlop={8}>
                <SymbolView
                  name={{ ios: 'ellipsis.circle', android: 'more_horiz', web: 'more_horiz' }}
                  size={22}
                />
              </Pressable>
            </>
          )}
        </View>

        {chromeVisible && modeMenuOpen && (
          <ThemedView type="backgroundElement" style={styles.modeMenu}>
            <View style={styles.modeMenuTabs}>
              <Pressable style={styles.modeMenuTab} onPress={() => setShowTranslation(false)}>
                <ThemedView
                  type={!showTranslation ? 'backgroundSelected' : 'backgroundElement'}
                  style={styles.modeMenuTabInner}>
                  <ThemedText type={!showTranslation ? 'smallBold' : 'small'}>Arabic</ThemedText>
                </ThemedView>
              </Pressable>
              <Pressable style={styles.modeMenuTab} onPress={() => setShowTranslation(true)}>
                <ThemedView
                  type={showTranslation ? 'backgroundSelected' : 'backgroundElement'}
                  style={styles.modeMenuTabInner}>
                  <ThemedText type={showTranslation ? 'smallBold' : 'small'}>
                    Translation
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.reciterLabel}>
              Appearance
            </ThemedText>
            <View style={styles.textSizeRow}>
              {READER_COLOR_SCHEME_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={styles.textSizeButton}
                  onPress={() => chooseColorScheme(option.value)}>
                  <ThemedView
                    type={option.value === colorScheme ? 'backgroundSelected' : 'backgroundElement'}
                    style={styles.textSizeButtonInner}>
                    <ThemedText type={option.value === colorScheme ? 'smallBold' : 'small'}>
                      {option.label}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.reciterLabel}>
              Text Size
            </ThemedText>
            <View style={styles.textSizeRow}>
              {TEXT_SIZE_OPTIONS.map((option) => (
                <Pressable
                  key={option.label}
                  style={styles.textSizeButton}
                  onPress={() => chooseTextSizeScale(option.scale)}>
                  <ThemedView
                    type={option.scale === textSizeScale ? 'backgroundSelected' : 'backgroundElement'}
                    style={styles.textSizeButtonInner}>
                    <ThemedText
                      type={option.scale === textSizeScale ? 'smallBold' : 'small'}
                      style={{ fontSize: 13 + option.scale * 4 }}>
                      A
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>

            {reciters.length > 0 && (
              <>
                <ThemedText type="small" themeColor="textSecondary" style={styles.reciterLabel}>
                  Reciter
                </ThemedText>
                <ScrollView style={styles.reciterList} showsVerticalScrollIndicator={false}>
                  {reciters.map((reciter) => (
                    <Pressable key={reciter.id} onPress={() => setReciterId(reciter.id)}>
                      <ThemedView
                        type={reciter.id === reciterId ? 'backgroundSelected' : 'backgroundElement'}
                        style={styles.reciterRow}>
                        <ThemedText type={reciter.id === reciterId ? 'smallBold' : 'small'}>
                          {reciter.name}
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}
          </ThemedView>
        )}

        {chapters && (
          <Pressable style={styles.pagerWrap} onPress={toggleChrome}>
            <MushafPager
              ref={pagerHandleRef}
              initialPageNumber={initialPageNumber}
              chapters={chapters}
              showTranslation={showTranslation}
              reciterId={reciterId}
              reciterName={reciters.find((r) => r.id === reciterId)?.name}
              textSizeScale={textSizeScale}
              colorScheme={colorScheme}
              onPageInfoChange={handlePageInfoChange}
              onPlaybackStateChange={setPlaybackState}
            />
          </Pressable>
        )}

        {playbackState && (
          <ThemedView type="backgroundElement" style={styles.playbackBar}>
            <Pressable onPress={() => pagerHandleRef.current?.stop()} hitSlop={8}>
              <SymbolView name={{ ios: 'stop.fill', android: 'stop', web: 'stop' }} size={18} />
            </Pressable>

            <Pressable onPress={cyclePlaybackRate} hitSlop={8}>
              <ThemedText type="smallBold">{playbackState.playbackRate}x</ThemedText>
            </Pressable>

            <Pressable onPress={() => pagerHandleRef.current?.previous()} hitSlop={8}>
              <SymbolView
                name={{ ios: 'backward.fill', android: 'skip_previous', web: 'skip_previous' }}
                size={20}
              />
            </Pressable>

            <Pressable
              onPress={() =>
                playbackState.playing ? pagerHandleRef.current?.pause() : pagerHandleRef.current?.play()
              }
              hitSlop={8}>
              <SymbolView
                name={{
                  ios: playbackState.playing ? 'pause.fill' : 'play.fill',
                  android: playbackState.playing ? 'pause' : 'play_arrow',
                  web: playbackState.playing ? 'pause' : 'play_arrow',
                }}
                size={30}
              />
            </Pressable>

            <Pressable onPress={() => pagerHandleRef.current?.next()} hitSlop={8}>
              <SymbolView
                name={{ ios: 'forward.fill', android: 'skip_next', web: 'skip_next' }}
                size={20}
              />
            </Pressable>
          </ThemedView>
        )}

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  modeMenu: {
    position: 'absolute',
    top: 56,
    right: Spacing.four,
    zIndex: 10,
    width: 220,
    maxHeight: 500,
    borderRadius: Spacing.three,
    padding: Spacing.two,
  },
  reciterLabel: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  reciterList: {
    maxHeight: 220,
  },
  reciterRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  textSizeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  textSizeButton: {
    flex: 1,
  },
  textSizeButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  modeMenuTabs: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  modeMenuTab: {},
  modeMenuTabInner: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  pagerWrap: {
    flex: 1,
  },
  playbackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    alignSelf: 'center',
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
});
