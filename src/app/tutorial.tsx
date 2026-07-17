import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ONBOARDING_SLIDES } from '@/constants/onboarding-slides';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function TutorialScreen() {
  const [welcome, ...features] = ONBOARDING_SLIDES;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PageHeader title="How to use Amana" />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            {welcome.title.replace('\n', ' ')} — here&apos;s a quick look at what Amana can do for you.
          </ThemedText>

          {features.map((slide) => (
            <ThemedView key={slide.key} type="backgroundElement" style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: `${slide.iconColor}26` }]}>
                <SymbolView
                  name={{ ios: slide.icon, android: 'star', web: 'star' }}
                  tintColor={slide.iconColor}
                  size={26}
                />
              </View>
              <View style={styles.cardText}>
                <ThemedText type="smallBold">{slide.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {slide.description}
                </ThemedText>
              </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  scroll: {
    alignSelf: 'stretch',
    width: '100%',
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  intro: {
    marginBottom: Spacing.one,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
});
