import { useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MushafPageView } from '@/components/mushaf-page-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getJuzVerses, QuranVerse } from '@/lib/quran-juz-verses';
import { getQuranChapters, QuranChapter } from '@/lib/quran-chapters';
import { isBookmarked, toggleBookmark } from '@/lib/quran-bookmarks';
import { getNoteForVerse, setNote } from '@/lib/quran-notes';
import { recordRecentRead } from '@/lib/quran-recent';

type ListRow = { type: 'header'; chapterName: string } | { type: 'verse'; verse: QuranVerse };

export default function QuranJuzScreen() {
  const { id, mode, chapter } = useLocalSearchParams<{ id: string; mode?: string; chapter?: string }>();
  const juzNumber = Number(id);
  const focusChapterId = chapter ? Number(chapter) : null;
  const [showTranslation, setShowTranslation] = useState(mode !== 'arabic');

  const [chapters, setChapters] = useState<QuranChapter[] | null>(null);
  const [state, setState] = useState<{
    loading: boolean;
    verses: QuranVerse[] | null;
    error: string | null;
  }>({ loading: true, verses: null, error: null });
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Set<string>>(new Set());
  const [notedKeys, setNotedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    getQuranChapters().then(setChapters);
  }, []);

  useEffect(() => {
    setState({ loading: true, verses: null, error: null });
    getJuzVerses(juzNumber)
      .then((verses) => setState({ loading: false, verses, error: null }))
      .catch(() => setState({ loading: false, verses: null, error: "Couldn't load this juz." }));
  }, [juzNumber]);

  useEffect(() => {
    if (!focusChapterId || !chapters) return;
    const focusChapter = chapters.find((c) => c.id === focusChapterId);
    if (focusChapter) {
      recordRecentRead({
        chapterId: focusChapter.id,
        chapterName: focusChapter.nameSimple,
        chapterNameArabic: focusChapter.nameArabic,
        pageNumber: focusChapter.startPage,
      });
    }
  }, [focusChapterId, chapters]);

  async function handleToggleBookmark(verse: QuranVerse, chapterName: string) {
    await toggleBookmark({
      verseKey: verse.key,
      chapterName,
      arabic: verse.arabic,
      translation: verse.translation,
    });
    setBookmarkedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(verse.key)) {
        next.delete(verse.key);
      } else {
        next.add(verse.key);
      }
      return next;
    });
  }

  async function handleAddNote(verse: QuranVerse, chapterName: string) {
    const existing = await getNoteForVerse(verse.key);
    Alert.prompt(
      `Note for ${verse.key}`,
      undefined,
      async (text) => {
        await setNote(verse.key, chapterName, text ?? '');
        setNotedKeys((prev) => {
          const next = new Set(prev);
          if (text?.trim()) next.add(verse.key);
          else next.delete(verse.key);
          return next;
        });
      },
      'plain-text',
      existing ?? '',
    );
  }

  const rows: ListRow[] = [];
  if (state.verses && chapters) {
    let lastChapterId: number | null = null;
    for (const verse of state.verses) {
      if (verse.chapterId !== lastChapterId) {
        const chapter = chapters.find((c) => c.id === verse.chapterId);
        rows.push({ type: 'header', chapterName: chapter?.nameSimple ?? `Surah ${verse.chapterId}` });
        lastChapterId = verse.chapterId;
      }
      rows.push({ type: 'verse', verse });
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.topRow}>
          <ThemedText type="title">Juz {juzNumber}</ThemedText>
          <View style={styles.modeToggle}>
            <Pressable onPress={() => setShowTranslation(false)}>
              <ThemedView
                type={!showTranslation ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.modeButton}>
                <ThemedText type="small">Arabic</ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable onPress={() => setShowTranslation(true)}>
              <ThemedView
                type={showTranslation ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.modeButton}>
                <ThemedText type="small">Arabic + English</ThemedText>
              </ThemedView>
            </Pressable>
          </View>
        </View>

        {(state.loading || !chapters) && <ThemedText type="small">Loading…</ThemedText>}
        {state.error && <ThemedText type="small">{state.error}</ThemedText>}

        {!showTranslation && state.verses && chapters && (
          <MushafPageView verses={state.verses} chapters={chapters} />
        )}

        {showTranslation && rows.length > 0 && (
          <FlatList
            data={rows}
            keyExtractor={(row, index) => (row.type === 'header' ? `h-${index}` : row.verse.key)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <ThemedText type="smallBold" style={styles.sectionHeader}>
                    {item.chapterName}
                  </ThemedText>
                );
              }

              const chapterName =
                chapters?.find((c) => c.id === item.verse.chapterId)?.nameSimple ?? '';
              const bookmarked = bookmarkedKeys.has(item.verse.key);
              const noted = notedKeys.has(item.verse.key);

              return (
                <ThemedView type="backgroundElement" style={styles.verseCard}>
                  <View style={styles.verseHeader}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.verse.key}
                    </ThemedText>
                    <View style={styles.verseActions}>
                      <Pressable onPress={() => handleAddNote(item.verse, chapterName)} hitSlop={8}>
                        <SymbolView
                          name={{
                            ios: noted ? 'note.text' : 'note.text.badge.plus',
                            android: 'edit_note',
                            web: 'edit_note',
                          }}
                          size={18}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => handleToggleBookmark(item.verse, chapterName)}
                        hitSlop={8}>
                        <SymbolView
                          name={{
                            ios: bookmarked ? 'bookmark.fill' : 'bookmark',
                            android: bookmarked ? 'bookmark' : 'bookmark_border',
                            web: bookmarked ? 'bookmark' : 'bookmark_border',
                          }}
                          size={18}
                        />
                      </Pressable>
                    </View>
                  </View>
                  <ThemedText style={styles.arabic}>{item.verse.arabic}</ThemedText>
                  {showTranslation && <ThemedText type="small">{item.verse.translation}</ThemedText>}
                </ThemedView>
              );
            }}
          />
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
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  topRow: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modeButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  listContent: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  sectionHeader: {
    paddingTop: Spacing.two,
  },
  verseCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  arabic: {
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
