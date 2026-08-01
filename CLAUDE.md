# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important

Always read the exact versioned Expo docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code. Expo APIs change between versions.

## Commands

```bash
# Dev server
npm start              # interactive platform chooser
npm run android        # native Android build (not Expo Go)
npm run web            # browser via Metro

# Local APK build (Windows only, ~10-30 min first time)
build-apk.bat          # release APK → VoiceStamp_YYYYMMDD_HHmmss.apk + VoiceStamp.apk
build-apk.bat debug    # debug APK (needs Metro running)

# EAS cloud build (requires `eas login`)
eas build --profile preview --platform android

# Web deploy (Vercel)
npm run build:web      # exports to dist/

# Regenerate bundled school database from CSV
npm run build:schools-db   # data/*.csv → assets/schools.sqlite
```

There is no test runner or linter configured in this project.

## Architecture

VoiceStamp is an Expo SDK 56 / React Native 0.85 app (TypeScript). Users take a photo, add a title and memo (optionally via Korean speech recognition), attach GPS coordinates and a floor label, then save as a "stamp." Stamps can be listed, exported to PDF/XLSX/HWPX, and shared.

The app runs on Android (primary target), iOS, and web. The web build is deployed to Vercel as a static export and also hosts standalone HTML pages (`public/`) for info, privacy, license, help, and a report viewer.

### App phases and navigation

`App.tsx` manages a boot → intro → start → main phase sequence. First launch shows an onboarding intro, then a start screen; subsequent launches skip to main.

`MainScreen` (`src/screens/MainScreen.tsx`) uses `useState<Screen>` to switch between `camera | list | settings | trash | ossLicenses` — there is no React Navigation or router. Android hardware back is handled via `BackHandler`. A `refreshKey` counter is bumped on save/delete so child screens re-fetch.

### Data flow for saving a stamp

```
CameraScreen (takePictureAsync or ImagePicker)
  → StampSaveModal (title + memo via VoiceInputField / useSpeechInput)
    → saveStamp (services/saveStamp.ts)
      → persistImage (services/fileService.ts)   — copies temp URI to documentDirectory/stamps/
      → insertStamp (services/stampRepository.ts) — writes row to SQLite
```

### Storage

- **SQLite** (`expo-sqlite`): `stamps` table + `app_settings` table, opened lazily via `getDatabase()` singleton in `src/db/database.ts`. Schema migrations are column-add ALTERs in `src/db/schema.ts`.
- **File system** (`expo-file-system/legacy`): images stored in `documentDirectory/stamps/<id>.(jpg|png)`. The DB stores paths *relative to* `documentDirectory`. `resolveImageUri` in `fileService.ts` reconstructs full URIs.
- **Schools DB**: a bundled `assets/schools.sqlite` (built from `data/*.csv` via `scripts/build-schools-db.mjs`). Installed to the device at first use by `src/services/schoolDatabase.ts` with version-checking.

### Location and place labels

`locationService.ts` gets GPS coords with a 6-second timeout and caches recent results. Place labels come from two sources in order: local school DB lookup (`schoolLookup.ts` — finds nearest school within radius) → Kakao Local API fallback (`kakaoLocal.ts` — reverse geocoding via `EXPO_PUBLIC_KAKAO_REST_KEY` in `.env`).

### Speech recognition

`useSpeechInput` wraps `expo-speech-recognition`, hardcoded to `lang: 'ko-KR'` with `interimResults: true`. `StampSaveModal` tracks which field (`title` | `memo`) is the active speech target.

### Export formats

Stamps export to PDF (`exportPdf.ts` via `expo-print`), XLSX (`exportXlsx.ts` via `exceljs`), HWPX (`exportHwpx.ts` via `jszip`), and project ZIP (`exportProject.ts`). Native image export with watermark overlay uses `react-native-image-marker` through `renderStampWatermarkNative.ts`.

### Key types

`Stamp` (camelCase, used in JS) ↔ `StampRow` (snake_case, raw DB columns) — mapping happens in `stampRepository.ts:mapRow`.

### Settings

All user preferences are stored in the `app_settings` SQLite table (key-value). `settingsService.ts` is the central accessor — it covers PDF layout, text alignment, camera hand, watermark style, overlay text, gallery save mode, floor display mode, title datetime mode, and more.

### Rollback / restore pattern

Every feature change creates a `restore-<feature>.bat` script and a matching `src.pre-<feature>/` snapshot directory. Running the bat file copies the snapshot back over `src/`. This is the project's undo mechanism. See `RESTORE.md` for the full index.

### Performance / health check

For performance or health-check requests, read **`docs/HEALTHCHECK.md` first**. Bundles A/B/C are already applied — verify regression only; pick next work from §2.

### Metro config

`metro.config.js` adds `wasm`, `hwpx`, `sqlite` to asset extensions and sets COEP/COOP headers for web SharedArrayBuffer support.

### Babel

`react-native-reanimated/plugin` must be the last Babel plugin (configured in `babel.config.js`).

### EAS / Build

`eas.json` defines a `preview` profile producing an APK. `appVersionSource: "remote"` means the version is managed in the EAS dashboard, not `app.json`.
