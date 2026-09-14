# 보안·라이선스·특허 점검 — 저장 화면 키보드 가림 (2026-09-15)

## 변경 요약
저장·수정 시트에서 아래쪽 칸(추가·메모 등)과 칸 이름 입력이 시스템 키보드에 가리지 않게 한다. Android 바깥 `KeyboardAvoidingView` padding은 켜지 않는다(뒤로가기 흰 화면 재발 방지). 시트 안 스크롤 여백과 포커스 칸 올리기만 쓴다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-save-kb-clear.bat`, 본 문서 |
| **재사용·수정** | `src/components/StampSaveModal.tsx`, `src/components/VoiceInputField.tsx`, `public/help.html` |
| **재사용(무수정)** | `src/screens/MainScreen.tsx`, `src/services/exportOnDemand.ts` |
| **스냅샷** | `src.pre-save-kb-clear/`, `public.pre-save-kb-clear/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 앱은 시스템 글꼴.

## 의존성·GPL
- npm 추가 없음. GPL 단독 신규 없음. 기존 OSS MIT 경로.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 키보드 높이·칸 위치만 사용. 입력 내용을 밖으로 보내지 않음 |
| Play | 새 권한 없음. UI 스크롤만 조정 |

## 저작권·독자성
- 식별자 `SaveKbClearHost`, `openSaveFieldKbClear`, `runSaveFieldRaise`, `saveSheetKbInset`, `save-kb-clear`는 이 프로젝트 전용.
- 공개 검색에서 동일 식별자 구현을 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 키보드가 뜬 뒤 입력칸을 보이게 스크롤하는 구성은 일반 UI에 가깝다.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-save-kb-clear.bat`

## 배포
- APK: `VoiceStamp_20260915_075220.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260915_075220.apk
