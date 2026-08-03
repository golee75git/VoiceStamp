# 보안·라이선스·특허 점검 — 저장 직후 칸 말하기 (2026-08-03)

## 변경 요약
- 설정 opt-in `save_slot_speech_enabled`(기본 끔)
- 새 스탬프 저장 화면 오픈 시 제목→장소→메모 순 마이크 안내 시트
- 기존 필드별 마이크·`useSpeechInput` 세션 가드 유지

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `src/components/SaveSlotSpeechSheet.tsx`, `restore-save-slot-speech.bat`, `docs/DESIGN-save-slot-speech.md`, 본 문서 |
| **재사용·수정** | `src/services/settingsService.ts`, `src/components/StampSaveModal.tsx`, `src/components/SettingsScreen.tsx`, `src/components/WebLimitNoticeScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-save-slot-speech/`, `public.pre-save-slot-speech/` |

## 글꼴 (OFL)
- 폰트 파일·웹폰트 추가 없음. 시스템 UI 글꼴만 사용(기존과 동일).

## 의존성·GPL
- **신규 npm/Gradle 없음.** 기존 `expo-speech-recognition`만 사용.
- 패키지 추가 없음 → GPL 강제 신규 도입 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한 | `RECORD_AUDIO` 등 변경 없음(기존 마이크 권한 재사용) |
| 네트워크 | 변경 없음. OS STT 경로만. 서버로 음성·텍스트 신규 전송 없음 |
| 동작 | 시트·필드 마이크 각각 `listeningRef` 세션 가드. 수정 모달·웹에서는 시트 미표시 |
| Data safety | 음성 데이터가 앱 서버로 새로 전송되지 않음(기존과 동일). OS 제공자 정책은 PRIVACY.md §2.3 |
| Play Store | 마이크 권한 목적 문구 기존과 동일(제목·메모 등 입력). opt-in 기본 끔 |

## 저작권·독자성
- VoiceStamp 자체 `useSpeechInput` / 저장 모달 / 설정 토글 패턴으로 구현.
- 외부 제품·GitHub 구현 복사·번역 없음.
- UI 명칭 「칸 말하기」「저장 직후 칸 말하기」는 본 프로젝트 독자 문구.

## 특허 검토 메모 (보장 아님)
- 폼 필드를 순서대로 음성 입력받는 UI 흐름은 일반적 패턴일 수 있음.
- **특허 비침해를 보장하지 않음.** 별도 청구항 대비 필요 시 법무 검토.
- 키워드 일괄 분배·클라우드 AI 매핑은 본 변경에 **포함하지 않음**.

## 롤백
`restore-save-slot-speech.bat`
