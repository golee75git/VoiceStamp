# 보안·라이선스·특허 점검 — 저장 칸 본문 글자색 (2026-09-17)

## 변경 요약
저장·수정 화면의 제목·장소·메모·추가 칸 본문에 글자색 `#111`을 명시한다. 흰 바탕은 그대로다. 일부 Android 폰의 시스템 어두운 화면이 기본 글자를 흰색으로 쓰는 경우를 막는다. npm·글꼴 파일 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-field-ink.bat`, 본 문서, `src.pre-field-ink/`, `public.pre-field-ink/` |
| **재사용·수정** | `src/components/VoiceInputField.tsx`, `public/help.html` |
| **재사용(무수정)** | `src/components/StampSaveModal.tsx` (`folderInput`의 `color: '#111'`과 맞춤) |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 시스템 글꼴만 사용.

## 의존성·GPL
- npm 추가 없음. 번들 A/B/C 재패치 없음.
- `license-checker --production --summary`(2026-09-17): MIT 다수, ISC/Apache-2.0/BSD. `(MIT OR GPL-3.0-or-later)`·`(BSD-3-Clause OR GPL-2.0)` 이중 허가는 기존. GPL 단독 신규 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 기존 상한 유지. 글자색만 명시 |
| Play | 새 권한 없음. 입력칸 가독성 |

## 저작권·독자성
- 식별자 `FIELD_INK_HOST`, `restore-field-ink`는 이 프로젝트 전용. 공개 검색에서 동일 구현 없음.
- 입력 컴포넌트에 `color`를 넣는 것은 일반 관용이다. 외부 앱 UI를 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 글자색 명시는 일반적인 화면 표시이며, 별도 특허 구성으로 보지 않음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-field-ink.bat`

## 배포
- APK: `VoiceStamp_20260917_094104.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260917_094104.apk
