# SECURITY: collect join banner (2026-08-11)

## Summary

UX only: when a photographer is joined to a project collect session, show clear on-screen reminders so unrelated photos are less likely to be uploaded by mistake.

## Changes

| Surface | Change |
|---------|--------|
| Camera home | Banner `취합 중` + project name (tap → collect hub) when `getProjectJoin()` is set |
| Save modal (new stamp) | Line above Save: `이 사진이 「사업명」으로 전송됩니다` |
| Help | Document the two cues |

## Notes

- No API, upload, or storage path changes; display of existing join state only.
- No new secrets or dependencies.
- GPL/OFL: N/A.

## Rollback

`restore-collect-join-banner.bat`
