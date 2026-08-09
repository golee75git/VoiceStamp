# SECURITY — landing.html UTF-8 restore (2026-08-09)

## Change
- Restored `public/landing.html` from snapshot `public.pre-apk-download-20260806_142007/` (valid UTF-8).
- Kept APK download target: `VoiceStamp_20260809_150428.apk`.
- Pre-restore broken file saved under `public.pre-landing-utf8-fix/`.
- Rollback: `restore-landing-utf8-fix.bat`.

## Why
Encoding corruption broke `</title>` / meta quotes so browsers treated most of the document as title content (blank page). No app logic change.

## Security notes
- Static marketing HTML only; no new endpoints, secrets, or dependencies.
- APK URL remains GitHub raw on existing release path (same as prior ship).
- `info.html` / other `public/*.html` were checked intact (valid `</title>`).
- CSP / COEP / COOP in `vercel.json` unchanged.

## Out of scope
- APK rebuild not performed (site-only fix).
