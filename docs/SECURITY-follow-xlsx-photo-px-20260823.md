# 보안·라이선스·특허 점검 — 연결 비교 엑셀 사진 가로 (2026-08-23)

## 변경 요약
- 연결 비교에서 엑셀을 만들기 전에 가로 px·글자 크기만 고른다.
- 값은 기존 수신·목록 엑셀 설정 키에 저장한다. 네트워크·권한 추가 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-follow-xlsx-photo-px.bat`, 본 문서, `docs/DESIGN-follow-xlsx-photo-px-20260823.md` |
| **재사용·수정** | `src/components/FollowLinkCompareSheet.tsx`, `public/help.html`, RESTORE, PRD/PLAN/PROJECT/CHANGELOG/README, `수정기록.txt`, LICENSE-NOTICE |
| **재사용(무수정)** | `src/services/exportXlsx.ts`, `src/services/projectCollectSettings.ts`, `src/services/exportOnDemand.ts`, `src/constants/apkBuildLabel.ts`(빌드 시 파일명만) |
| **스냅샷** | `src.pre-follow-xlsx-photo-px/`, `public.pre-follow-xlsx-photo-px/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 글자만.
- 저장소에 `.ttf` / `.otf` / `.woff` 없음.

## 의존성·GPL
- npm 추가 없음.
- 기존 `exceljs` 경로 유지. GPL 경로 신규 채택 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 없음. 기기 설정 키·로컬 엑셀만 |
| 권한 | 변경 없음 |
| 입력 | 가로 px는 120–800 정수만. 글자 프리셋 3종만 |
| Play | 데이터 유형·민감 권한 변경 없음 |

## 저작권·독자성
- 식별자 `FOLLOW_XLSX_PHOTO_PX`, `xlsxPxVisible`, `restore-follow-xlsx-photo-px`는 이 프로젝트 전용.
- 수신·목록 엑셀에 이미 있는 가로·글자 지정을 연결 비교 버튼에만 이은 것이며 외부 앱 UI를 베끼지 않음.

## 특허 검토 메모 (보장 아님)
- 표 안에 넣을 그림 크기를 고르는 것은 일반 내보내기 관용일 수 있음.
- **특허 비침해를 보장하지 않음.** 별도 청구항 대조가 필요하면 법무에서 검토한다.

## 롤백
`restore-follow-xlsx-photo-px.bat`

## 배포
- APK: `VoiceStamp_20260823_181951.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260823_181951.apk
- 사이트: https://voicestamp-gilt.vercel.app/
