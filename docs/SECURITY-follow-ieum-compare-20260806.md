# 보안·라이선스·특허 점검 — 처음/이음 용어 + 연결 비교 PDF·삭제 (2026-08-06)

## 변경 요약
- UI 문구 통일: **처음** / **이음** (구 원본/후속)
- 새 이음 제목 접미사 `(이음)`; 기존 DB `(후속)`은 미변경, 목록 표시만 `(이음)`으로 읽음
- 연결 비교: 열 때 전체 선택, 카드 토글, PDF 만들기·저장·공유(온디맨드), 선택만 휴지통
- 「처음」 삭제 시 비교 시트 닫기

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-follow-ieum-compare.bat`, 본 문서 |
| **재사용·수정** | `FollowLinkCompareSheet.tsx`, `StampListScreen.tsx`, `StampSaveModal.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-follow-ieum-compare/`, `public.pre-follow-ieum-compare/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- **신규 npm/Gradle 없음.** PDF는 기존 `exportOnDemand` 경로.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한·네트워크 | 변경 없음 |
| 성능 | 비교 시트 체인 1회 로드. PDF는 버튼 시 import. 목록 N+1 없음 |
| 삭제 | 선택 id만 `moveStampsToTrash`(기존 휴지통). 확인 알림 |
| Data safety | 기기 내 저장 정책 동일 |
| Play Store | 권한·수집 문구 변경 불필요 |

## 저작권·독자성
- VoiceStamp 자체 목록 PDF·휴지통·연결 비교 패턴으로 구현.
- 외부 제품 UI/코드 복사 없음. 「처음」「이음」은 본 프로젝트 독자 문구.

## 특허 검토 메모 (보장 아님)
- 연결 사진 선택·PDF·삭제는 일반적 기록 UI일 수 있음. **비침해 보장 아님.**

## 롤백
`restore-follow-ieum-compare.bat`
