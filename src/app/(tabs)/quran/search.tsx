import { useState } from 'react';
import { FlatList, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { QuranSearchResult, searchQuran } from '@/lib/quran-search';

export default function QuranSearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<{
    loading: boolean;
    results: QuranSearchResult[] | null;
    error: string | null;
  }>({ loading: false, results: null, error: null });

  function runSearch(text: string) {
    setQuery(text);
    if (!text.trim()) {
      setState({ loading: false, results: null, error: null });
      return;
    }
    setState({ loading: true, results: null, error: null });
    searchQuran(text)
      .then((results) => setState({ loading: false, results, error: null }))
      .catch(() => setState({ loading: false, results: null, error: 'Search failed. Try again.' }));
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PageHeader title="Search" />

        <TextInput
          value={query}
          onChangeText={runSearch}
          placeholder="Search the Qur'an (English)"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          autoCorrect={false}
        />

        {state.loading && <ThemedText type="small">Searching…</ThemedText>}
        {state.error && <ThemedText type="small">{state.error}</ThemedText>}

        <FlatList
          data={state.results ?? []}
          keyExtractor={(result) => result.key}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="small" themeColor="textSecondary">
                {item.key}
              </ThemedText>
              <ThemedText style={styles.arabic}>{item.arabic}</ThemedText>
              <ThemedText type="small">
                {item.translationSegments.map((segment, i) => (
                  <ThemedText key={i} type={segment.highlighted ? 'smallBold' : 'small'}>
                    {segment.text}
                  </ThemedText>
                ))}
              </ThemedText>
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
    gap: Spacing.two,
  },
  input: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    marginBottom: Spacing.three,
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
});
