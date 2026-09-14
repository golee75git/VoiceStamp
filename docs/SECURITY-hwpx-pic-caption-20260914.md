# 보안·라이선스·특허 점검 — HWPX 사진·캡션 표 칸 (2026-09-14)

## 변경 요약
한글이 `report.hwpx` 표를 위칸(사진)·아래칸(캡션)으로 나눈 서식을 보내기에 맞춘다. 사진은 페이지당 칸의 남은 높이에 맞춰 크게 넣는다. 자리 표시가 표 안에 있어도 표 전체를 한 스탬프 블록으로 복제한다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-hwpx-pic-caption.bat`, 본 문서 |
| **재사용·수정** | `src/services/hwpxTemplate.ts`, `scripts/build-report-template.mjs`, `public/templates/report.hwpx`, `assets/templates/report.hwpx`, `public/help.html` |
| **재사용(무수정)** | `src/services/exportHwpx.ts`, `src/services/exportOnDemand.ts`, `jszip` MIT |
| **스냅샷** | `src.pre-hwpx-pic-caption/`, `scripts.pre-hwpx-pic-caption/`, `public.pre-hwpx-pic-caption/`, `assets.pre-hwpx-pic-caption/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 앱은 시스템 글꼴.
- 서식의 함초롬 계열 이름은 한글이 저장한 화면 글자 이름만 가리키며 앱이 파일을 배포하지 않음.

## 의존성·GPL
- npm 추가 없음. jszip 3.10.1 **MIT** 경로. GPL 경로 미선택.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 서식 채우기에 바깥 URL 없음 |
| 보내기 | 고른 사진만 BinData. 자리 글 XML 이스케이프 |
| 파일 | BinData 이름은 `imageN`과 서식에 있던 같은 id만. 경로 순회 없음 |
| Play | 새 권한 없음 |

## 저작권·독자성
- 표 XML은 한글 저장본. 앱은 블록 범위·칸 높이·그림 크기만 맞춘다.
- 식별자 `fitStampTable`, `stampSpan`, `hwpx-pic-caption`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 한 표에서 사진 칸과 캡션 칸을 나누고, 쪽 남은 칸에 사진을 키우는 구성은 문서 배치 계열 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hwpx-pic-caption.bat`

## 배포
- APK: `VoiceStamp_20260914_134700.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260914_134700.apk
- 한글 앱 화면은 이 환경에서 최종 확인하지 못함. 기기 확인 필요.
- 적용 당시 `assets/templates/report.hwpx`는 한글이 열어 두어 덮어쓰지 못함. 보내기는 표 안 자리 표시도 처리함. 웹 서식 `public/templates/report.hwpx`는 자리 표시를 표 밖으로 맞춘 본.
