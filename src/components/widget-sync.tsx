import { useEffect } from 'react';

import { useTomorrowFajr } from '@/hooks/use-tomorrow-fajr';
import { getDailyVerse } from '@/lib/daily-verse';
import { computePrayerTimes } from '@/lib/prayer-times';
import { computeDistanceToKaabaKm, computeQiblaBearing } from '@/lib/qibla';
import { buildAdhkarTimeline, buildNextPrayerTimeline, buildPrayerTimesTimeline, compassDirectionFromBearing } from '@/lib/widget-sync';
import { usePrayerTimes } from '@/providers/prayer-times-provider';
import { usePrayerTracker } from '@/providers/prayer-tracker-provider';
import AdhkarWidget from '@/widgets/AdhkarWidget';
import DailyVerseWidget from '@/widgets/DailyVerseWidget';
import NextPrayerWidget from '@/widgets/NextPrayerWidget';
import PrayerTimesWidget from '@/widgets/PrayerTimesWidget';
import QiblaWidget from '@/widgets/QiblaWidget';
import TrackerWidget from '@/widgets/TrackerWidget';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Pushes fresh timeline/snapshot data to every home screen widget whenever the underlying app state changes. */
export function WidgetSync() {
  const { times, coords, method } = usePrayerTimes();
  const { todayCompleted, streak } = usePrayerTracker();
  const tomorrowFajr = useTomorrowFajr(coords, method);

  useEffect(() => {
    if (!times || !coords || !tomorrowFajr) return;

    const tomorrow = new Date(Date.now() + ONE_DAY_MS);
    const dayAfter = new Date(Date.now() + 2 * ONE_DAY_MS);
    const tomorrowTimes = computePrayerTimes(coords.latitude, coords.longitude, method, tomorrow);
    const dayAfterFajr = computePrayerTimes(coords.latitude, coords.longitude, method, dayAfter).fajr;

    NextPrayerWidget.updateTimeline([
      ...buildNextPrayerTimeline(times, tomorrowTimes.fajr),
      ...buildNextPrayerTimeline(tomorrowTimes, dayAfterFajr),
    ]);

    PrayerTimesWidget.updateTimeline([...buildPrayerTimesTimeline(times), ...buildPrayerTimesTimeline(tomorrowTimes)]);

    AdhkarWidget.updateTimeline(
      buildAdhkarTimeline([
        { fajr: times.fajr, asr: times.asr },
        { fajr: tomorrowTimes.fajr, asr: tomorrowTimes.asr },
      ]),
    );

    const bearingDegrees = computeQiblaBearing(coords.latitude, coords.longitude);
    QiblaWidget.updateSnapshot({
      bearingDegrees,
      compassDirection: compassDirectionFromBearing(bearingDegrees),
      distanceKm: computeDistanceToKaabaKm(coords.latitude, coords.longitude),
    });
  }, [times, coords, method, tomorrowFajr]);

  useEffect(() => {
    TrackerWidget.updateSnapshot({ completedCount: todayCompleted.length, streak });
  }, [todayCompleted, streak]);

  useEffect(() => {
    getDailyVerse()
      .then((verse) =>
        DailyVerseWidget.updateSnapshot({
          arabic: verse.arabic,
          translation: verse.translation,
          reference: `Qur'an ${verse.verseKey}`,
        }),
      )
      .catch(() => {});
  }, []);

  return null;
}
