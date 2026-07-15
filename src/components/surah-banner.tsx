import { useFonts } from 'expo-font';
import { StyleSheet, Text, View } from 'react-native';

const GOLD = '#C9A227';
const QURAN_FONT_FAMILY = 'AmiriQuran';

export function SurahBanner({ nameArabic }: { nameArabic: string }) {
  const [fontsLoaded] = useFonts({ [QURAN_FONT_FAMILY]: require('@/assets/fonts/AmiriQuran.ttf') });

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        <Text style={styles.ornament}>❖</Text>
        <Text style={[styles.title, fontsLoaded && { fontFamily: QURAN_FONT_FAMILY }]}>
          سُورَةُ {nameArabic}
        </Text>
        <Text style={styles.ornament}>❖</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: GOLD,
    borderRadius: 6,
    padding: 3,
    marginBottom: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  ornament: {
    color: GOLD,
    fontSize: 14,
  },
  title: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
});
