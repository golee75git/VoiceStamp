# SECURITY: inbox import photographer mark + Excel column (2026-08-08)

## 변경 요약

- `stamps.uploaded_by_mark` 컬럼 추가(마이그레이션).
- 「내 폰으로」가져오기 시 서버 meta `uploadedByMark`(구분 표시) 저장. 기존 가져온 항목은 비어 있으면 보강.
- 엑셀 첫 열에 「촬영자」출력(미리보기는 2열).

## 보안

- Mark는 길이 40자 제한, 공백 정규화. PIN 없이 서버 mark를 임의 쓰지 않음(다운로드·collector PIN 경로만).
- 일반 촬영 저장 경로는 mark를 null로 유지.

## 롤백

`restore-inbox-mark.bat`
