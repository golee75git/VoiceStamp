# 보안·라이선스·특허 점검 — 한글 저장 표 서식 적용 (2026-09-14)

## 변경 요약
- 운영자가 한글에서 `report.hwpx`에 넣은 1칸 표를 보내기 서식으로 사용한다.
- 앱은 표를 새로 만들지 않는다. 자리 표시만 채우고 스탬프마다 그 표를 복제한다.
- 한글이 블록 시작/끝 자리를 뒤집어 저장한 경우, 빌드 스크립트가 순서를 맞춘다.
- 표가 있는 블록은 문단 `vertpos` 재배치를 하지 않아 한글 표 칸을 깨지 않게 한다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-hwpx-han-table.bat`, 본 문서 |
| **재사용·수정** | `src/services/hwpxTemplate.ts`, `scripts/build-report-template.mjs`, `assets/templates/report.hwpx`, `public/templates/report.hwpx`, `public/help.html`, `docs/LICENSE-NOTICE.md` |
| **재사용(무수정)** | `src/services/exportHwpx.ts`, `jszip` MIT |
| **스냅샷** | `src.pre-hwpx-han-table/`, `scripts.pre-hwpx-han-table/`, `assets.pre-hwpx-han-table/`, `public.pre-hwpx-han-table/` |

## 글꼴 (OFL)
- 패키지에 `.ttf`/`.otf` 등 글꼴 파일 없음. OFL 글꼴 파일도 추가하지 않음.
- 서식이 가리키는 화면 글자 이름은 한글이 저장한 이름만 사용한다. 파일을 넣지 않으므로 앱이 해당 글꼴을 배포하지 않음.

## 의존성·GPL
- npm 추가 없음. jszip MIT 경로. GPL 신규 채택 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 서식 적용·보내기에 바깥 URL 없음 |
| 보내기 | 목록에서 고른 사진만 BinData에 넣음. 자리 표시 원문은 XML 이스케이프 |
| 파일 | 서식 zip 항목만 읽고 쓰며, 경로 순회 없음 |
| Play | 서식은 운영자 한글 저장 문서. 제3자 양식 아님. 새 권한 없음 |

## 저작권·독자성
- 표 XML은 한글이 저장한 것. VoiceStamp는 자리 표시 순서·사진 바이트·페이지당 장수 배치만 맞춘다.
- 식별자 `hwpx-han-table`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 한글 표가 있는 서식을 복제해 사진을 넣는 구성은 일반 문서 내보내기 관용일 수 있음.
- 페이지당 장수에 맞춘 표 너비 조절은 배치 특허 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hwpx-han-table.bat`

## 배포
- APK: `VoiceStamp_20260914_112329.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260914_112329.apk
- 한글 앱에서 표·사진이 보이는지는 이 환경에서 최종 확인하지 못함. 기기 확인 필요.
