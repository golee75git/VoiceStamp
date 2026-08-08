# 보안·라이선스·특허 점검 — 가져온 미리보기·제목 사업명 (2026-08-08)

## 변경 요약
1. 사업 취합「가져옴」: 로컬로 가져온 스탬프 목록 + **썸네일·전체 미리보기** + 선택 후 **휴지통**(`moveStampsToTrash`).
2. 사업 참여 중 신규 저장 시 제목 기본값에 **사업 이름** 포함(`StampSaveModal`, `quickCaptureSave`).
3. 가져오기 직후 썸네일 생성(`ensureStampThumb`).
4. **신규 npm 없음.**

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `ProjectImportedList.tsx`, `projectImportedStamps.ts`, `restore-imported-preview.bat`, 본 문서 |
| **수정** | `ProjectCollectScreen.tsx`, `StampSaveModal.tsx`, `quickCaptureSave.ts`, `projectImportService.ts`, `help.html`, `RESTORE.md` |
| **재사용** | `StampListThumb`, `moveStampsToTrash`, `listStamps` |
| **스냅샷** | `src.pre-imported-preview/`, `public.pre-imported-preview/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 삭제 | 소프트 삭제(휴지통). 클라우드 수신 수신소 삭제가 아님 |
| 미리보기 | 로컬 `resolveImageUri`만. 새 네트워크 전송 없음 |
| 제목 | 참여 사업명 로컬 조합. 개인정보 신규 수집 경로 없음 |
| Data safety | 기존 스탬프·휴지통 모델과 동일 |

## 특허
- 특허 비침해 보장하지 않음. 목록 썸네일·제목 접두는 일반 패턴일 수 있음.

## 롤백
`restore-imported-preview.bat`
