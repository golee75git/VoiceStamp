# 설계 — 앨범 EXIF 촬영 위치 (2026-08-03)

## 목표

목록「앨범」가져오기 시 장소·좌표는 **사진 EXIF GPS(촬영 당시)** 를 쓰고, **현재 기기 GPS로 보완하지 않는다.**

## 구현 요약

| 영역 | 내용 |
|------|------|
| `pickStampImage` | `exif: true`, `readGpsFromExif`, `{ uri, latitude, longitude }` 반환 |
| `locationService` | `getLocationSnapshotFromCoords` — 좌표만으로 장소명(학교/카카오) |
| `StampListScreen` | 선택 후 스냅샷 전달, `allowLiveLocationFallback={false}` |
| `StampSaveModal` | 프리페치 장소명 보완 시 **동일 좌표**로 재조회; 라이브 GPS 옵션 |

## 새/변경 파일

- **신규:** `restore-gallery-exif-place.bat`, 본 문서, SECURITY 메모, 스냅샷 `src.pre-gallery-exif-place/` · `public.pre-gallery-exif-place/`
- **변경:** `pickStampImage.ts`, `locationService.ts`, `StampListScreen.tsx`, `StampSaveModal.tsx`, `help.html`, `RESTORE.md`
- **재사용:** `expo-image-picker` EXIF, 기존 `resolvePlaceLabel` 경로

## 되돌리기

`restore-gallery-exif-place.bat`
