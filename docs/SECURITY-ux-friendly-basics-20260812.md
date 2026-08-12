# SECURITY: UX friendly basics (2026-08-12)

## Summary

Make first-run and settings less overwhelming without changing save/upload behavior.

1. **Onboarding** — 3 steps (찍기 → 말하기 → 저장) with captions; last CTA 「촬영 시작」; drop privacy/share promo slides from the first-run path (still available via help / existing assets).
2. **Settings** — 「고급 설정 펼치기/접기」; keep hand, location, capture, gallery, text size, project collect, app info always visible; fold PDF/OCR/blur/etc.

## Changes

| Item | Change |
|------|--------|
| `IntroScreen.tsx` | 3 captioned slides + 「촬영 시작」 |
| `SettingsScreen.tsx` | `showAdvanced` collapse |
| `help.html` | Start + settings notes |

## Security / privacy / Play

- No new permissions, network, or data collection.
- Privacy blur / OCR remain off by default and reachable under advanced settings.
- Onboarding no longer leads with share/privacy marketing slides; legal pages and help still cover sharing caution.
- Data safety: unchanged.

## Fonts / licenses

- No new fonts or npm packages. System UI fonts only. No GPL added.

## Patent note

- UI information architecture only; no novel technical claim. Patent review not indicated.

## Rollback

`restore-ux-friendly-basics.bat`
