# 보안·라이선스·특허 점검 — 저장 칸 기본 3개 (2026-10-02)

## 변경 요약
저장·수정 화면은 제목·장소·메모만 먼저 보여 준다. 「+ 칸 추가」로 추가1·추가2·추가3을 메모 앞에 하나씩 연다. 맨 끝 칸이 비어 있으면 「칸 줄이기」로 접는다. 연 칸 수는 기기 설정에 남아 다음 저장에 쓰이고, 글이 있는 칸은 수정·이음에서 바로 보인다. 접힌 칸의 값은 저장하지 않는다. npm·글꼴 파일 없음. 번들 A/B/C 재패치 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-save-core-slots.bat`, 본 문서, `src.pre-save-core-slots/`, `public.pre-save-core-slots/` |
| **재사용·수정** | `src/components/StampSaveModal.tsx`, `src/services/settingsService.ts`, `public/help.html`, `src/constants/apkBuildLabel.ts`, `public/landing.html`, `public/info.html` |
| **재사용(무수정)** | `src/services/fieldLabels.ts`, `src/services/saveStamp.ts`, `src/services/exportOnDemand.ts` |

## 글꼴 (OFL)
- 글꼴 파일(`.ttf`/`.otf`) 추가 없음. 저장소에 번들된 글꼴 파일이 없고, 앱은 시스템 글꼴만 사용한다.
- 이번 수정에서 OFL 글꼴을 새로 넣거나 바꾸지 않음.

## 의존성·GPL
- npm 추가 없음. 외부 라이브러리 소스를 복사·변형하지 않음.
- 라이선스 자동 검사는 작업 후 `license-checker` 요약으로 확인한다. GPL 단독 신규 없음이 기대값이며, 결과를 수정기록에 적는다.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음. 칸 개수는 서버로 보내지 않음 |
| 입력 | 설정 값은 `0`·`1`·`2`·`3`만 저장. 그 밖은 `0` |
| 저장 | 기존 `app_settings` 키 하나. 접힌 추가 칸은 빈 문자열로 저장해 숨은 값이 남지 않음 |
| 권한 | 새 권한 없음 |
| Play | 새 데이터 수집·추적 없음. 칸 개수는 기기 안에만 있음 |

## 저작권·독자성
- 식별자 `save_extra_slot_count`, `sanitizeSaveExtraSlotCount`, `filledExtraSlotCount`, `restore-save-core-slots`는 이 프로젝트 전용.
- 기존 저장 칸(제목·장소·메모·추가1~3)과 기존 설정 읽기/쓰기를 그대로 쓰고, 화면에 그리는 개수만 조절한다.
- 외부 폼 예제의 처리 순서·문구를 가져오지 않음. 버튼 문구는 「+ 칸 추가」「칸 줄이기」.

## 특허 검토 메모 (보장 아님)
- 입력 칸을 일부만 보여주고 버튼으로 나머지를 여는 구성은 일반적인 폼 화면이다.
- 사진에 글을 겹쳐 저장하는 기존 구성은 이번 변경의 대상이 아니며, 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 의존성 검사 결과 (2026-10-02)
`license-checker --production --summary`: MIT 533, ISC 41, Apache-2.0 15, BSD-3-Clause 11 등. GPL은 기존 이중 허가 `(MIT OR GPL-3.0-or-later)` 1건, `(BSD-3-Clause OR GPL-2.0)` 1건뿐. GPL 단독 신규 없음. `UNLICENSED` 1건은 이 앱(`private: true`)이다.

## GitHub 코드 검색
`save_extra_slot_count`, `filledExtraSlotCount`, `restore-save-core-slots` 검색 결과 없음.

## 롤백
`restore-save-core-slots.bat`

## 배포
- APK: `VoiceStamp_20261002_091137.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20261002_091137.apk
