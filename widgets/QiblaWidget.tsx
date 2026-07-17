import { Image, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, padding, rotationEffect } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import { WidgetColors } from './widget-theme';

export type QiblaWidgetProps = {
  bearingDegrees: number;
  compassDirection: string;
  distanceKm: number;
};

const QiblaWidget = (props: QiblaWidgetProps, _environment: WidgetEnvironment) => {
  'widget';
  return (
    <ZStack modifiers={[containerBackground(WidgetColors.navy, 'widget')]}>
      <VStack
        alignment="center"
        spacing={6}
        modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity }), padding({ all: 16 })]}>
        <Text modifiers={[font({ weight: 'semibold', size: 11 }), foregroundStyle(WidgetColors.orange)]}>
          QIBLA
        </Text>
        <Image
          systemName="location.north.fill"
          size={32}
          color={WidgetColors.textLight}
          modifiers={[rotationEffect(props.bearingDegrees)]}
        />
        <Text modifiers={[font({ weight: 'bold', size: 20 }), foregroundStyle(WidgetColors.textLight)]}>
          {Math.round(props.bearingDegrees)}° {props.compassDirection}
        </Text>
        <Text modifiers={[font({ weight: 'medium', size: 12 }), foregroundStyle(WidgetColors.textMuted)]}>
          {Math.round(props.distanceKm).toLocaleString()} km to the Kaaba
        </Text>
      </VStack>
    </ZStack>
  );
};

export default createWidget('QiblaWidget', QiblaWidget);
