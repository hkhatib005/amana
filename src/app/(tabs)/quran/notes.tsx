import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getNotes, QuranNote, setNote } from '@/lib/quran-notes';

export default function QuranNotesScreen() {
  const [notes, setNotes] = useState<QuranNote[]>([]);

  useFocusEffect(
    useCallback(() => {
      getNotes().then(setNotes);
    }, []),
  );

  function editNote(note: QuranNote) {
    Alert.prompt(
      `Note for ${note.verseKey}`,
      undefined,
      async (text) => {
        await setNote(note.verseKey, note.chapterName, text ?? '');
        getNotes().then(setNotes);
      },
      'plain-text',
      note.text,
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PageHeader title="Notes" />

        {notes.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            No notes yet. Tap the note icon on a verse while reading to add one.
          </ThemedText>
        )}

        <FlatList
          data={notes}
          keyExtractor={(note) => note.verseKey}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable onPress={() => editNote(item)}>
              <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold">
                  {item.chapterName} {item.verseKey}
                </ThemedText>
                <ThemedText type="small">{item.text}</ThemedText>
              </ThemedView>
            </Pressable>
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
    gap: Spacing.two,
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
});
