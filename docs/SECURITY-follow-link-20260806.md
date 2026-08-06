# 보안·라이선스·특허 점검 — 후속 스탬프 연결 (2026-08-06)

## 변경 요약
- `stamps.parent_id` 컬럼·인덱스 추가(마이그레이션)
- 수정 화면 「후속 촬영」「앨범 후속」「연결 비교」
- 후속은 **새 스탬프**로 저장하며 `parent_id`는 항상 **원본(루트) id**
- 목록 카드에 `parentId`가 있으면 「후속」표시(추가 조회 없음)
- 연결 비교는 탭 시에만 `listFollowLinkChain` 1회 조회

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `src/components/FollowLinkCompareSheet.tsx`, `restore-follow-link.bat`, 본 문서 |
| **재사용·수정** | `src/db/schema.ts`, `src/db/database.ts`, `src/types/stamp.ts`, `src/services/stampRepository.ts`, `src/services/saveStamp.ts`, `src/components/StampSaveModal.tsx`, `src/components/StampListScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-follow-link/`, `public.pre-follow-link/` |

## 글꼴 (OFL)
- 폰트 파일·웹폰트 추가 없음. 시스템 UI 글꼴만 사용.

## 의존성·GPL
- **신규 npm/Gradle 없음.**
- 패키지 추가 없음 → GPL 강제 확산 도입 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한 | 카메라·앨범은 기존 `expo-image-picker` 경로 재사용. 신규 권한 없음 |
| 네트워크 | 변경 없음. `parent_id`는 기기 SQLite만 |
| 입력 | `parent_id`는 id 문자셋·길이 검증 후 저장. 저장 시 루트로 정규화 |
| 성능 | 목록에 자식 수 N+1 조회 없음. 비교 UI만 온디맨드 |
| Data safety | 사진·메타 기기 내 저장 정책 동일. 서버 신규 전송 없음 |
| Play Store | 권한 선언·데이터 수집 문구 변경 불필요 |

## 저작권·독자성
- VoiceStamp 자체 스탬프·저장 모달·목록 패턴으로 구현.
- 외부 전후비교 제품·GitHub 구현 복사·번역 없음.
- UI 문구 「후속 촬영」「앨범 후속」「연결 비교」「후속」은 본 프로젝트 독자 문구.

## 특허 검토 메모 (보장 아님)
- 관련 사진 항목을 id로 묶어 나란히 보는 UI는 일반적 기록 패턴일 수 있음.
- **특허 비침해를 보장하지 않음.** 별도 청구항 대비 필요 시 법무 검토.
- 픽셀 단위 전후 슬라이더·자동 정렬·클라우드 매칭은 **포함하지 않음**.

## 롤백
`restore-follow-link.bat`
