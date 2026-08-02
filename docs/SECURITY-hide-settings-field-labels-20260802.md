# 보안·라이선스·특허 점검 — 설정 필드 표시명 UI 제거 (2026-08-02)

## 변경 요약
- 설정 화면의 「필드 표시명」입력 블록만 제거
- 표시명 값은 저장 템플릿·저장 화면 칸 이름 탭으로 계속 변경·저장
- `settingsService` 키·저장 시 draft의 표시명 필드는 유지(다른 설정 저장 시 덮어쓰지 않도록 로드값 유지)

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-hide-settings-field-labels.bat`, 본 문서 |
| **재사용·수정** | `src/components/SettingsScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-hide-settings-field-labels/`, `public.pre-hide-settings-field-labels/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만 사용.

## 의존성·GPL
- **신규 npm/Gradle 없음.**

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한·네트워크 | 변경 없음 |
| 동작 | UI 중복 제거만. DB·권한·내보내기 동일 |
| Data safety | 변경 없음 |

## 저작권·독자성
- VoiceStamp 설정 화면 JSX 블록 삭제만. 외부 구현 복사 없음.

## 특허 검토 메모 (보장 아님)
- 설정 UI 항목 제거는 일반 UI. **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hide-settings-field-labels.bat`
