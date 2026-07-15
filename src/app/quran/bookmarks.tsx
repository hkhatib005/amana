import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getBookmarks, QuranBookmark, toggleBookmark } from '@/lib/quran-bookmarks';

export default function QuranBookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);

  useFocusEffect(
    useCallback(() => {
      getBookmarks().then(setBookmarks);
    }, []),
  );

  async function remove(bookmark: QuranBookmark) {
    const updated = await toggleBookmark(bookmark);
    setBookmarks(updated);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedText type="title" style={styles.title}>
          Bookmarks
        </ThemedText>

        {bookmarks.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            No bookmarks yet. Tap the bookmark icon on a verse while reading to save it here.
          </ThemedText>
        )}

        <FlatList
          data={bookmarks}
          keyExtractor={(b) => b.verseKey}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">
                {item.chapterName} {item.verseKey}
              </ThemedText>
              <ThemedText style={styles.arabic}>{item.arabic}</ThemedText>
              <ThemedText type="small">{item.translation}</ThemedText>
              <Pressable onPress={() => remove(item)}>
                <ThemedText type="small" style={styles.removeLink}>
                  Remove
                </ThemedText>
              </Pressable>
            </ThemedView>
          )}
        />
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
  title: {
    alignSelf: 'flex-start',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  listContent: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  arabic: {
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  removeLink: {
    color: '#C0392B',
    paddingTop: Spacing.two,
  },
});
