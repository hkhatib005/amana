import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { DUAS } from '@/constants/duas';

const ACCENT = '#C9A227';
const ACCENT_SOFT = 'rgba(201, 162, 39, 0.16)';

const CATEGORIES = [...new Set(DUAS.map((dua) => dua.category))];

const CATEGORY_EMOJI: Record<string, string> = {
  Daily: '☀️',
  Home: '🏠',
  Masjid: '🕌',
  Travel: '🧳',
  'Distress & Comfort': '🤲',
  Family: '👪',
};

export default function DuasScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const visibleCategories = selectedCategory ? [selectedCategory] : CATEGORIES;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerArea}>
          <PageHeader title="Duas" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}>
          <Pressable onPress={() => setSelectedCategory(null)}>
            <ThemedView
              type={selectedCategory === null ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.chip}>
              <ThemedText type={selectedCategory === null ? 'smallBold' : 'small'}>All</ThemedText>
            </ThemedView>
          </Pressable>
          {CATEGORIES.map((category) => {
            const selected = category === selectedCategory;
            return (
              <Pressable key={category} onPress={() => setSelectedCategory(selected ? null : category)}>
                <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
                  <ThemedText type={selected ? 'smallBold' : 'small'}>
                    {CATEGORY_EMOJI[category] ?? '🤲'} {category}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {visibleCategories.map((category) => (
            <View key={category} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionEmojiBadge}>
                  <ThemedText style={styles.sectionEmoji}>
                    {CATEGORY_EMOJI[category] ?? '🤲'}
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {category.toUpperCase()}
                </ThemedText>
              </View>

              {DUAS.filter((dua) => dua.category === category).map((dua) => (
                <ThemedView key={dua.title} type="backgroundElement" style={styles.card}>
                  <ThemedText type="smallBold">{dua.title}</ThemedText>
                  <ThemedText style={styles.arabic}>{dua.arabic}</ThemedText>
                  <View style={styles.divider} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {dua.translation}
                  </ThemedText>
                </ThemedView>
              ))}
            </View>
          ))}
        </ScrollView>
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
  headerArea: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  chipScroll: {
    flexGrow: 0,
    marginTop: Spacing.two,
  },
  chipRow: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  mainScroll: {
    flex: 1,
    alignSelf: 'stretch',
  },
  chip: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  section: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionEmojiBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionEmoji: {
    fontSize: 14,
    lineHeight: 17,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  arabic: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ACCENT,
    opacity: 0.25,
  },
});
