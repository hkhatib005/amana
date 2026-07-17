import { Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type NextPrayerWidgetProps = {
  prayerName: string;
  timeLabel: string;
  timestamp: number;
};

const NextPrayerWidget = (props: NextPrayerWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  // Widget functions are extracted and serialized in isolation from the rest of the module
  // (see the `'widget'` directive), so any module-scope reference — including imports and
  // same-file top-level consts — isn't available at render time; everything the function
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
  const countdown = (
    <Text
      timerInterval={{ lower: environment.date, upper: new Date(props.timestamp) }}
      countsDown
      modifiers={[font({ weight: 'medium', size: 13 }), foregroundStyle(WidgetColors.textMuted)]}
    />
  );

  if (environment.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground(WidgetColors.navy, 'widget')]}>
        <VStack
          alignment="center"
          spacing={1}
          modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity })]}>
          <Text
            timerInterval={{ lower: environment.date, upper: new Date(props.timestamp) }}
            countsDown
            modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle(WidgetColors.textLight)]}
          />
          <Text modifiers={[font({ weight: 'medium', size: 10 }), foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
            {props.prayerName}
          </Text>
        </VStack>
      </ZStack>
    );
  }

  return (
    <ZStack
      alignment="leading"
      modifiers={[containerBackground(WidgetColors.navy, 'widget')]}>
      <VStack
        alignment="leading"
        spacing={4}
        modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' }), padding({ all: 16 })]}>
        <Text modifiers={[font({ weight: 'semibold', size: 11 }), foregroundStyle(WidgetColors.orange)]}>
          NEXT PRAYER
        </Text>
        <Text modifiers={[font({ weight: 'bold', size: 26 }), foregroundStyle(WidgetColors.textLight)]}>
          {props.prayerName}
        </Text>
        <Text modifiers={[font({ weight: 'medium', size: 15 }), foregroundStyle(WidgetColors.textMuted)]}>
          {props.timeLabel}
        </Text>
        {countdown}
      </VStack>
    </ZStack>
  );
};

export default createWidget('NextPrayerWidget', NextPrayerWidget);
