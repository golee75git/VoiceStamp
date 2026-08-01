# 보안·라이선스·특허 점검 — 음성 타깃 가드 (2026-08-01)

## 변경 요약
- `useSpeechInput`: 전역 speech `result` 이벤트는 **이 훅이 `start`한 세션(`listeningRef`)일 때만** `onResult` 호출
- 목록 「파일명·보고서 제목」마이크 결과가 「제목·메모 검색」에 섞이던 문제 수정
- 선택 모드 진입·내보내기 이름 모달 오픈 시 검색 마이크가 켜져 있으면 중지

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-speech-target-guard.bat`, 본 문서 |
| **재사용·수정** | `src/hooks/useSpeechInput.ts`, `src/components/StampListScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-speech-target-guard/`, `public.pre-speech-target-guard/` |

## 글꼴 (OFL)
- 폰트 파일·웹폰트 추가 없음. 시스템 UI 글꼴만 사용(기존과 동일).

## 의존성·GPL
- **신규 npm/Gradle 없음.** 기존 `expo-speech-recognition`만 사용.
- 패키지 추가 없음 → GPL 강제 신규 도입 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한 | `RECORD_AUDIO` 등 변경 없음 |
| 네트워크 | 변경 없음 (온디바이스 인식 경로 동일) |
| 동작 | 활성 마이크 세션만 텍스트 반영. 검색·저장·내보내기 필드 간 혼입 방지 |
| Data safety | 음성 데이터가 서버로 새로 전송되지 않음(기존과 동일) |

## 저작권·독자성
- VoiceStamp 자체 `useSpeechInput` / 목록 화면에 세션 가드만 추가.
- 외부 제품·GitHub 구현 복사·번역 없음.
- 공개 코드 검색: `listeningRef`+speech는 웹 Speech API 데모에서 흔히 쓰이는 **관용 플래그** 수준이며, VoiceStamp 전역 `useSpeechRecognitionEvent` 다중 훅 혼입 수정과는 구현·UI 문구가 다름. (`gh search`는 로컬 CLI 미인증으로 미실행 → Web 검색으로 대체 확인)

## 특허 검토 메모 (보장 아님)
- 이벤트 리스너에 활성 세션 플래그를 두는 일반적 UI 처리.
- **특허 비침해를 보장하지 않음.** 별도 청구항 대비 필요 시 법무 검토.

## 롤백
`restore-speech-target-guard.bat`
