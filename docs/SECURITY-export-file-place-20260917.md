# 보안·라이선스·특허 점검 — 내보내기 파일명 장소·장별 JPEG (2026-09-17)

## 변경 요약
PDF·엑셀·한글·ZIP 기본 파일명에 장소(위치) 칸 글을 붙인다. 목록에서 여러 장을 이미지 저장하면 장마다 그 제목·장소로 JPEG 이름을 쓴다. npm·글꼴 파일 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-export-file-place.bat`, 본 문서, `src.pre-export-file-place/`, `public.pre-export-file-place/` |
| **재사용·수정** | `src/services/pdfTitleFormat.ts`, `src/services/exportStampImage.ts`, `src/components/StampListScreen.tsx`, `src/components/FollowLinkCompareSheet.tsx`, `src/components/SettingsScreen.tsx`, `public/help.html` |
| **재사용(무수정)** | `src/services/exportOnDemand.ts` (번들 C 유지) |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 시스템 글꼴만 사용.

## 의존성·GPL
- npm 추가 없음. 번들 A/B/C 재패치 없음.
- `license-checker --production --summary`(2026-09-17): MIT 다수. 기존 이중 허가만. GPL 단독 신규 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 파일명 금지 문자는 기존 `sanitizeStampFileBaseName`·장소 토큰 정리. 길이 상한 유지 |
| Play | 새 권한 없음. 갤러리 DISPLAY_NAME만 장별 제목으로 채움 |

## 저작권·독자성
- 식별자 `EXPORT_FILE_PLACE_HOST`, `restore-export-file-place`는 이 프로젝트 전용.
- 기존 제목 파일명 함수에 장소 칸만 이어 붙임. 외부 내보내기 앱의 이름 규칙을 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 제목·장소 글을 파일명으로 쓰는 구성은 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-export-file-place.bat`

## 배포
- APK: `VoiceStamp_20260917_175121.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260917_175121.apk
