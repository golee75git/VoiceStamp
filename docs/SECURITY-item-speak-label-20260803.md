# 보안·라이선스·특허 점검 — 항목 말하기 표시명 (2026-08-03)

## 범위
- UI 문구만 변경: 「칸 말하기」→「항목 말하기」, 「저장 직후 칸 말하기」→「저장 직후 음성으로 항목 채우기」
- 동작·설정 키(`save_slot_speech_enabled`)·컴포넌트 식별자는 유지

## 파일 구분
| 구분 | 경로 |
|------|------|
| **수정(기존)** | `SaveSlotSpeechSheet.tsx`, `SettingsScreen.tsx`, `WebLimitNoticeScreen.tsx`, `public/help.html` |
| **신규** | `restore-item-speak-label.bat`, 본 문서 |
| **스냅샷** | `src.pre-item-speak-label/`, `public.pre-item-speak-label/` |

## 보안
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 — OS STT만, 서버 전송 없음 |
| 저장 | 설정 키·스키마 변경 없음 |
| Play 정책 | 마이크 사용 고지·opt-in 기본 끔 유지. 표시명만 명확화 |

## 라이선스·글꼴
- 새 의존성 없음. 기존 패키지·OFL/시스템 글꼴만 사용.
- GPL 신규 도입 없음.

## 저작권·특허
- 독자 UI 문구 변경. 외부 제품 명칭·구현 복사 없음.
- **특허 비침해 보장 표현 없음.** 순차 STT UX는 일반적 패턴이며 청구항 대비는 기존 `SECURITY-save-slot-speech-20260803.md` 참고.

## 되돌리기
`restore-item-speak-label.bat`
