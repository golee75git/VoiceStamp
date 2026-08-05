# 보안·라이선스·특허 점검 — 항목 말하기 보조 버튼 테두리 (2026-08-05)

## 변경 요약
- `SaveSlotSpeechSheet`의 「지금까지 넣기」「적용 없이 닫기」에 테두리·배경 스타일만 추가
- 동작·콜백·권한·네트워크 변경 없음

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-slot-speech-link-border.bat`, 본 문서 |
| **재사용·수정** | `src/components/SaveSlotSpeechSheet.tsx`, `RESTORE.md` |
| **스냅샷** | `src.pre-slot-speech-link-border/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. React Native 시스템 UI 글꼴만 사용.

## 의존성·GPL
- 신규 npm/Gradle 없음. 기존 production 라이선스 요약: MIT 다수, GPL 단독 패키지 추가 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한 | 변경 없음 |
| 네트워크 | 변경 없음 |
| 입력 | StyleSheet만. 사용자 입력·저장 경로 미변경 |
| Data safety | 기존과 동일 |

## 저작권·독자성
- 기존 VoiceStamp 시트 UI 스타일 확장. 외부 구현 복사 없음.

## 특허 검토 메모 (보장 아님)
- 버튼 테두리·배경은 일반 UI 장식 수준.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-slot-speech-link-border.bat`

## 도움말
- 기능·문구 변경 없음. `public/help.html` 기존 「지금까지 넣기」「적용 없이 닫기」설명 유지.
