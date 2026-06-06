# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important

Always read the exact versioned Expo docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code. Expo APIs change between versions.

## Commands

```bash
# Start dev server (choose platform interactively)
npm start

# Start targeting a specific platform
npm run android   # opens in Android emulator/device via Expo Go
npm run ios       # opens in iOS simulator via Expo Go
npm run web       # opens in browser

# Build a distributable APK (via EAS Build — requires EAS login)
eas build --profile preview --platform android
```

There is no test runner configured in this project.

## Architecture

VoiceStamp is an Expo SDK 56 / React Native 0.85 app. Users take a photo, add a title and memo (optionally via Korean speech recognition), and save the result as a "stamp." Stamps are listed in a second screen.

### Navigation

Navigation is handled with a single `useState<'camera' | 'list'>` in `MainScreen` — there is no React Navigation or router. `MainScreen` renders either `CameraScreen` or `StampListScreen` and passes callbacks for switching between them. A `refreshKey` counter is incremented on save so `StampListScreen` re-fetches when the user navigates back.

### Data flow for saving a stamp

```
CameraScreen (takePictureAsync)
  → StampSaveModal (title + memo via VoiceInputField / useSpeechInput)
    → saveStamp (services/saveStamp.ts)
      → persistImage (services/fileService.ts)   — copies temp URI to documentDirectory/stamps/
      → insertStamp (services/stampRepository.ts) — writes row to SQLite
```

### Storage

- **SQLite** (`expo-sqlite`): single `stamps` table, opened lazily via `getDatabase()` singleton in `src/db/database.ts`. Schema is in `src/db/schema.ts`.
- **File system** (`expo-file-system/legacy`): images are copied from the camera's temp URI into `documentDirectory/stamps/<id>.(jpg|png)`. The DB stores the path *relative to* `documentDirectory` (e.g. `stamps/abc.jpg`). `resolveImageUri` in `fileService.ts` reconstructs the full URI for display.

### Speech recognition

`useSpeechInput` (`src/hooks/useSpeechInput.ts`) wraps `expo-speech-recognition`. It is hardcoded to `lang: 'ko-KR'` with `interimResults: true`. `StampSaveModal` tracks which field (`title` | `memo`) is the active speech target and routes interim/final results accordingly.

### Key types

`Stamp` (camelCase, used in JS) ↔ `StampRow` (snake_case, raw DB columns) — mapping happens in `stampRepository.ts:mapRow`.

### EAS / Build

`eas.json` defines a `preview` build profile that produces an APK for internal distribution. `appVersionSource: "remote"` means the version is managed in the EAS dashboard, not `app.json`.
