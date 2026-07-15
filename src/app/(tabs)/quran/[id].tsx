import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MushafPager, MushafPageInfo } from '@/components/mushaf-pager';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getQuranChapters, QuranChapter } from '@/lib/quran-chapters';
import { recordRecentRead } from '@/lib/quran-recent';
import { useTabBarVisibility } from '@/providers/tab-bar-visibility-provider';

export default function QuranReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const initialPageNumber = Number(id) || 1;
  const [chapters, setChapters] = useState<QuranChapter[] | null>(null);
  const [pageInfo, setPageInfo] = useState<MushafPageInfo | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const { setHidden: setTabBarHidden } = useTabBarVisibility();

  useEffect(() => {
    getQuranChapters().then(setChapters);
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
    <ThemedView style={styles.container}>
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
          </ThemedView>
        )}

        {chapters && (
          <Pressable style={styles.pagerWrap} onPress={toggleChrome}>
            <MushafPager
              initialPageNumber={initialPageNumber}
              chapters={chapters}
              showTranslation={showTranslation}
              onPageInfoChange={handlePageInfoChange}
            />
          </Pressable>
        )}

        {!chromeVisible && pageInfo && (
          <ThemedView type="backgroundElement" style={styles.pageFooter} pointerEvents="none">
            <ThemedText type="small" themeColor="textSecondary">
              {pageInfo.pageNumber}
            </ThemedText>
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
    borderRadius: Spacing.three,
    padding: Spacing.two,
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
  pageFooter: {
    position: 'absolute',
    bottom: Spacing.five,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
});
