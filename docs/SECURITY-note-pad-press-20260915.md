# 보안·라이선스·특허 점검 — 글 칸 추가 누름 (2026-09-15)

## 변경 요약
큰 미리보기에서 「글 칸 추가」가 스크롤 제스처에 가로채여 눌림 표시만 남던 문제를 막는다. 단추를 스크롤 밖에 두고, 새 칸은 「글」로 보이게 한다. 8개일 때는 비활성으로 두지 않고 안내만 띄운다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-note-pad-press.bat`, 본 문서 |
| **재사용·수정** | `src/components/StampSaveZoomViewer.tsx`, `src/components/PhotoNotePadLayer.tsx`, `src/components/StampSaveModal.tsx`, `src/services/photoNotePad.ts`, `public/help.html` |
| **재사용(무수정)** | `src/screens/MainScreen.tsx`, `src/services/exportOnDemand.ts` |
| **스냅샷** | `src.pre-note-pad-press/`, `public.pre-note-pad-press/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 시스템 글꼴만 사용.

## 의존성·GPL
- npm 추가 없음.
- `license-checker --production --summary`는 기존과 동일. GPL 단독 신규 없음. 트리의 이중 허가 항목은 이번 변경으로 추가되지 않음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 글 칸 상한·제어문자 제거 유지 |
| Play | 새 권한 없음. UI 위치만 조정 |

## 저작권·독자성
- 식별자 `NOTE_PAD_PRESS_HOST`, `restore-note-pad-press`는 이 프로젝트 전용.
- 공개 검색에서 동일 식별자 구현을 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 사진 위 글 칸을 끌어 옮기는 구성은 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-note-pad-press.bat`

## 배포
- APK: `VoiceStamp_20260915_103528.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260915_103528.apk
