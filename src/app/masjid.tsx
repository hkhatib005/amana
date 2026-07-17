import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getNearbyMasjids, NearbyMasjid, openDirectionsToMasjid } from '@/lib/masjid';
import { usePrayerTimes } from '@/providers/prayer-times-provider';

export default function MasjidScreen() {
  const { coords, loading: locationLoading, permissionDenied, retry } = usePrayerTimes();
  const [masjids, setMasjids] = useState<NearbyMasjid[] | null>(null);
  const [masjidsLoading, setMasjidsLoading] = useState(false);
  const [masjidsError, setMasjidsError] = useState<string | null>(null);

  const loadMasjids = useCallback((latitude: number, longitude: number) => {
    setMasjidsLoading(true);
    setMasjidsError(null);
    getNearbyMasjids(latitude, longitude)
      .then(setMasjids)
      .catch(() => setMasjidsError("Couldn't load nearby mosques. Check your connection and try again."))
      .finally(() => setMasjidsLoading(false));
  }, []);

  useEffect(() => {
    if (coords) {
      loadMasjids(coords.latitude, coords.longitude);
    }
  }, [coords, loadMasjids]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerArea}>
          <PageHeader title="Nearby Masjid" />
        </View>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {locationLoading && (
            <ThemedText themeColor="textSecondary">Finding your location…</ThemedText>
          )}

          {!locationLoading && permissionDenied && (
            <ThemedView type="backgroundElement" style={styles.messageCard}>
              <ThemedText type="small">
                Location access is needed to find mosques near you.
              </ThemedText>
              <Pressable onPress={() => Linking.openSettings()}>
                <ThemedText type="linkPrimary">Open Settings</ThemedText>
              </Pressable>
            </ThemedView>
          )}

          {!locationLoading && !permissionDenied && !coords && (
            <ThemedView type="backgroundElement" style={styles.messageCard}>
              <ThemedText type="small">Couldn&apos;t determine your location.</ThemedText>
              <Pressable onPress={retry}>
                <ThemedText type="linkPrimary">Try Again</ThemedText>
              </Pressable>
            </ThemedView>
          )}

          {coords && masjidsLoading && (
            <ThemedText themeColor="textSecondary">Finding mosques near you…</ThemedText>
          )}

          {coords && !masjidsLoading && masjidsError && (
            <ThemedView type="backgroundElement" style={styles.messageCard}>
              <ThemedText type="small">{masjidsError}</ThemedText>
              <Pressable onPress={() => loadMasjids(coords.latitude, coords.longitude)}>
                <ThemedText type="linkPrimary">Try Again</ThemedText>
              </Pressable>
            </ThemedView>
          )}

          {coords && !masjidsLoading && !masjidsError && masjids?.length === 0 && (
            <ThemedText themeColor="textSecondary">No mosques found nearby.</ThemedText>
          )}

          {coords &&
            !masjidsLoading &&
            !masjidsError &&
            masjids?.map((masjid) => (
              <ThemedView key={masjid.id} type="backgroundElement" style={styles.card}>
                <View style={styles.cardHeader}>
                  <SymbolView
                    name={{ ios: 'mappin.circle.fill', android: 'location_on', web: 'location_on' }}
                    size={20}
                  />
                  <View style={styles.cardHeaderText}>
                    <ThemedText type="smallBold" numberOfLines={2}>
                      {masjid.name}
                    </ThemedText>
                    {masjid.address && (
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                        {masjid.address}
                      </ThemedText>
                    )}
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatDistance(masjid.distanceKm)}
                  </ThemedText>
                  <Pressable
                    style={styles.directionsButton}
                    onPress={() => openDirectionsToMasjid(masjid)}>
                    <SymbolView
                      name={{
                        ios: 'arrow.triangle.turn.up.right.diamond.fill',
                        android: 'directions',
                        web: 'directions',
                      }}
                      size={16}
                    />
                    <ThemedText type="smallBold">Directions</ThemedText>
                  </Pressable>
                </View>
              </ThemedView>
            ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
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
  mainScroll: {
    flex: 1,
    alignSelf: 'stretch',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  messageCard: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  card: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cardHeaderText: {
    flex: 1,
    gap: Spacing.half,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
