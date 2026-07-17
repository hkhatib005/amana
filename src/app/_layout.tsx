import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { WidgetSync } from '@/components/widget-sync';
import { configureNotificationHandler } from '@/lib/notifications';
import { getHasCompletedOnboarding } from '@/lib/onboarding';
import { NotificationsProvider } from '@/providers/notifications-provider';
import { PrayerTrackerProvider } from '@/providers/prayer-tracker-provider';
import { PrayerTimesProvider } from '@/providers/prayer-times-provider';
import { TabBarVisibilityProvider } from '@/providers/tab-bar-visibility-provider';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    getHasCompletedOnboarding().then(setOnboardingComplete);
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <PrayerTimesProvider>
        <NotificationsProvider>
          <PrayerTrackerProvider>
            <WidgetSync />
            <TabBarVisibilityProvider>
              {onboardingComplete === false ? (
                <OnboardingScreen onDone={() => setOnboardingComplete(true)} />
              ) : (
                onboardingComplete === true && (
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                  </Stack>
                )
              )}
            </TabBarVisibilityProvider>
          </PrayerTrackerProvider>
        </NotificationsProvider>
      </PrayerTimesProvider>
    </ThemeProvider>
  );
}
