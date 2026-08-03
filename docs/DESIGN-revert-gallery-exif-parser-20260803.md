# 되돌림 — 앨범 EXIF 파서·비가압 (2026-08-03)

## 사유

앨범 `quality` 생략·유리수 파서 보강(1단계) 후에도 장소가 비어 사용자 요청으로 직전 상태로 복원.

## 방법

`restore-gallery-exif-parser.bat` → `src.pre-gallery-exif-parser` 스냅샷 적용.

## 결과

- `pickStampImage.ts` / `help.html` = 파서 보강 직전(앨범 EXIF 장소 기능은 유지)
- `legacy` / media-library는 적용하지 않음

## 보안·라이선스

신규 코드·의존성 없음. 시스템 글꼴만. 특허 비침해 보장하지 않음.
