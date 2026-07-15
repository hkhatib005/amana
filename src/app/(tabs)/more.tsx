import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SFSymbol } from 'sf-symbols-typescript';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const TILES: {
  href: '/duas' | '/qibla' | '/islamic-days' | '/masjid' | '/settings' | '/quran';
  label: string;
  sf: SFSymbol;
}[] = [
  { href: '/quran', label: "Qur'an", sf: 'book.closed.fill' },
  { href: '/duas', label: 'Duas', sf: 'hands.sparkles.fill' },
  { href: '/qibla', label: 'Qibla', sf: 'safari.fill' },
  { href: '/islamic-days', label: 'Islamic Days', sf: 'moon.stars.fill' },
  { href: '/masjid', label: 'Nearby Masjid', sf: 'mappin.and.ellipse' },
  { href: '/settings', label: 'Settings', sf: 'gearshape.fill' },
];

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/hero-maghrib.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={3}
      />
      <View style={styles.scrim} />

      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          More
        </ThemedText>

        <View style={styles.grid}>
          {TILES.map((tile) => (
            <Link key={tile.href} href={tile.href} asChild>
              <Pressable style={styles.tile}>
                <ThemedView type="backgroundElement" style={styles.tileIcon}>
                  <SymbolView name={tile.sf} size={28} />
                </ThemedView>
                <ThemedText type="small" style={styles.tileLabel}>
                  {tile.label}
                </ThemedText>
              </Pressable>
            </Link>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset,
  },
  title: {
    alignSelf: 'flex-start',
    color: '#ffffff',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    justifyContent: 'space-around',
    rowGap: Spacing.five,
  },
  tile: {
    alignItems: 'center',
    gap: Spacing.two,
    width: 96,
  },
  tileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    color: '#ffffff',
    textAlign: 'center',
  },
});
