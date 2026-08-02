# 보안·라이선스·특허 점검 — 목록 선택 취소 썸네일 복구 (2026-08-02)

## 변경 요약
- `StampListThumb`: 재조회 시 `uri`를 `null`로 비우지 않음 (흰 칸 플래시·잔류 감소)
- 목록 FlatList: `extraData`로 선택 상태 반영, `removeClippedSubviews={false}`
- 선택 취소 시 `scheduleStampThumbs`로 디스크 썸네일 재보장

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-list-thumb-selection-fix.bat`, 본 문서 |
| **재사용·수정** | `StampListThumb.tsx`, `StampListScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-list-thumb-selection-fix/`, `public.pre-list-thumb-selection-fix/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만 사용.

## 의존성·GPL
- **신규 npm/Gradle 없음.**

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한·네트워크 | 변경 없음 |
| 동작 | 목록 UI 렌더·썸네일 캐시만. 파일·DB 삭제 없음 |
| Data safety | 변경 없음 |

## 저작권·독자성
- VoiceStamp 자체 썸네일·FlatList 설정 조정.
- `removeClippedSubviews` 이슈는 RN Android 일반 관용 대응. 외부 앱 UI 복사 없음.

## 특허 검토 메모 (보장 아님)
- 목록 이미지 캐시·클립 뷰 해제는 일반 UI. **특허 비침해를 보장하지 않음.**

## 롤백
`restore-list-thumb-selection-fix.bat`
