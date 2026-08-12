# SECURITY: join App Links (2026-08-12)

## Summary

General-camera QR / 「앱에서 참여·촬영」 often did nothing because the release APK **did not declare** `https://…/join` or `voicestamp://join` intent-filters on `MainActivity` (app.json filters never landed in the native manifest). This change wires filters into `AndroidManifest.xml`, enables verified App Links (`autoVerify` + `assetlinks.json` for the debug keystore used by tester APKs), and improves join-page recovery (copy codes + open-fail hint).

## Changes

| Item | Change |
|------|--------|
| `android/.../AndroidManifest.xml` | VIEW filters: https `/join` (autoVerify), `voicestamp://join` |
| `app.json` | `autoVerify: true` (align with native) |
| `public/.well-known/assetlinks.json` | package `com.voicestamp.app` + debug APK SHA-256 |
| `vercel.json` | Content-Type for assetlinks |
| `scripts/post-export-web-layout.mjs` | Copy assetlinks into `dist` |
| `public/join.html` | Copy codes + fail hint if app did not leave page |
| Help | Camera QR / copy-codes note |

## Security / privacy / Play

- No new permissions or network secrets.
- Join URL still carries upload code (existing model); collector PIN not in QR.
- App Links verification binds domain to package + signing cert (debug fingerprint for current tester channel).
- **Play production:** when switching to Play App Signing, add the Play SHA-256 to `assetlinks.json` (do not claim patent non-infringement).
- Data safety: unchanged.

## Fonts / licenses

- No new fonts or npm packages. Existing OFL fonts unchanged. No GPL added.

## Patent note

- App Links / Digital Asset Links are platform mechanisms; no novel claim asserted. Patent review not indicated for this wiring.

## Rollback

`restore-join-app-links.bat` then rebuild APK.
