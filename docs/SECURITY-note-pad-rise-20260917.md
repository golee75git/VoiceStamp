# 보안·라이선스·특허 점검 — 사진 글 세로 맞춤 (2026-09-17)

## 변경 요약
사진 위 글의 저장 좌표(`ny`)가 글자 상단이 되도록, 칸의 위 여백·손잡이 가운데 정렬만큼만 올린다. 가로 손잡이 보정은 그대로다. npm·글꼴 파일 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-note-pad-rise.bat`, 본 문서, `src.pre-note-pad-rise/`, `public.pre-note-pad-rise/` |
| **재사용·수정** | `src/components/PhotoNotePadLayer.tsx`, `public/help.html` |
| **재사용(무수정)** | `src/services/applyPhotoNotePad.ts` (`nx`·`ny`를 글자 원점으로 유지) |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 시스템 글꼴만 사용.

## 의존성·GPL
- npm 추가 없음. 번들 A/B/C 재패치 없음.
- `license-checker --production --summary`(2026-09-17): MIT 다수. `(MIT OR GPL-3.0-or-later)`·`(BSD-3-Clause OR GPL-2.0)` 이중 허가는 기존. GPL 단독 신규 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 기존 상한·개수 유지. 표시 위치만 맞춤 |
| Play | 새 권한 없음 |

## 저작권·독자성
- 식별자 `NOTE_PAD_RISE_HOST`, `restore-note-pad-rise`는 이 프로젝트 전용.
- 기존 가로 여백 보정과 같은 자체 칸 수치만 사용. 다른 앱 스티커 테두리를 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 사진 위 글을 두고 저장 위치와 미리보기를 맞추는 구성은 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-note-pad-rise.bat`

## 배포
- APK: `VoiceStamp_20260917_102508.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260917_102508.apk
