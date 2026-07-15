import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="prayers">
        <NativeTabs.Trigger.Label>Prayers</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="clock.fill" md="schedule" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="qibla">
        <NativeTabs.Trigger.Label>Qibla</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="safari.fill" md="explore" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tracker">
        <NativeTabs.Trigger.Label>Tracker</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="flame.fill" md="local_fire_department" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ellipsis.circle.fill" md="more_horiz" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
