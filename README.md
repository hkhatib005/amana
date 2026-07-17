# Amana

A calm, all-in-one companion for daily Muslim prayer and Qur'an reading — built with [Expo](https://expo.dev) and React Native.

## Features

- **Prayer times & Athan** — accurate, location-based prayer times with a region-aware calculation method default and a configurable Asr juristic method (Shafi/Hanafi)
- **Qibla compass** — points to the exact direction of the Kaaba from wherever you are
- **Qur'an reader** — full Mushaf pages via the Quran Foundation API, with recitation playback, bookmarks, notes, and translations
- **Duas** — a library of daily duas
- **Prayer tracker** — mark off each prayer and build a streak
- **Reminders** — customizable local notifications for prayers, adhkar (morning/evening remembrance), and Friday sunnahs
- **iOS widgets** — Next Prayer, Prayer Times, Qibla, Daily Verse, Adhkar, and Tracker widgets for the Home Screen
- **Masjid finder** — locate nearby mosques
- **Islamic calendar** — Hijri date conversion and key Islamic days
- **First-launch onboarding** — a short welcome carousel plus a replayable "How to use Amana" tutorial in Settings

## Tech stack

- [Expo](https://docs.expo.dev/versions/v57.0.0/) (SDK 57) + [expo-router](https://docs.expo.dev/router/introduction/) for file-based routing
- TypeScript, React Native 0.86, React 19
- [`adhan`](https://github.com/batoulapps/adhan-js) for prayer time calculation
- [`@umalqura/core`](https://www.npmjs.com/package/@umalqura/core) for Hijri date conversion
- [`@quranjs/api`](https://www.npmjs.com/package/@quranjs/api) against the [Quran Foundation API](https://api-docs.quran.foundation/) for Qur'an content
- `expo-widgets` for native iOS Home Screen widgets
- `expo-notifications` for local prayer/adhkar/reminder scheduling

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add Quran Foundation API credentials in a `.env.local` file at the project root:

   ```bash
   EXPO_PUBLIC_QURAN_CLIENT_ID=your-client-id
   EXPO_PUBLIC_QURAN_CLIENT_SECRET=your-client-secret
   EXPO_PUBLIC_QURAN_OAUTH_ENDPOINT=https://oauth2.quran.foundation
   EXPO_PUBLIC_QURAN_GATEWAY=https://apis.quran.foundation
   ```

3. Run a development build (this project uses native modules, so it won't run in Expo Go):

   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```

## Project structure

- `src/app` — screens and routes (expo-router file-based routing)
- `src/components` — shared UI components
- `src/providers` — React context providers (prayer times, notifications, prayer tracker, etc.)
- `src/lib` — core logic (prayer time calculation, notification scheduling, Quran API client, etc.)
- `src/constants` — static data and theme constants
- `widgets/` — iOS Home Screen widget components (`expo-widgets`)

## License

See [LICENSE](./LICENSE).
