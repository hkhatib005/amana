import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { DUAS } from '@/constants/duas';

const CATEGORIES = [...new Set(DUAS.map((dua) => dua.category))];

export default function DuasScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>
            Duas
          </ThemedText>

          {CATEGORIES.map((category) => (
            <ThemedView key={category} style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {category}
              </ThemedText>

              {DUAS.filter((dua) => dua.category === category).map((dua) => (
                <ThemedView key={dua.title} type="backgroundElement" style={styles.card}>
                  <ThemedText type="smallBold">{dua.title}</ThemedText>
                  <ThemedText style={styles.arabic}>{dua.arabic}</ThemedText>
                  <ThemedText type="small">{dua.translation}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
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
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  title: {
    alignSelf: 'flex-start',
    paddingTop: Spacing.three,
  },
  section: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
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
});
