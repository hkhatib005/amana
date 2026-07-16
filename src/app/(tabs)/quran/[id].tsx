import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MushafPager, MushafPageInfo, useManuscriptColors } from '@/components/mushaf-pager';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getQuranChapters, QuranChapter } from '@/lib/quran-chapters';
import { DEFAULT_RECITER_ID, getReciters, Reciter } from '@/lib/quran-foundation-client';
import { recordRecentRead } from '@/lib/quran-recent';
import {
  DEFAULT_TEXT_SIZE_SCALE,
  getTextSizeScale,
  setTextSizeScale as persistTextSizeScale,
  TEXT_SIZE_OPTIONS,
} from '@/lib/quran-text-size';
import { useTabBarVisibility } from '@/providers/tab-bar-visibility-provider';

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
  const { setHidden: setTabBarHidden } = useTabBarVisibility();
  const manuscript = useManuscriptColors();

  useEffect(() => {
    getQuranChapters().then(setChapters);
  }, []);

  useEffect(() => {
    getReciters().then(setReciters);
  }, []);

  useEffect(() => {
    getTextSizeScale().then(setTextSizeScale);
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
                <ThemedText type="smallBold" numberOfLines={1}>
                  {currentChapterName ?? ' '}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {pageInfo ? `Page ${pageInfo.pageNumber} · Juz' ${pageInfo.juzNumber}` : ' '}
                </ThemedText>
              </View>

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
              initialPageNumber={initialPageNumber}
              chapters={chapters}
              showTranslation={showTranslation}
              reciterId={reciterId}
              textSizeScale={textSizeScale}
              onPageInfoChange={handlePageInfoChange}
            />
          </Pressable>
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
    maxHeight: 420,
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
});
