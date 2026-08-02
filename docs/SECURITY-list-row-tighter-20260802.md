# 보안·라이선스·특허 점검 — 저장 목록 행 높이 축소 (2026-08-02)

## 변경 요약
- 목록 썸네일 `88→76`, `marginVertical 8→4`, 메타 `paddingVertical 10→6`
- 행 내부 여백만 축소. 선택·그리드·데이터 로직 변경 없음

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-list-row-tighter.bat`, 본 문서 |
| **재사용·수정** | `src/components/StampListScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-list-row-tighter/`, `public.pre-list-row-tighter/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만 사용.

## 의존성·GPL
- **신규 npm/Gradle 없음.** 라이선스 구성 변경 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한·네트워크 | 변경 없음 |
| 동작 | UI 수치만. 터치·선택·내보내기 동일 |
| Data safety | 변경 없음 |

## 저작권·독자성
- VoiceStamp `StampListScreen` StyleSheet 수치 조정만.
- 외부 구현 복사 없음. 여백 축소는 일반 UI 관용.

## 특허 검토 메모 (보장 아님)
- 목록 썸네일 크기·여백은 일반 UI. **특허 비침해를 보장하지 않음.**

## 롤백
`restore-list-row-tighter.bat`
