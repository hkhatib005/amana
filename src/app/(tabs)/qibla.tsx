import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { computeQiblaBearing } from '@/lib/qibla';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

const COMPASS_SIZE = 260;

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
  const arrowRotation = qiblaBearing != null ? qiblaBearing - (heading ?? 0) : 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Qibla
        </ThemedText>

        {loading && <ThemedText type="small">Finding your location…</ThemedText>}

        {!loading && permissionDenied && (
          <ThemedView type="backgroundElement" style={styles.messageCard}>
            <ThemedText>
              Location access is needed to find the Qibla direction from where you are.
            </ThemedText>
            <Pressable onPress={() => Linking.openSettings()}>
              <ThemedText type="linkPrimary">Open Settings</ThemedText>
            </Pressable>
          </ThemedView>
        )}

        {!loading && !permissionDenied && qiblaBearing != null && (
          <>
            <View style={styles.compassWrapper}>
              <ThemedView type="backgroundElement" style={styles.compassRing}>
                <ThemedText style={[styles.ringLabel, styles.ringLabelTop]}>N</ThemedText>
                <ThemedText style={[styles.ringLabel, styles.ringLabelRight]}>E</ThemedText>
                <ThemedText style={[styles.ringLabel, styles.ringLabelBottom]}>S</ThemedText>
                <ThemedText style={[styles.ringLabel, styles.ringLabelLeft]}>W</ThemedText>

                <View style={[styles.arrow, { transform: [{ rotate: `${arrowRotation}deg` }] }]}>
                  <SymbolView
                    name={{ ios: 'location.north.fill', android: 'navigation', web: 'navigation' }}
                    tintColor="#2E7D32"
                    size={64}
                  />
                </View>
              </ThemedView>
            </View>

            <ThemedText type="smallBold">{Math.round(qiblaBearing)}° from North</ThemedText>

            {heading == null && (
              <ThemedView type="backgroundElement" style={styles.messageCard}>
                <ThemedText type="small" themeColor="textSecondary">
                  Compass heading isn&apos;t available on the Simulator, so the arrow is shown
                  relative to North. This will track your device&apos;s heading live on your
                  iPhone.
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}

        {!loading && !permissionDenied && qiblaBearing == null && (
          <ThemedView type="backgroundElement" style={styles.messageCard}>
            <ThemedText>Couldn&apos;t determine your location.</ThemedText>
            <Pressable onPress={retry}>
              <ThemedText type="linkPrimary">Try Again</ThemedText>
            </Pressable>
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    alignSelf: 'flex-start',
    paddingTop: Spacing.three,
  },
  messageCard: {
    alignSelf: 'stretch',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  compassWrapper: {
    paddingVertical: Spacing.five,
  },
  compassRing: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    position: 'absolute',
    fontWeight: '700',
  },
  ringLabelTop: {
    top: Spacing.three,
  },
  ringLabelBottom: {
    bottom: Spacing.three,
  },
  ringLabelLeft: {
    left: Spacing.three,
  },
  ringLabelRight: {
    right: Spacing.three,
  },
  arrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
