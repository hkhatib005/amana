import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdhkarTasbihRow } from '@/components/adhkar-tasbih-row';
import { SealBadge } from '@/components/seal-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VerseTrackerDiagonal } from '@/components/verse-tracker-diagonal';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCityName } from '@/hooks/use-place-name';
import { useNextPrayer } from '@/hooks/use-next-prayer';
import { formatHijriDate } from '@/lib/hijri-date';
import { currentAndNextPrayer, DailyPrayerTimes } from '@/lib/prayer-times';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const HERO_IMAGES = {
  fajr: require('@/assets/images/hero-fajr.jpg'),
  dhuhr: require('@/assets/images/hero-dhuhr.jpg'),
  asr: require('@/assets/images/hero-asr.jpg'),
  maghrib: require('@/assets/images/hero-maghrib.jpg'),
  isha: require('@/assets/images/hero-isha.jpg'),
};

function heroImageFor(times: DailyPrayerTimes | null, now: Date) {
  if (!times) return HERO_IMAGES.dhuhr;
  const { current } = currentAndNextPrayer(times, now);
  if (current === null || current === 'isha') return HERO_IMAGES.isha;
  if (current === 'sunrise') return HERO_IMAGES.fajr;
  return HERO_IMAGES[current];
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatCountdown(target: Date, now: Date) {
  const totalMinutes = Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours === 0 ? `${minutes} min` : `${hours} hr ${minutes} min`;
}

export default function TodayScreen() {
  const { loading, permissionDenied, error, times, coords, method, retry } = usePrayerTimes();
  const city = useCityName(coords);
  const nextPrayer = useNextPrayer(times, coords, method);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 180], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 180], [0, -50], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [0, 180], [1, 0.92], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }, { scale }] };
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.body}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.hero, heroAnimatedStyle]}>
            <Image
              source={heroImageFor(times, new Date())}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={400}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)']}
              style={StyleSheet.absoluteFill}
            />

            <SafeAreaView edges={['top']} style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <View>
                  <ThemedText type="subtitle" style={styles.heroCity}>
                    {city ?? 'Locating…'}
                  </ThemedText>
                  <ThemedText type="small" style={styles.heroDate}>
                    {formatHijriDate()}
                  </ThemedText>
                </View>

                <View style={styles.iconRow}>
                  <Link href="/prayers" asChild>
                    <Pressable style={styles.iconButton}>
                      <SymbolView
                        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                        tintColor="#ffffff"
                        size={18}
                      />
                    </Pressable>
                  </Link>
                  <Pressable onPress={retry} style={styles.iconButton} hitSlop={4}>
                    <SymbolView
                      name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
                      tintColor="#ffffff"
                      size={18}
                    />
                  </Pressable>
                  <Pressable onPress={retry} style={styles.iconButton} hitSlop={4}>
                    <SymbolView
                      name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
                      tintColor="#ffffff"
                      size={18}
                    />
                  </Pressable>
                </View>
              </View>

              {nextPrayer && (
                <View style={styles.heroMiddleRow}>
                  <SealBadge size={150}>
                    <ThemedText style={styles.countdownLabel}>{nextPrayer.name}</ThemedText>
                    <ThemedText style={styles.countdownTime}>{formatTime(nextPrayer.time)}</ThemedText>
                    <Link href="/prayers" asChild>
                      <Pressable>
                        <ThemedText style={styles.countdownLink}>All Timings →</ThemedText>
                      </Pressable>
                    </Link>
                  </SealBadge>
                </View>
              )}

              {nextPrayer && (
                <View style={styles.countdownRow}>
                  <ThemedText style={styles.countdownRemaining}>
                    {formatCountdown(nextPrayer.time, new Date())}
                  </ThemedText>
                  <ThemedText style={styles.countdownRemainingLabel}>till {nextPrayer.name}</ThemedText>
                </View>
              )}
            </SafeAreaView>
          </Animated.View>

          <View style={styles.contentBody}>
            {loading && (
              <ThemedText type="small" style={styles.stateMessage}>
                Finding your location…
              </ThemedText>
            )}

            {!loading && permissionDenied && (
              <ThemedView type="backgroundElement" style={styles.messageCard}>
                <ThemedText>
                  Location access is needed to calculate prayer times for where you are.
                </ThemedText>
                <Pressable onPress={() => Linking.openSettings()}>
                  <ThemedText type="linkPrimary">Open Settings</ThemedText>
                </Pressable>
              </ThemedView>
            )}

            {!loading && error && (
              <ThemedView type="backgroundElement" style={styles.messageCard}>
                <ThemedText>{error}</ThemedText>
                <Pressable onPress={retry}>
                  <ThemedText type="linkPrimary">Try Again</ThemedText>
                </Pressable>
              </ThemedView>
            )}

            <VerseTrackerDiagonal />
            <AdhkarTasbihRow />

            <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
              Made by a fellow servant of Allah.{'\n'}Don&apos;t forget to smile — it&apos;s sunnah!
            </ThemedText>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 380,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.two,
  },
  heroCity: {
    color: '#ffffff',
  },
  heroDate: {
    color: 'rgba(255,255,255,0.8)',
  },
  iconRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMiddleRow: {
    alignItems: 'flex-start',
  },
  countdownLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  countdownTime: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  countdownLink: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  countdownRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  countdownRemaining: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  countdownRemainingLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.four,
  },
  contentBody: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  stateMessage: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
  },
  messageCard: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  footer: {
    textAlign: 'center',
    paddingTop: Spacing.two,
  },
});
