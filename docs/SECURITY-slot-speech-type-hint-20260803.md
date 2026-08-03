# 보안·라이선스·특허 점검 — 칸 말하기 유형·예시 (2026-08-03)

## 변경 요약
- `SaveSlotSpeechSheet` 상단에 저장 유형 바꾸기 + 칸별 템플릿 `말하기 예`
- 기존 `applyStampFieldTemplate` / `fieldPlaceholders` 재사용
- 신규 네트워크·권한·패키지 없음

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-slot-speech-type-hint.bat`, 본 문서 |
| **재사용·수정** | `src/components/SaveSlotSpeechSheet.tsx`, `src/components/StampSaveModal.tsx`, `public/help.html`, `docs/DESIGN-save-slot-speech.md` |
| **스냅샷** | `src.pre-slot-speech-type-hint/`, `public.pre-slot-speech-type-hint/`, `docs.pre-slot-speech-type-hint/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- 신규 npm/Gradle 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한 | 변경 없음 |
| 네트워크 | 변경 없음 |
| 동작 | 유형 목록은 기기 내 템플릿 목록만. 말하기 예는 저장된 placeholder 문자열 표시만(자동 입력 아님) |
| Data safety | 기존과 동일 |

## 저작권·독자성
- VoiceStamp 자체 템플릿·시트 UI 확장. 외부 구현 복사 없음.

## 특허 검토 메모 (보장 아님)
- 유형 선택 + 필드별 예시 안내는 일반적 폼 UX 수준.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-slot-speech-type-hint.bat`
