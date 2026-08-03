# 설계 — 장소 칩 · 저장 모달 유형 선택 (2026-08-03)

## 목표

1. 목록에서 `placeLabel`로 장소 칩 필터 (유형 칩과 AND)
2. 저장·수정 모달에서 저장 유형 선택 → 이번 스탬프 + **다음 촬영 기본값**(`applyStampFieldTemplate`)

## 구현 요약

| 영역 | 내용 |
|------|------|
| `saveStamp` / `updateStamp` | 선택적 `templateId` 입력 우선 |
| `StampSaveModal` | 유형 선택 버튼·모달, 선택 시 `applyStampFieldTemplate` |
| `StampListScreen` | 장소 칩 (빈도순 최대 24 + 장소 없음) |
| `stampListSearch` | extra1~3도 검색 |

## 새/변경 파일

- **신규:** `restore-place-chip-save-template.bat`, 본 문서, SECURITY 메모, 스냅샷 `src.pre-place-chip-save-template/` · `public.pre-place-chip-save-template/`
- **변경:** `saveStamp.ts`, `StampSaveModal.tsx`, `StampListScreen.tsx`, `stampListSearch.ts`, `help.html`, `RESTORE.md`
- **재사용:** `applyStampFieldTemplate`, `listStampFieldTemplatesForFilter`, 기존 칩 스타일

## 되돌리기

`restore-place-chip-save-template.bat`
