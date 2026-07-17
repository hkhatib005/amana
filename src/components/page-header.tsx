import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function PageHeader({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          size={22}
        />
      </Pressable>
      <ThemedText type="title" style={styles.title} numberOfLines={2}>
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    paddingTop: Spacing.three,
    gap: Spacing.one,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: Spacing.one,
    marginLeft: -Spacing.one,
  },
  title: {
    alignSelf: 'flex-start',
  },
});
