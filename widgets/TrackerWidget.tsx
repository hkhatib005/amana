import { Gauge, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, gaugeStyle, padding, tint } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import { WidgetColors } from './widget-theme';

export type TrackerWidgetProps = {
  completedCount: number;
  streak: number;
};

const TrackerWidget = (props: TrackerWidgetProps, _environment: WidgetEnvironment) => {
  'widget';
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
