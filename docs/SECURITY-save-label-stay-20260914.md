# 보안·라이선스·특허 점검 — 저장 화면 칸 이름 탭 유지 (2026-09-14)

## 변경 요약
저장 화면에서 칸 이름(표시명)을 탭하면 값 입력 포커스와 시트 맨 아래 스크롤이 겹쳐 메모로 내려가던 문제를 막는다. 메모 칸 포커스와 글자 읽기 후의 스크롤은 그대로 둔다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-save-label-stay.bat`, 본 문서 |
| **재사용·수정** | `src/components/StampSaveModal.tsx`, `src/components/VoiceInputField.tsx`, `public/help.html` |
| **재사용(무수정)** | `src/services/exportOnDemand.ts`, 내보내기 모듈 |
| **스냅샷** | `src.pre-save-label-stay/`, `public.pre-save-label-stay/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 앱은 시스템 글꼴.

## 의존성·GPL
- npm 추가 없음. 기존 OSS는 MIT 경로. GPL 단독 신규 없음. 이 변경은 UI 포커스만 다룸.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 표시명 길이 상한(`FIELD_LABEL_MAX_LENGTH`) 유지 |
| Play | 새 권한 없음. 저장 화면 스크롤만 조정 |

## 저작권·독자성
- 식별자 `skipValueFocusFromLabelRef`, `scrollMemoIntoView`, `save-label-stay`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 입력 칸 포커스와 시트 스크롤을 나누는 화면 동작은 일반 UI에 가깝다. 별도 청구항 대비는 이 변경만으로는 해당하지 않는 것으로 본다.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-save-label-stay.bat`

## 배포
- APK: `VoiceStamp_20260914_183910.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260914_183910.apk
- 실기기에서 칸 이름 탭·메모 입력·글자 읽기 후 스크롤 확인이 필요하다.
