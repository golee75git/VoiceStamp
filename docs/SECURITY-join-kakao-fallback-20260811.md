# SECURITY: join Kakao fallback (2026-08-11)

## Summary

KakaoTalk (and similar in-app browsers) opened the business share link (`/join?p=&c=`), briefly showed the join page, then navigated to the **main landing** because Android auto-`intent://` on page load failed and `S.browser_fallback_url` pointed at `/`.

## Changes

| Item | Before | After |
|------|--------|--------|
| Auto intent on load | Android: `location.href = intentUrl` after 250ms | **Removed** — user taps 「앱에서 참여·촬영」 |
| `browser_fallback_url` | `https://voicestamp-gilt.vercel.app/` (landing) | Same join URL with `p`/`c` preserved |
| Kakao / in-app UA | — | Hint note: tap button or “open in browser” |

## Threat / UX notes

- No new secrets or API surface.
- QR/share payload remains HTTPS `/join` (unchanged).
- Failed intent no longer dumps users on marketing home without codes.

## Rollback

`restore-join-kakao-fallback.bat` → `public.pre-join-kakao-fallback/`

## Scope

Web only (`public/join.html`, help copy). No native / APK binary change required for this fix.
