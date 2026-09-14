# 보안·라이선스·특허 점검 — HWPX 표·사진 세로 여유 (2026-09-14)

## 변경 요약
HWPX 한 칸 표가 쪽 칸을 살짝 넘어 다음 쪽으로 가던 문제를, 표·사진 높이를 조금 줄여 한 쪽에 들어가게 한다. 캡션 덩어리·자리 표시 채우기는 그대로다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-hwpx-table-slack.bat`, 본 문서 |
| **재사용·수정** | `src/services/hwpxTemplate.ts`, `public/help.html` |
| **재사용(무수정)** | `src/services/exportHwpx.ts`, `src/services/exportOnDemand.ts`, `jszip` MIT |
| **스냅샷** | `src.pre-hwpx-table-slack/`, `public.pre-hwpx-table-slack/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 앱은 시스템 글꼴.

## 의존성·GPL
- npm 추가 없음. jszip 3.10.1 **MIT** 경로. GPL 경로 미선택.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 보내기 | 자리 글 XML 이스케이프 유지 |
| Play | 새 권한 없음 |

## 저작권·독자성
- 식별자 `TABLE_PAGE_SLACK_HWP`, `hwpx-table-slack`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 쪽 칸에 맞춘 표·사진 배치는 문서 배치 계열 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hwpx-table-slack.bat`

## 배포
- APK: `VoiceStamp_20260914_151454.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260914_151454.apk
- 한글 앱 화면은 이 환경에서 최종 확인하지 못함. 기기 확인 필요.
