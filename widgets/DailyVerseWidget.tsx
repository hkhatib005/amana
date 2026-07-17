import { Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, multilineTextAlignment, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import { WidgetColors } from './widget-theme';

export type DailyVerseWidgetProps = {
  arabic: string;
  translation: string;
  reference: string;
};

const DailyVerseWidget = (props: DailyVerseWidgetProps, _environment: WidgetEnvironment) => {
  'widget';
  return (
    <ZStack modifiers={[containerBackground(WidgetColors.navyDeep, 'widget')]}>
      <VStack
        alignment="trailing"
        spacing={8}
        modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'trailing' }), padding({ all: 16 })]}>
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
        <Text modifiers={[font({ weight: 'semibold', size: 11 }), foregroundStyle(WidgetColors.gold)]}>
          {props.reference}
        </Text>
      </VStack>
    </ZStack>
  );
};

export default createWidget('DailyVerseWidget', DailyVerseWidget);
