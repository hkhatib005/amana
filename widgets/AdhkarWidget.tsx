import { Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, multilineTextAlignment, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type AdhkarWidgetProps = {
  isMorning: boolean;
  arabic: string;
  translation: string;
};

const AdhkarWidget = (props: AdhkarWidgetProps, _environment: WidgetEnvironment) => {
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
    <ZStack modifiers={[containerBackground(WidgetColors.navyDeep, 'widget')]}>
      <VStack
        alignment="trailing"
        spacing={8}
        modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'trailing' }), padding({ all: 16 })]}>
        <Text modifiers={[font({ weight: 'semibold', size: 11 }), foregroundStyle(WidgetColors.gold)]}>
          {props.isMorning ? 'MORNING ADHKAR' : 'EVENING ADHKAR'}
        </Text>
        <Text
          modifiers={[
            font({ weight: 'semibold', size: 18 }),
            foregroundStyle(WidgetColors.textLight),
            multilineTextAlignment('trailing'),
            lineLimit(2),
          ]}>
          {props.arabic}
        </Text>
        <Text
          modifiers={[
            font({ weight: 'regular', size: 13 }),
            foregroundStyle(WidgetColors.textMuted),
            multilineTextAlignment('trailing'),
            lineLimit(2),
          ]}>
          {props.translation}
        </Text>
      </VStack>
    </ZStack>
  );
};

export default createWidget('AdhkarWidget', AdhkarWidget);
