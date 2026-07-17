import { Gauge, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, gaugeStyle, padding, tint } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type TrackerWidgetProps = {
  completedCount: number;
  streak: number;
};

const TrackerWidget = (props: TrackerWidgetProps, _environment: WidgetEnvironment) => {
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
  return (
    <ZStack modifiers={[containerBackground(WidgetColors.navy, 'widget')]}>
      <VStack
        alignment="center"
        spacing={8}
        modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity }), padding({ all: 16 })]}>
        <Gauge
          value={props.completedCount}
          min={0}
          max={5}
          currentValueLabel={
            <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(WidgetColors.textLight)]}>
              {props.completedCount}/5
            </Text>
          }
          modifiers={[gaugeStyle('circularCapacity'), tint(WidgetColors.orange), frame({ width: 52, height: 52 })]}
        />
        <Text modifiers={[font({ weight: 'semibold', size: 12 }), foregroundStyle(WidgetColors.textMuted)]}>
          {props.streak} day streak
        </Text>
      </VStack>
    </ZStack>
  );
};

export default createWidget('TrackerWidget', TrackerWidget);
