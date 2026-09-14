# 보안·라이선스·특허 점검 — 저장 화면 뒤로가기 (2026-09-14)

## 변경 요약
일부 기기에서 저장 화면 시스템 뒤로가기가 흰 화면에 머물던 문제를 막는다. 안쪽 시트는 한 단계씩 닫고, 저장 시트 닫기는 「취소」와 같게 한다. Android KeyboardAvoidingView padding은 끈다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-save-sheet-back.bat`, 본 문서 |
| **재사용·수정** | `src/components/StampSaveModal.tsx`, `src/components/CameraScreen.tsx`, `public/help.html` |
| **재사용(무수정)** | `src/services/exportOnDemand.ts`, `src/screens/MainScreen.tsx` |
| **스냅샷** | `src.pre-save-sheet-back/`, `public.pre-save-sheet-back/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 앱은 시스템 글꼴.

## 의존성·GPL
- npm 추가 없음. GPL 단독 신규 없음. 기존 OSS MIT 경로.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 저장 중(`saving`)이면 뒤로가기로 닫지 않음 |
| Play | 새 권한 없음. 네비게이션만 조정 |

## 저작권·독자성
- 식별자 `handleSaveSheetBack`, `saveSheetBackLockRef`, `closeSaveModal`, `save-sheet-back`은 이 프로젝트 전용.
- 공개 검색에서 동일 식별자 구현을 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 모달 단계 닫기와 하드웨어 뒤로가기는 일반 UI에 가깝다.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-save-sheet-back.bat`

## 배포
- APK: `VoiceStamp_20260914_190436.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260914_190436.apk
- 실기기에서 저장 뒤로가기·안쪽 시트·카메라 홈 「앱 종료」확인이 필요하다.
