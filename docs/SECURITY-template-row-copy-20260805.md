# 보안·라이선스·특허 점검 — 템플릿 행 복사·적용 중 배경 (2026-08-05)

## 변경 요약
- 저장 템플릿 시트 각 행에 「복사」버튼: 해당 템플릿으로 내 템플릿 만들기(편집기 seed)
- 적용 중 행 배경을 파란색으로 더 뚜렷하게 구분
- 탭=적용, 내 템플릿 롱프레스=수정·삭제 유지
- 신규 네트워크·권한·패키지 없음

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-template-row-copy.bat`, 본 문서 |
| **재사용·수정** | `FieldTemplateSheet.tsx`, `public/help.html`, `RESTORE.md` |
| **스냅샷** | `src.pre-template-row-copy/`, `public.pre-template-row-copy/` |
| **미변경(재사용)** | `CustomFieldTemplateEditor.tsx` (`custom:false` seed → 만들기 모드), `stampFieldTemplates.ts` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- 신규 npm/Gradle 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한 | 변경 없음 |
| 네트워크 | 변경 없음 |
| 저장 | 기존 기기 내 `app_settings` 커스텀 템플릿만 (최대 30) |
| Data safety | 기존과 동일 |

## 저작권·독자성
- VoiceStamp 기존 템플릿 시트·편집기 확장. 외부 구현 복사 없음.

## 특허 검토 메모 (보장 아님)
- 목록 행 탭/옆 버튼은 일반 UI 패턴 수준.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-template-row-copy.bat`
