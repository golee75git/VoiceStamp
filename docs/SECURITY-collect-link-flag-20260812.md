# SECURITY: collect link flag (2026-08-12)

## Summary

Camera → 취합 opened project collect with `collectOpenedFromLink=true` so the hub「코드로 참여」screen showed the share-link banner, locked an empty join field, and failed with「사업코드와 참여코드를 확인하세요」. Root cause: one flag was reused for both deep-link UX and back-navigation target.

## Changes

| Item | Change |
|------|--------|
| `MainScreen` | Split `collectOpenedFromLink` (deep link only) from `collectReturnTo` (`camera` \| `settings`) |
| Camera open | `openedFromLink=false`, return → camera |
| Settings open | `openedFromLink=false`, return → settings |
| Deep link | `openedFromLink=true`, return → camera |
| Help | Clarify camera 취합 vs share-link join |

## Security / privacy

- No new network, storage, or auth surfaces.
- Deep-link parse path unchanged; false share-link UI no longer appears from camera entry (reduces mistaken join attempts with empty codes).
- Play Store: UX bugfix only; no permission or data-collection change.

## Fonts / licenses

- No new fonts or npm packages. Existing project OFL fonts unchanged. No GPL added.

## Patent note

- Navigation flag split only; no novel technical claim asserted. Patent review not indicated for this change.

## Rollback

`restore-collect-link-flag.bat`
