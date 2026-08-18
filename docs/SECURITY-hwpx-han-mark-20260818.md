# 보안·라이선스·특허 점검 — 한글 저장 HWPX 자리 표시 (2026-08-18)

## 변경 요약
- 보내기 서식을 운영자가 한글에서 저장한 `assets/templates/report.hwpx`로 연결.
- 문서에 있는 자리 표시는 유지. 그림 칸만 `{{@stampImage}}` 뒤로 옮김.
- 스크립트 단독 생성 껍데기(`vs-form.hwpx`)는 쓰지 않음. 한글이 「알 수 없는 형식」으로 거부하던 원인.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-hwpx-han-mark.bat`, 본 문서 |
| **재사용·수정** | `exportHwpx.ts`, `scripts/build-report-template.mjs`, `scripts/inspect-hwpx.mjs`, `assets/templates/report.hwpx`, `public/templates/report.hwpx`, `public/help.html`, `docs/LICENSE-NOTICE.md` |
| **재사용(무수정)** | `hwpxTemplate.ts`, `jszip` MIT |
| **스냅샷** | `src.pre-hwpx-han-mark/`, `scripts.pre-hwpx-han-mark/`, `assets.pre-hwpx-han-mark/`, `public.pre-hwpx-han-mark/` |

## 글꼴 (OFL)
- 패키지에 `.ttf`/`.otf` 등 글꼴 파일 없음. OFL 글꼴 파일도 추가하지 않음.
- 서식이 가리키는 화면 글자 이름은 한글 기본값 `함초롬돋움`, `함초롬바탕`(한글 설치본이 치환). 파일을 넣지 않으므로 앱이 해당 글꼴을 배포하지 않음.

## 의존성·GPL
- npm 추가 없음. jszip MIT 경로. GPL 신규 채택 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 빌드 스크립트가 바깥 URL을 받지 않음 |
| 보내기 | 목록에서 고른 사진만 서식에 넣음 |
| Play | 서식은 운영자 한글 저장 문서. 제3자 양식 아님 |

## 저작권·독자성
- 껍데기는 운영자가 한글에서 만든 파일. 자리 표시·그림 칸 위치만 VoiceStamp가 맞춤.
- 식별자 `hwpx-han-mark`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 자리 표시를 채워 보내는 방식은 일반 내보내기 관용일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hwpx-han-mark.bat`

## 배포
- APK: `VoiceStamp_20260818_162611.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260818_162611.apk
