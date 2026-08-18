# 보안·라이선스·특허 점검 — HWPX 자체 서식 (2026-08-18)

## 변경 요약
- 목록 **HWPX 보내기**가 쓰는 서식을 VoiceStamp 스크립트가 만든 껍데기로 교체.
- GitHub 예제 다운로드와 `report-source.hwpx`를 제거.
- 자리 표시(`{{reportTitle}}`, 스탬프 블록, `{{@stampImage}}`)는 기존 `hwpxTemplate.ts`와 동일.
- 보내기 단추·저장 경로는 그대로.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `assets/templates/vs-form.hwpx`, `restore-hwpx-own-form.bat`, 본 문서 |
| **재사용·수정** | `scripts/build-report-template.mjs`, `scripts/inspect-hwpx.mjs`, `src/services/exportHwpx.ts`, `public/templates/report.hwpx`, `public/help.html`, `docs/LICENSE-NOTICE.md`, `docs/SECURITY-play-readiness-20260811.md`, `RESTORE.md` |
| **재사용(무수정)** | `hwpxTemplate.ts`, `jszip` 3.10.1 MIT |
| **스냅샷** | 스크립트·exportHwpx·help·LICENSE (`*.pre-hwpx-own-form`). 제3자 `.hwpx` 바이너리는 git에 넣지 않음 |
| **삭제** | `assets/templates/report-source.hwpx` (저장소 미추적). `assets/templates/report.hwpx`는 앱 번들에서 `vs-form.hwpx`로 대체 |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. HWPX는 한글이 쓰는 화면 글자 이름만 적음(파일 미포함).
- 앱 UI는 기존처럼 시스템 글자. 저장소에 `.ttf`/`.otf` 없음.

## 의존성·GPL
- npm 추가 없음. 생성에 기존 `jszip`(MIT 경로)만 사용. GPL 경로 신규 채택 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 빌드 스크립트가 바깥 URL을 받지 않음 |
| 보내기 | PIN·업로드·수신 불변. 목록에서 고른 사진만 서식에 넣음 |
| Play | 제3자 한글 양식 리스크를 자체 껍데기로 줄임. 데이터 유형 변경 없음 |

## 저작권·독자성
- 서식 XML·자리 표시는 VoiceStamp가 작성. 외부 한글 양식 복사 없음.
- 식별자 `hwpx-own-form`, 파일명 `vs-form.hwpx`는 이 프로젝트 전용.
- HWPX는 한글이 공개한 패키지 형식(ZIP+XML)을 쓰는 것이며, 특정 제품 서식을 가져온 것이 아님.

## 특허 검토 메모 (보장 아님)
- 자리 표시를 채워 문서를 만드는 방식은 일반 내보내기 관용일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hwpx-own-form.bat`

## 배포
- APK: `VoiceStamp_20260818_151153.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260818_151153.apk
