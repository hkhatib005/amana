import { Link } from 'expo-router';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdhkarTasbihRow } from '@/components/adhkar-tasbih-row';
import { DailyVerseCard } from '@/components/daily-verse-card';
import { SealBadge } from '@/components/seal-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatHijriDate } from '@/lib/hijri-date';
import { computePrayerTimes, currentAndNextPrayer, DailyPrayerTimes } from '@/lib/prayer-times';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const PRAYER_NAME: Record<keyof DailyPrayerTimes, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

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

function useNextPrayer(
  times: DailyPrayerTimes | null,
  coords: { latitude: number; longitude: number } | null,
  method: Parameters<typeof computePrayerTimes>[2] | undefined,
) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!times) return null;
    const { next } = currentAndNextPrayer(times, now);
    if (next) {
      return { name: PRAYER_NAME[next], time: times[next] };
    }
    if (!coords || !method) return null;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = computePrayerTimes(coords.latitude, coords.longitude, method, tomorrow);
    return { name: 'Fajr', time: tomorrowTimes.fajr };
  }, [times, coords, method, now]);
}

export default function TodayScreen() {
  const { loading, permissionDenied, error, times, coords, method, retry } = usePrayerTimes();
  const [city, setCity] = useState<string | null>(null);
  const nextPrayer = useNextPrayer(times, coords, method);

  useEffect(() => {
    if (!coords) return;
    Location.reverseGeocodeAsync(coords)
      .then(([place]) => setCity(place?.city ?? place?.subregion ?? null))
      .catch(() => {});
  }, [coords]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.hero}>
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
              <SealBadge size={180}>
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
      </View>

      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.body}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
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

          <DailyVerseCard />
          <AdhkarTasbihRow />

          <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
            Made by a fellow servant of Allah.{'\n'}Don&apos;t forget to smile — it&apos;s sunnah!
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 420,
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
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
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
