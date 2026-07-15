import { router, useFocusEffect } from 'expo-router';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SFSymbol } from 'sf-symbols-typescript';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { startingJuzForChapter } from '@/constants/juz-boundaries';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getQuranChapters, QuranChapter } from '@/lib/quran-chapters';
import { formatRelativeTime, getRecentReads, RecentRead } from '@/lib/quran-recent';

const JUZ_NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);

const SUB_NAV: { href: '/quran' | '/quran/notes' | '/quran/bookmarks' | '/quran/search' | '/settings'; label: string; sf: SFSymbol }[] = [
  { href: '/quran', label: 'Surahs / Juz\'', sf: 'text.book.closed.fill' },
  { href: '/quran/notes', label: 'Notes', sf: 'note.text' },
  { href: '/quran/bookmarks', label: 'Bookmarks', sf: 'bookmark.fill' },
  { href: '/quran/search', label: 'Search', sf: 'magnifyingglass' },
  { href: '/settings', label: 'Settings', sf: 'gearshape.fill' },
];

function promptReadingMode(onChoose: (mode: 'both' | 'arabic') => void) {
  Alert.alert('Reading Mode', 'How would you like to read?', [
    { text: 'Arabic + English', onPress: () => onChoose('both') },
    { text: 'Arabic Only', onPress: () => onChoose('arabic') },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

export default function QuranIndexScreen() {
  const [viewMode, setViewMode] = useState<'surahs' | 'juz'>('surahs');
  const [ascending, setAscending] = useState(true);
  const [chapters, setChapters] = useState<QuranChapter[] | null>(null);
  const [recent, setRecent] = useState<RecentRead[]>([]);

  useEffect(() => {
    getQuranChapters().then(setChapters);
  }, []);

  useFocusEffect(
    useCallback(() => {
      getRecentReads().then(setRecent);
    }, []),
  );

  const groupedSections = useMemo(() => {
    if (!chapters) return [];
    const result: { title: string; juz: number; data: QuranChapter[] }[] = [];
    let lastJuz = 0;
    for (const chapter of chapters) {
      const juz = startingJuzForChapter(chapter.id);
      if (juz !== lastJuz) {
        result.push({ title: `Juz' ${juz}`, juz, data: [] });
        lastJuz = juz;
      }
      result[result.length - 1].data.push(chapter);
    }
    return ascending
      ? result
      : [...result].reverse().map((section) => ({ ...section, data: [...section.data].reverse() }));
  }, [chapters, ascending]);

  function openChapter(chapter: QuranChapter) {
    promptReadingMode((mode) => {
      router.push({
        pathname: '/quran/[id]',
        params: { id: startingJuzForChapter(chapter.id), mode, chapter: chapter.id },
      });
    });
  }

  function openJuz(juz: number) {
    promptReadingMode((mode) => {
      router.push({ pathname: '/quran/[id]', params: { id: juz, mode } });
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => setAscending((prev) => !prev)} hitSlop={8}>
            <SymbolView
              name={{
                ios: 'arrow.up.arrow.down',
                android: 'sort',
                web: 'sort',
              }}
              size={20}
            />
          </Pressable>

          <View style={styles.segmentedControl}>
            <Pressable onPress={() => setViewMode('surahs')} style={styles.segmentButton}>
              <ThemedView
                type={viewMode === 'surahs' ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.segmentInner}>
                <ThemedText type="small">Surahs</ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable onPress={() => setViewMode('juz')} style={styles.segmentButton}>
              <ThemedView
                type={viewMode === 'juz' ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.segmentInner}>
                <ThemedText type="small">Juz&apos;</ThemedText>
              </ThemedView>
            </Pressable>
          </View>

          <View style={styles.topBarSpacer} />
        </View>

        {viewMode === 'surahs' ? (
          <SectionList
            sections={groupedSections}
            keyExtractor={(chapter) => String(chapter.id)}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              recent.length > 0 ? (
                <View style={styles.recentSection}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.recentLabel}>
                    RECENT PAGES
                  </ThemedText>
                  <ThemedView type="backgroundElement" style={styles.recentCard}>
                    {recent.map((r, index) => (
                      <View
                        key={r.chapterId}
                        style={[styles.recentRow, index > 0 && styles.recentRowDivider]}>
                        <View style={styles.recentRowText}>
                          <ThemedText type="smallBold">{r.chapterName}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {formatRelativeTime(r.viewedAt)}
                          </ThemedText>
                        </View>
                        <ThemedText type="small" themeColor="textSecondary">
                          {r.pageNumber}
                        </ThemedText>
                      </View>
                    ))}
                  </ThemedView>
                </View>
              ) : null
            }
            renderSectionHeader={({ section }) => (
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeader}>
                {section.title.toUpperCase()}
              </ThemedText>
            )}
            renderItem={({ item }) => (
              <Pressable onPress={() => openChapter(item)}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <View style={styles.rowText}>
                    <ThemedText type="smallBold">
                      {item.id}. {item.nameSimple}{' '}
                      <ThemedText style={styles.rowArabic}>{item.nameArabic}</ThemedText>
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.revelationPlace === 'makkah' ? 'Makki' : 'Madani'} · {item.versesCount}{' '}
                      verses
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.startPage}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            )}
          />
        ) : (
          <SectionList
            sections={[{ title: '', data: ascending ? JUZ_NUMBERS : [...JUZ_NUMBERS].reverse() }]}
            keyExtractor={(juz) => String(juz)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: juz }) => (
              <Pressable onPress={() => openJuz(juz)}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="smallBold">Juz&apos; {juz}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    ›
                  </ThemedText>
                </ThemedView>
              </Pressable>
            )}
          />
        )}

        <View style={styles.subNav}>
          {SUB_NAV.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <Pressable style={styles.subNavItem}>
                <SymbolView name={item.sf} size={20} />
                <ThemedText type="small" style={styles.subNavLabel} numberOfLines={1}>
                  {item.label}
                </ThemedText>
              </Pressable>
            </Link>
          ))}
        </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    paddingVertical: Spacing.three,
  },
  topBarSpacer: {
    width: 20,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  segmentButton: {},
  segmentInner: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  listContent: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  recentSection: {
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  recentLabel: {
    paddingHorizontal: Spacing.two,
  },
  recentCard: {
    borderRadius: Spacing.three,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: 'transparent',
  },
  recentRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
  },
  recentRowText: {
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'transparent',
  },
  rowArabic: {
    fontSize: 15,
  },
  subNav: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    justifyContent: 'space-around',
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
  },
  subNavItem: {
    alignItems: 'center',
    gap: Spacing.one,
    width: 64,
  },
  subNavLabel: {
    textAlign: 'center',
    fontSize: 11,
  },
});
