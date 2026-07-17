import { Image, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, padding, rotationEffect } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type QiblaWidgetProps = {
  bearingDegrees: number;
  compassDirection: string;
  distanceKm: number;
};

const QiblaWidget = (props: QiblaWidgetProps, _environment: WidgetEnvironment) => {
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
