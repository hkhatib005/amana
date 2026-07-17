import { HStack, Image, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { SFSymbol } from 'sf-symbols-typescript';

export type PrayerTimesWidgetPrayer = {
  key: string;
  label: string;
  timeLabel: string;
  isCurrent: boolean;
};

export type PrayerTimesWidgetProps = {
  prayers: PrayerTimesWidgetPrayer[];
};

const PrayerTimesWidget = (props: PrayerTimesWidgetProps, _environment: WidgetEnvironment) => {
  'widget';
  // Widget functions are extracted and serialized in isolation from the rest of the module
  // (see the `'widget'` directive), so any reference to a module-scope constant — even one
  // declared in this same file — isn't available at render time; everything the function
  // body touches must be declared locally inside the function itself.
  const WidgetColors = {
    navy: '#16264A',
    navyDeep: '#0E1B33',
    gold: '#C9A227',
    goldDeep: '#8A6F1B',
    orange: '#F2A93B',
    textLight: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.65)',
  } as const;
  const PRAYER_ICONS: Record<string, SFSymbol> = {
    fajr: 'sunrise.fill',
    dhuhr: 'sun.max.fill',
    asr: 'cloud.sun.fill',
    maghrib: 'sunset.fill',
    isha: 'moon.stars.fill',
  };
  return (
    <ZStack modifiers={[containerBackground(WidgetColors.navy, 'widget')]}>
      <HStack
        spacing={10}
        modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity }), padding({ all: 16 })]}>
        {props.prayers.map((prayer) => (
          <VStack
            key={prayer.key}
            spacing={6}
            modifiers={[frame({ maxWidth: Infinity })]}>
            <Text
              modifiers={[
                font({ weight: 'semibold', size: 11 }),
                foregroundStyle(prayer.isCurrent ? WidgetColors.orange : WidgetColors.textMuted),
                lineLimit(1),
                minimumScaleFactor(0.75),
              ]}>
              {prayer.label.toUpperCase()}
            </Text>
            <Image
              systemName={PRAYER_ICONS[prayer.key] ?? 'sun.max.fill'}
              size={16}
              color={prayer.isCurrent ? WidgetColors.orange : WidgetColors.textLight}
            />
            <Text
              modifiers={[
                font({ weight: prayer.isCurrent ? 'bold' : 'medium', size: 14 }),
                foregroundStyle(WidgetColors.textLight),
                lineLimit(1),
                minimumScaleFactor(0.75),
              ]}>
              {prayer.timeLabel}
            </Text>
          </VStack>
        ))}
      </HStack>
    </ZStack>
  );
};

export default createWidget('PrayerTimesWidget', PrayerTimesWidget);
