# 보안·라이선스·특허 점검 — 사업취합 허브 카드 상태 색 (2026-08-18)

## 변경 요약
- 참여한 사업 중 **지금 연결된 줄**만 참여 중 안내와 같은 연한 녹색.
- 만든 사업 중 **종료·만료된 줄**만 연한 회색.
- 만들기·코드 참여·빈 목록·진행 중 만든 사업은 흰 카드 유지.
- 네트워크·저장·권한·서명 로직 변경 없음. StyleSheet만 분기.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-hub-card-status.bat`, 본 문서 |
| **재사용·수정** | `src/components/ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **스냅샷** | `src.pre-hub-card-status/`, `public.pre-hub-card-status/` |
| **미사용** | 신규 npm, 글꼴 파일, API |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI. 저장소에 `.ttf`/`.otf` 번들 없음.

## 의존성·GPL
- npm/Gradle 추가 없음. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)
- jszip은 기존과 같이 MIT 경로만 사용.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 데이터 | 카드 배경만 바꿈. PIN·업로드·수신 경로 불변 |
| 접근성 | 상태 문구(연결됨·종료됨·만료됨)는 그대로. 색만으로 상태를 전달하지 않음 |
| Play | 데이터 유형·권한 변경 없음 |

## 저작권·독자성
- 자체 허브 목록 스타일. 외부 대시보드·칸반 UI 복사 없음.
- 식별자 `hub-card-status`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 목록 행의 상태별 배경색은 일반 UI 관용일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hub-card-status.bat`

## 배포
- APK: `VoiceStamp_20260818_140815.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260818_140815.apk
