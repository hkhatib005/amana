import { StyleSheet, View } from 'react-native';

import { AdhkarCard } from '@/components/adhkar-card';
import { TasbihCounter } from '@/components/tasbih-counter';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const GOLD = '#D4A017';

export function AdhkarTasbihRow() {
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? 'rgba(0,122,255,0.16)' : 'rgba(0,122,255,0.08)';

  return (
    <View style={[styles.row, { backgroundColor: tint }]}>
      <AdhkarCard />
      <View style={[styles.divider, { backgroundColor: GOLD }]} />
      <TasbihCounter />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  divider: {
    width: 1.5,
    opacity: 0.5,
  },
});
