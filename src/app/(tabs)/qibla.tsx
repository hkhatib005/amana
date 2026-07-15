import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QiblaCompass } from '@/components/qibla-compass';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { UtilityColors } from '@/constants/utility-theme';
import { computeDistanceToKaabaKm, computeQiblaBearing } from '@/lib/qibla';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const COMPASS_SIZE = 300;

export default function QiblaScreen() {
  const { coords, permissionDenied, loading, retry } = usePrayerTimes();
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    Location.watchHeadingAsync((event) => {
      if (cancelled) return;
      setHeading(event.trueHeading >= 0 ? event.trueHeading : event.magHeading);
    }).then((sub) => {
      if (cancelled) {
        sub.remove();
      } else {
        subscription = sub;
      }
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  const qiblaBearing = coords ? computeQiblaBearing(coords.latitude, coords.longitude) : null;
  const distanceKm = coords ? computeDistanceToKaabaKm(coords.latitude, coords.longitude) : null;

  return (
    <View style={[styles.container, { backgroundColor: UtilityColors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText style={styles.title}>Qibla</ThemedText>

        {loading && <Text style={styles.stateMessage}>Finding your location…</Text>}

        {!loading && permissionDenied && (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              Location access is needed to find the Qibla direction from where you are.
            </Text>
            <Pressable onPress={() => Linking.openSettings()}>
              <Text style={styles.messageLink}>Open Settings</Text>
            </Pressable>
          </View>
        )}

        {!loading && !permissionDenied && qiblaBearing != null && (
          <>
            <View style={styles.compassWrap}>
              <QiblaCompass size={COMPASS_SIZE} qiblaBearing={qiblaBearing} heading={heading} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statValue}>{Math.round(qiblaBearing)}°</Text>
                <Text style={styles.statLabel}>from North</Text>
              </View>
              {distanceKm != null && (
                <View style={styles.statChip}>
                  <Text style={styles.statValue}>{Math.round(distanceKm).toLocaleString()} km</Text>
                  <Text style={styles.statLabel}>to the Kaaba</Text>
                </View>
              )}
            </View>

            <Text style={styles.instructions}>
              Hold your phone flat and turn until the 🕋 needle points straight up, toward the
              badge at the top of the dial.
            </Text>

            {heading == null && (
              <View style={styles.messageCard}>
                <Text style={styles.messageTextMuted}>
                  Compass heading isn&apos;t available on the Simulator, so the needle is shown
                  relative to North. This will track your device&apos;s heading live on your
                  iPhone.
                </Text>
              </View>
            )}
          </>
        )}

        {!loading && !permissionDenied && qiblaBearing == null && (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>Couldn&apos;t determine your location.</Text>
            <Pressable onPress={retry}>
              <Text style={styles.messageLink}>Try Again</Text>
            </Pressable>
          </View>
        )}
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
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    alignSelf: 'flex-start',
    color: UtilityColors.textDark,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    paddingTop: Spacing.three,
  },
  stateMessage: {
    color: UtilityColors.textMuted,
  },
  messageCard: {
    alignSelf: 'stretch',
    backgroundColor: UtilityColors.card,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  messageText: {
    color: UtilityColors.textDark,
    fontSize: 16,
  },
  messageTextMuted: {
    color: UtilityColors.textMuted,
    fontSize: 14,
  },
  messageLink: {
    color: '#3c87f7',
    fontSize: 14,
    fontWeight: '600',
  },
  compassWrap: {
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: UtilityColors.card,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.half,
  },
  statValue: {
    color: UtilityColors.textDark,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: UtilityColors.textMuted,
    fontSize: 13,
  },
  instructions: {
    textAlign: 'center',
    color: '#3c87f7',
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: Spacing.three,
  },
});
