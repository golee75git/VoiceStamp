# 보안·라이선스·특허 점검 — 글 넣기·막대 조절 (2026-09-16)

## 변경 요약
큰 미리보기 단추를 「글 넣기」로 바꾸고 「닫기」 옆에 둔다. 글 상자 왼쪽 위가 저장 좌표가 되게 손잡이만큼 왼쪽으로 민다. 크기(3단계)·배경 투명도(0~100)는 기존 제스처로 막대를 그린다. npm·글꼴 파일 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-note-pad-tune.bat`, 본 문서, `src.pre-note-pad-tune/`, `public.pre-note-pad-tune/`, `src/services/photoNoteStyle.ts` |
| **재사용·수정** | `src/components/PhotoNotePadLayer.tsx`, `src/components/StampSaveZoomViewer.tsx`, `src/components/StampSaveModal.tsx`, `src/components/StampSavePreview.tsx`, `src/services/photoNotePad.ts`, `src/services/applyPhotoNotePad.ts`, `public/help.html` |
| **재사용(무수정)** | `src/services/exportOnDemand.ts` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 시스템 글꼴만 사용.

## 의존성·GPL
- npm 추가 없음. 번들 A/B/C 재패치 없음.
- `license-checker --production --summary`(2026-09-16): MIT 다수, ISC/Apache-2.0/BSD. `(MIT OR GPL-3.0-or-later)`·`(BSD-3-Clause OR GPL-2.0)` 이중 허가는 기존. GPL 단독 신규 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 글 상한·개수 상한 유지 |
| Play | 새 권한 없음 |

## 저작권·독자성
- 식별자 `NOTE_PAD_TUNE_HOST`, `restore-note-pad-tune`는 이 프로젝트 전용. 공개 검색에서 동일 구현 없음.
- 다른 앱 스티커 손잡이·여덟 점 테두리를 복사하지 않음. 짧은 가로 두 줄 손잡이·막대는 자체 표시.

## 특허 검토 메모 (보장 아님)
- 사진 위 글을 끌어 옮기고 크기·투명도를 막대로 고르는 구성은 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-note-pad-tune.bat`

## 배포
- APK: `VoiceStamp_20260916_104154.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260916_104154.apk
