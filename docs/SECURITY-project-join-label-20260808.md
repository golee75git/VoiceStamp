# 보안·라이선스·특허 점검 — 사업 참여 구분 표시 (2026-08-08)

## 변경 요약
- 코드 참여·QR 찍기 공통으로 **선택** 자유 텍스트 `구분 표시`(최대 40자)를 둡니다.
- 업로드 메타·수신 목록에 `uploadedByMark`로 함께 저장·표시합니다.
- 강제 실명·전화 수집 없음. 비우면 기기 `uploadedByDeviceId`만 사용합니다.
- **신규 npm 없음.**

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `projectCollectSettings.ts`, `projectUploadQueue.ts`, `projectCollectApi.ts`, `ProjectCollectScreen.tsx`, `api/project.js`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-project-join-label.bat`, 본 문서 |
| **재사용** | 기존 사업 취합 참여·업로드 경로 |
| **스냅샷** | `src.pre-project-join-label/`, `api.pre-project-join-label/`, `public.pre-project-join-label/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음. GPL 신규 도입 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 입력 | 서버에서 trim·공백 정규화·40자 절단. 스크립트 실행 경로 없음(JSON 메타) |
| 선택성 | 비어 있으면 null 저장. 본인확인·인증에 사용하지 않음 |
| 개인정보 | 사용자가 적으면 일시 저장소(사업 TTL)에 남을 수 있음. 실명·전화 전체를 요구하지 않음 |
| Data safety | 기존 업로드와 동일 채널. 새 권한 없음 |

## 특허
- 특허 비침해 보장하지 않음. 선택 라벨 첨부 업로드는 일반 메타데이터 패턴일 수 있음.

## 롤백
`restore-project-join-label.bat` (API 되돌린 뒤 Vercel 재배포)
