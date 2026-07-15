import { SymbolView } from 'expo-symbols';
import { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SurahBanner } from '@/components/surah-banner';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { toArabicIndicDigits } from '@/lib/arabic-numerals';
import { QuranChapter } from '@/lib/quran-chapters';
import { QuranVerse } from '@/lib/quran-juz-verses';
import { useTheme } from '@/hooks/use-theme';

export function MushafPageView({ verses, chapters }: { verses: QuranVerse[]; chapters: QuranChapter[] }) {
  const theme = useTheme();
  const pages = useMemo(() => {
    const byPage = new Map<number, QuranVerse[]>();
    for (const verse of verses) {
      const existing = byPage.get(verse.pageNumber) ?? [];
      existing.push(verse);
      byPage.set(verse.pageNumber, existing);
    }
    return [...byPage.entries()].sort(([a], [b]) => a - b);
  }, [verses]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageNumber, pageVerses] = pages[pageIndex] ?? [0, []];

  const segments = useMemo(() => {
    const result: { showBanner: boolean; chapterId: number; verses: QuranVerse[] }[] = [];
    pageVerses.forEach((verse, index) => {
      const isNewSurah =
        verse.verseNumber === 1 &&
        (index === 0 || pageVerses[index - 1].chapterId !== verse.chapterId);
      if (isNewSurah || result.length === 0) {
        result.push({ showBanner: isNewSurah, chapterId: verse.chapterId, verses: [verse] });
      } else {
        result[result.length - 1].verses.push(verse);
      }
    });
    return result;
  }, [pageVerses]);

  function goToPrevious() {
    setPageIndex((i) => Math.max(0, i - 1));
  }

  function goToNext() {
    setPageIndex((i) => Math.min(pages.length - 1, i + 1));
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 15 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderRelease: (_evt, gesture) => {
        // Qur'an reads right-to-left: swipe left advances to the next page,
        // swipe right goes back — the opposite of an LTR carousel.
        if (gesture.dx < -50) {
          goToNext();
        } else if (gesture.dx > 50) {
          goToPrevious();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <ScrollView
        key={pageIndex}
        style={styles.pageBody}
        contentContainerStyle={styles.pageBodyContent}
        showsVerticalScrollIndicator={false}>
        {segments.map((segment, i) => {
          const chapterName = chapters.find((c) => c.id === segment.chapterId)?.nameArabic ?? '';
          return (
            <View key={i}>
              {segment.showBanner && <SurahBanner nameArabic={chapterName} />}
              <Text style={[styles.flowingText, { color: theme.text }]}>
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
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={goToPrevious} disabled={pageIndex === 0} hitSlop={8}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={20}
            style={pageIndex === 0 ? styles.disabled : undefined}
          />
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary">
          Page {pageNumber}
        </ThemedText>

        <Pressable onPress={goToNext} disabled={pageIndex >= pages.length - 1} hitSlop={8}>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={20}
            style={pageIndex >= pages.length - 1 ? styles.disabled : undefined}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  pageBody: {
    flex: 1,
  },
  pageBodyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.four,
  },
  flowingText: {
    fontSize: 22,
    lineHeight: 46,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.five,
    paddingVertical: Spacing.three,
  },
  disabled: {
    opacity: 0.3,
  },
});
