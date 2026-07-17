import { HStack, Image, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { SFSymbol } from 'sf-symbols-typescript';

import { WidgetColors } from './widget-theme';

export type PrayerTimesWidgetPrayer = {
  key: string;
  label: string;
  timeLabel: string;
  isCurrent: boolean;
};

export type PrayerTimesWidgetProps = {
  prayers: PrayerTimesWidgetPrayer[];
};

const PRAYER_ICONS: Record<string, SFSymbol> = {
  fajr: 'sunrise.fill',
  dhuhr: 'sun.max.fill',
  asr: 'cloud.sun.fill',
  maghrib: 'sunset.fill',
  isha: 'moon.stars.fill',
};

const PrayerTimesWidget = (props: PrayerTimesWidgetProps, _environment: WidgetEnvironment) => {
  'widget';
  return (
    <ZStack modifiers={[containerBackground(WidgetColors.navy, 'widget')]}>
      <HStack
        spacing={0}
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
