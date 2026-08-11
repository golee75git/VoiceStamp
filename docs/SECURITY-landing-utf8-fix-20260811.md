# SECURITY: landing UTF-8 fix (2026-08-11)

## Summary

`public/landing.html` and `public/info.html` were rewritten with a non-UTF-8 PowerShell `Set-Content` while updating the APK filename. That corrupted Korean text and broke `</title>`, so the marketing home page appeared blank / would not open correctly.

## Fix

- Restore UTF-8 content from `public.pre-mainint1-refresh/`
- Replace APK filename with `VoiceStamp_20260811_234202.apk` via Python UTF-8 write
- No app / API logic changes

## Notes

- Broken copies kept under `public.pre-landing-utf8-fix/`
- Prefer UTF-8-aware tools for future APK link updates on HTML

## Rollback of this commit’s files

`restore-landing-utf8-fix.bat` restores the broken pre-fix snapshots (not recommended).
