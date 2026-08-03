# 설계 — 앨범 EXIF 파서·비가압 (2026-08-03)

## 목표

앨범 가져오기에서 EXIF GPS를 더 잘 읽도록 **속도 영향이 작은 1단계만** 적용.
- 앨범 픽: `quality` 미지정(재압축 생략)
- 유리수 문자열·배열 DMS 파싱 보강
- `legacy` / media-library 2차 조회는 보류

## 새/변경 파일

- **신규:** `restore-gallery-exif-parser.bat`, 본 문서, SECURITY 메모, 스냅샷
- **변경:** `pickStampImage.ts`, `help.html`, `RESTORE.md`
- **재사용:** 기존 `readGpsFromExif` 흐름, 카메라 픽 `quality` 유지

## 되돌리기

`restore-gallery-exif-parser.bat`
