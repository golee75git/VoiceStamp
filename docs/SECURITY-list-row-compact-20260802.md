# 보안·라이선스·특허 점검 — 저장 목록 행 간격 (2026-08-02)

## 변경 요약
- 저장 목록 카드: 평소 테두리·그림자 제거, 하단 hairline만 사용
- 썸네일·메타 여백 축소, 선택 시 왼쪽 강조선 + 연한 배경
- 그리드는 얇은 테두리·모서리만 유지 (셀 구분)

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-list-row-compact.bat`, 본 문서 |
| **재사용·수정** | `src/components/StampListScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-list-row-compact/`, `public.pre-list-row-compact/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만 사용.

## 의존성·GPL
- **신규 npm/Gradle 없음.**
- 기존 의존성·라이선스 구성 변경 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한·네트워크 | 변경 없음 |
| 동작 | UI 스타일만. 데이터·내보내기·선택 로직 동일 |
| Data safety | 변경 없음 |

## 저작권·독자성
- VoiceStamp 기존 `StampListScreen` StyleSheet 수치·속성만 조정.
- 외부 UI 라이브러리·경쟁 앱 레이아웃 복사 없음.
- `StyleSheet.hairlineWidth`·행 구분선은 RN 관용 패턴.

## 특허 검토 메모 (보장 아님)
- 목록 행 여백·구분선은 일반 UI. **특허 비침해를 보장하지 않음.**

## 롤백
`restore-list-row-compact.bat`
