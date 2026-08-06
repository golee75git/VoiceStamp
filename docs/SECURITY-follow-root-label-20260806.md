# 보안·라이선스·특허 점검 — 목록 원본 표시 (2026-08-06)

## 변경 요약
- 저장 목록에서 후속이 달린 **원본** 제목 뒤에 표시용 `(원본)` 추가
- 유형 줄에 `원본 ·` / `후속 ·` 구분
- DB 제목은 변경하지 않음(표시만). 이미 로드된 `stamps`로 parent id 집합 구성(추가 조회 없음)

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-follow-root-label.bat`, 본 문서 |
| **재사용·수정** | `src/components/StampListScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-follow-root-label/`, `public.pre-follow-root-label/` |

## 글꼴 (OFL)
- 폰트 파일·웹폰트 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- **신규 npm/Gradle 없음.**

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한·네트워크 | 변경 없음 |
| 성능 | 목록 N+1 없음. in-memory `Set`만 사용 |
| Data safety | 표시 문자열만. 서버 전송 없음 |
| Play Store | 권한·수집 문구 변경 불필요 |

## 저작권·독자성
- VoiceStamp 자체 목록·후속 연결 패턴으로 구현.
- 외부 전후비교 제품 UI 문구·구현 복사 없음.
- 「(원본)」「원본 ·」은 본 프로젝트 독자 표시.

## 특허 검토 메모 (보장 아님)
- 연결 관계 라벨 표시는 일반적 UI일 수 있음. **비침해 보장 아님.**

## 롤백
`restore-follow-root-label.bat`
