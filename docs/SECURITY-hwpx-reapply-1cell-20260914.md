# 보안·라이선스·특허 점검 — HWPX 한글 1칸 서식 재적용 (2026-09-14)

## 변경 요약
한글이 다시 저장한 `report.hwpx`(1행 1칸, 사진+캡션 자리)를 보내기에 맞춘다. 캡션은 앱 칸 이름·값 한 덩어리로 유지한다. 랜딩·정보 HTML은 캐시를 바로 갱신하고, APK는 GitHub raw 직접 주소로 받는다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-hwpx-reapply-1cell.bat`, 본 문서 |
| **재사용·수정** | `assets/templates/report.hwpx`, `public/templates/report.hwpx`, `public/landing.html`, `public/info.html`, `vercel.json` |
| **재사용(무수정)** | `src/services/hwpxTemplate.ts`, `src/services/exportHwpx.ts`, `src/services/exportOnDemand.ts`, `scripts/build-report-template.mjs`, `jszip` MIT |
| **스냅샷** | `src.pre-hwpx-reapply-1cell/`, `scripts.pre-hwpx-reapply-1cell/`, `public.pre-hwpx-reapply-1cell/`, `assets.pre-hwpx-reapply-1cell/` |

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
| 웹 캐시 | `/`·`/info` HTML은 `max-age=0, must-revalidate` — APK 파일명 페이지가 옛 본을 오래 붙잡지 않음 |
| 다운로드 | APK는 GitHub `raw.githubusercontent.com` 직접 바이트. 저장소 공개 파일만 |
| Play | 새 권한 없음 |

## 저작권·독자성
- 표 XML은 한글 저장본. 앱은 기존 블록 범위·칸 높이·그림 크기 맞춤을 그대로 쓴다.
- 식별자 `hwpx-reapply-1cell`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 한 표 칸에 사진과 캡션을 같이 두고 쪽 남은 칸에 사진을 키우는 구성은 문서 배치 계열 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hwpx-reapply-1cell.bat`

## 배포
- APK: `VoiceStamp_20260914_144257.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260914_144257.apk
- 한글 앱 화면은 이 환경에서 최종 확인하지 못함. 기기 확인 필요.
- 적용 당시 `assets/templates/report.hwpx`는 한글이 열어 두어 덮어쓰지 못함. 보내기는 표 안 자리 표시도 처리함. 웹 서식 `public/templates/report.hwpx`는 자리 표시를 표 밖으로 맞춘 본.
