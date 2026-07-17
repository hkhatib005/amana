import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandGold, MaxContentWidth, Spacing } from '@/constants/theme';
import { ONBOARDING_SLIDES } from '@/constants/onboarding-slides';

export function WelcomeCarousel({ onDone }: { onDone: () => void }) {
  const [pageIndex, setPageIndex] = useState(0);
  const isLastSlide = pageIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.skipRow}>
          <Pressable onPress={onDone} hitSlop={8}>
            <ThemedText type="small" themeColor="textSecondary">
              Skip
            </ThemedText>
          </Pressable>
        </View>

        <PagerView
          style={styles.pager}
          initialPage={0}
          onPageSelected={(event) => setPageIndex(event.nativeEvent.position)}>
          {ONBOARDING_SLIDES.map((slide) => (
            <View key={slide.key} style={styles.slide}>
              <View style={[styles.iconCircle, { backgroundColor: `${slide.iconColor}26` }]}>
                <SymbolView
                  name={{ ios: slide.icon, android: 'star', web: 'star' }}
                  tintColor={slide.iconColor}
                  size={48}
                />
              </View>
              <ThemedText type="title" style={styles.title}>
                {slide.title}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.description}>
                {slide.description}
              </ThemedText>
            </View>
          ))}
        </PagerView>

        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {ONBOARDING_SLIDES.map((slide, index) => (
              <View
                key={slide.key}
                style={[
                  styles.dot,
                  index === pageIndex && [styles.dotActive, { backgroundColor: BrandGold }],
                ]}
              />
            ))}
          </View>

          {isLastSlide && (
            <Pressable onPress={onDone} style={styles.getStartedButton}>
              <ThemedText style={styles.getStartedText}>Get Started</ThemedText>
            </Pressable>
          )}
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
  },
  skipRow: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  pager: {
    flex: 1,
    alignSelf: 'stretch',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.five,
    gap: Spacing.four,
  },
  iconCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 32,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
  },
  footer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(128,128,128,0.35)',
  },
  dotActive: {
    width: 22,
  },
  getStartedButton: {
    alignSelf: 'stretch',
    backgroundColor: BrandGold,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
