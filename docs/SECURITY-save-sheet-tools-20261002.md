# 보안·라이선스·특허 점검 — 저장 화면 도구 표시 (2026-10-02)

## 변경 요약
촬영 뒤 저장 화면의 「이미지 저장」은 설정의 표시·숨김으로 고르고, 기본은 숨김이다. 목록의 이미지 저장은 그대로다. 「개인정보 가리기」「글자 읽어 채우기」「URL 찾아 QR」「장면 키워드」는 기존 사용 설정이 꺼져 있으면 저장 화면에 나오지 않으며, 그 기본값은 이미 숨김이다. QR URL 칸은 「사진 URL → QR」이 사용일 때만 연다. 꺼져 있으면 새 스탬프에 미리보기 주소를 넣지 않고, 이미 저장된 주소는 유지한다. npm·글꼴 파일 없음. 번들 A/B/C 재패치 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-save-sheet-tools.bat`, 본 문서, `src.pre-save-sheet-tools/`, `public.pre-save-sheet-tools/` |
| **재사용·수정** | `src/components/StampSaveModal.tsx`, `src/components/SettingsScreen.tsx`, `src/services/settingsService.ts`, `public/help.html`, `src/constants/apkBuildLabel.ts`, `public/landing.html`, `public/info.html` |
| **재사용(무수정)** | `src/services/saveStamp.ts`, `src/services/privacyBlurService.ts` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 저장소에 번들된 글꼴 파일이 없고, 앱은 시스템 글꼴만 사용한다.

## 의존성·GPL
- npm 추가 없음. 외부 라이브러리 소스를 복사·변형하지 않음.
- 라이선스 자동 검사 결과는 아래 검사 결과에 적는다.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음. 표시 여부는 서버로 보내지 않음 |
| 입력 | 설정 값은 `true`/`false`만. 그 밖은 기본 숨김 |
| 저장 | 기존 `app_settings` 키 하나. QR을 숨기면 새 스탬프의 주소는 비우고, 수정 중인 기존 주소는 유지 |
| 권한 | 새 권한 없음 |
| Play | 새 데이터 수집·추적 없음. 표시 여부는 기기 안에만 있음 |

## 저작권·독자성
- 식별자 `save_sheet_image_button`, `getSaveSheetImageButton`, `restore-save-sheet-tools`는 이 프로젝트 전용.
- 기존 설정 읽기/쓰기와 기존 저장 화면 버튼을 그대로 쓰고, 그리는 조건만 조절한다.

## 특허 검토 메모 (보장 아님)
- 화면 단추를 설정으로 숨기는 구성은 일반적인 설정 화면이다.
- 사진에 글을 겹쳐 저장하는 기존 구성은 이번 변경의 대상이 아니며, 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 의존성 검사 결과 (2026-10-02)
`license-checker --production --summary`: MIT 533, ISC 41, Apache-2.0 15, BSD-3-Clause 11 등. GPL은 기존 이중 허가 `(MIT OR GPL-3.0-or-later)` 1건, `(BSD-3-Clause OR GPL-2.0)` 1건뿐. GPL 단독 신규 없음. `UNLICENSED` 1건은 이 앱(`private: true`)이다.

## GitHub 코드 검색
`save_sheet_image_button`, `getSaveSheetImageButton`, `restore-save-sheet-tools` 검색 결과 없음.

## 롤백
`restore-save-sheet-tools.bat`

## 배포
- APK: `VoiceStamp_20261002_100640.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20261002_100640.apk
