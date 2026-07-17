import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrayerRing } from '@/components/prayer-ring';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { PrayerCalculationMethods } from '@/constants/prayer-methods';
import { usePlaceName } from '@/hooks/use-place-name';
import { useNextPrayer } from '@/hooks/use-next-prayer';
import { useTomorrowFajr } from '@/hooks/use-tomorrow-fajr';
import { useWeather } from '@/hooks/use-weather';
import { formatHijriDate } from '@/lib/hijri-date';
import { ReminderPrayer } from '@/lib/notifications';
import { computeTahajjudTime, currentAndNextPrayer, DailyPrayerTimes } from '@/lib/prayer-times';
import { weatherEmoji } from '@/lib/weather';
import { useNotificationPreferences } from '@/providers/notifications-provider';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const BG = '#EAF1F8';
const CARD = '#ffffff';
const CARD_MUTED = '#F1F5F9';
const TEXT_DARK = '#22314F';
const TEXT_MUTED = '#93A0B4';
const RING_NAVY = '#16264A';
const RING_ORANGE = '#F2A93B';

const PRAYER_INFO: { key: ReminderPrayer; label: string; emoji: string }[] = [
  { key: 'fajr', label: 'Fajr', emoji: '🌄' },
  { key: 'sunrise', label: 'Sunrise', emoji: '🌅' },
  { key: 'dhuhr', label: 'Dhuhr', emoji: '☀️' },
  { key: 'asr', label: 'Asr', emoji: '🌤️' },
  { key: 'maghrib', label: 'Maghrib', emoji: '🌇' },
  { key: 'isha', label: 'Isha', emoji: '🌙' },
  { key: 'tahajjud', label: 'Tahajjud', emoji: '🌌' },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCountdownClock(target: Date, now: Date) {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function timeFor(key: ReminderPrayer, times: DailyPrayerTimes, tahajjudTime: Date | null): Date | null {
  return key === 'tahajjud' ? tahajjudTime : times[key];
}

export default function PrayersScreen() {
  const { loading, permissionDenied, error, times, coords, method, madhab, retry } = usePrayerTimes();
  const { city, country } = usePlaceName(coords);
  const weather = useWeather(coords);
  const nextPrayer = useNextPrayer(times, coords, method, madhab, 1000);
  const tomorrowFajr = useTomorrowFajr(coords, method, madhab);
  const { prayerNotifications, setPrayerNotificationEnabled } = useNotificationPreferences();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { current } = times ? currentAndNextPrayer(times, now) : { current: null };
  const elevation = coords?.altitude != null ? `${Math.round(coords.altitude)} m` : '—';
  const tahajjudTime = times && tomorrowFajr ? computeTahajjudTime(times.maghrib, tomorrowFajr) : null;

  const showMethodInfo = () => {
    Alert.alert('Calculation method', PrayerCalculationMethods[method].label);
  };

  const shareTimes = () => {
    if (!times) return;
    const lines = PRAYER_INFO.map(({ key, label }) => {
      const time = timeFor(key, times, tahajjudTime);
      return time ? `${label}: ${formatTime(time)}` : null;
    })
      .filter(Boolean)
      .join('\n');
    Share.share({ message: `Today's prayer times:\n${lines}` });
  };

  return (
    <View style={[styles.container, { backgroundColor: BG }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Link href="/duas" asChild>
              <Pressable style={styles.pill}>
                <ThemedText style={styles.pillEmoji}>🤲</ThemedText>
              </Pressable>
            </Link>
            <View style={styles.pill}>
              <SymbolView
                name={{ ios: 'mountain.2.fill', android: 'terrain', web: 'terrain' }}
                tintColor={TEXT_DARK}
                size={16}
              />
              <ThemedText style={styles.pillText}>Elev {elevation}</ThemedText>
            </View>
          </View>

          {loading && (
            <ThemedText style={styles.stateMessage}>Finding your location…</ThemedText>
          )}

          {!loading && permissionDenied && (
            <View style={styles.messageCard}>
              <ThemedText style={styles.messageText}>
                Location access is needed to calculate prayer times for where you are.
              </ThemedText>
              <Pressable onPress={() => Linking.openSettings()}>
                <ThemedText style={styles.messageLink}>Open Settings</ThemedText>
              </Pressable>
            </View>
          )}

          {!loading && error && (
            <View style={styles.messageCard}>
              <ThemedText style={styles.messageText}>{error}</ThemedText>
              <Pressable onPress={retry}>
                <ThemedText style={styles.messageLink}>Try Again</ThemedText>
              </Pressable>
            </View>
          )}

          {nextPrayer && (
            <ThemedText style={styles.heading}>
              {nextPrayer.name} {formatTime(nextPrayer.time)}
            </ThemedText>
          )}

          <View style={styles.infoRow}>
            <View style={styles.pill}>
              <SymbolView
                name={{ ios: 'mappin.circle.fill', android: 'location_on', web: 'location_on' }}
                tintColor="#E0722C"
                size={16}
              />
              <ThemedText style={styles.pillText} numberOfLines={1}>
                {city ?? 'Locating…'}
                {country ? `, ${country}` : ''}
              </ThemedText>
            </View>
            {weather && (
              <View style={styles.pill}>
                <ThemedText style={styles.pillEmoji}>{weatherEmoji(weather.weatherCode)}</ThemedText>
                <ThemedText style={styles.pillText}>{Math.round(weather.temperatureCelsius)}°C</ThemedText>
              </View>
            )}
          </View>

          {nextPrayer && (
            <View style={styles.ringWrap}>
              <PrayerRing size={260} strokeWidth={14} trackColor={RING_NAVY} knobColor={RING_ORANGE}>
                <ThemedText style={styles.ringTitle}>{nextPrayer.name}</ThemedText>
                <ThemedText style={styles.ringSubtitle}>Next prayer in</ThemedText>
                <ThemedText style={styles.ringCountdown}>
                  {formatCountdownClock(nextPrayer.time, now)}
                </ThemedText>
              </PrayerRing>
            </View>
          )}

          <View style={styles.dateRow}>
            <View>
              <ThemedText style={styles.dateBold}>{formatLongDate(now)}</ThemedText>
              <ThemedText style={styles.dateHijri}>{formatHijriDate(now)}</ThemedText>
            </View>
            <View style={styles.dateButtons}>
              <Pressable style={styles.circleButton} onPress={showMethodInfo} hitSlop={4}>
                <SymbolView
                  name={{ ios: 'info', android: 'info', web: 'info' }}
                  tintColor={TEXT_DARK}
                  size={18}
                />
              </Pressable>
              <Pressable style={styles.circleButton} onPress={shareTimes} hitSlop={4}>
                <SymbolView
                  name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }}
                  tintColor={TEXT_DARK}
                  size={18}
                />
              </Pressable>
            </View>
          </View>

          {times && (
            <View style={styles.grid}>
              {PRAYER_INFO.map(({ key, label, emoji }) => {
                const time = timeFor(key, times, tahajjudTime);
                if (!time) return null;
                const isPast = time.getTime() < now.getTime();
                const isCurrent = key === current;
                const notifyEnabled = prayerNotifications[key];
                return (
                  <View
                    key={key}
                    style={[styles.card, !isPast && styles.cardActive, isCurrent && styles.cardCurrent]}>
                    <Pressable
                      onPress={() => setPrayerNotificationEnabled(key, !notifyEnabled)}
                      hitSlop={8}>
                      <SymbolView
                        name={{
                          ios: notifyEnabled ? 'bell.fill' : 'bell.slash.fill',
                          android: notifyEnabled ? 'notifications_active' : 'notifications_off',
                          web: notifyEnabled ? 'notifications_active' : 'notifications_off',
                        }}
                        tintColor={notifyEnabled ? RING_ORANGE : TEXT_MUTED}
                        size={16}
                      />
                    </Pressable>
                    <ThemedText style={styles.cardEmoji}>{emoji}</ThemedText>
                    <ThemedText style={[styles.cardLabel, !isPast && styles.cardLabelActive]}>
                      {label}
                    </ThemedText>
                    <ThemedText style={[styles.cardTime, !isPast && styles.cardLabelActive]}>
                      {formatTime(time)}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: CARD,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pillEmoji: {
    fontSize: 16,
  },
  pillText: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: '600',
  },
  stateMessage: {
    color: TEXT_MUTED,
  },
  messageCard: {
    backgroundColor: CARD,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  messageText: {
    color: TEXT_DARK,
  },
  messageLink: {
    color: '#3c87f7',
  },
  heading: {
    color: TEXT_DARK,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  ringWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  ringTitle: {
    color: TEXT_DARK,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
  },
  ringSubtitle: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginTop: Spacing.two,
  },
  ringCountdown: {
    color: TEXT_DARK,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateBold: {
    color: TEXT_DARK,
    fontSize: 18,
    fontWeight: '700',
  },
  dateHijri: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginTop: Spacing.half,
  },
  dateButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  card: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: CARD_MUTED,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  cardActive: {
    backgroundColor: CARD,
  },
  cardCurrent: {
    borderWidth: 1.5,
    borderColor: RING_ORANGE,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: '600',
  },
  cardLabelActive: {
    color: TEXT_DARK,
  },
  cardTime: {
    color: TEXT_MUTED,
    fontSize: 16,
    fontWeight: '700',
  },
});
