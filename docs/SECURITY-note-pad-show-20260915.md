# 보안·라이선스·특허 점검 — 글 칸 사진 위 표시 (2026-09-15)

## 변경 요약
「글 칸 추가」는 배열에만 쌓이고 사진 위에 안 보이던 문제를 막는다. 칸 레이어를 사진 View 안에 두고, Android가 뷰를 접지 않게 하며, 위치는 픽셀로 둔다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-note-pad-show.bat`, 본 문서 |
| **재사용·수정** | `src/components/PhotoNotePadLayer.tsx`, `src/components/StampSavePreview.tsx`, `public/help.html` |
| **재사용(무수정)** | `src/screens/MainScreen.tsx`, `src/services/exportOnDemand.ts` |
| **스냅샷** | `src.pre-note-pad-show/`, `public.pre-note-pad-show/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 시스템 글꼴만 사용.

## 의존성·GPL
- npm 추가 없음.
- `license-checker --production --summary`는 기존과 동일. GPL 단독 신규 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 글 칸 상한·제어문자 제거 유지 |
| Play | 새 권한 없음. 표시 레이어만 조정 |

## 저작권·독자성
- 식별자 `NOTE_PAD_SHOW_HOST`, `restore-note-pad-show`는 이 프로젝트 전용.
- 공개 검색에서 동일 식별자 구현을 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 사진 위 글 칸을 끌어 옮기는 구성은 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-note-pad-show.bat`

## 배포
- APK: `VoiceStamp_20260915_112033.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260915_112033.apk
