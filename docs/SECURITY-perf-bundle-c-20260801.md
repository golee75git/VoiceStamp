# 보안·라이선스·특허 점검 — 성능 번들 C (2026-08-01)

## 변경 요약
- 목록 PDF / 프로젝트 ZIP / XLSX / HWPX를 **버튼 시점 동적 `import()`** 로 로드 (`exportOnDemand.ts`)
- 카메라 홈·앱 기동 시 exceljs·jszip·PDF 파이프라인이 즉시 붙지 않도록 분리

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `src/services/exportOnDemand.ts`, `restore-perf-bundle-c.bat`, 본 문서 |
| **재사용·수정** | `StampListScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-perf-bundle-c/`, `public.pre-perf-bundle-c/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 글꼴만 사용.

## 의존성·GPL
- **신규 npm/Gradle 없음.** 기존 `exceljs` / `jszip` / `expo-print`은 내보내기 시에만 로드.
- `license-checker` 기준 순수 GPL 강제 패키지 없음(기존과 동일).

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한·네트워크 | 변경 없음 |
| 동작 | 내보내기 API·파일 형식 동일. 첫 내보내기만 모듈 로드 지연 가능 |
| Data safety | 변경 없음 |

## 저작권·독자성
- VoiceStamp 기존 export 서비스 재사용 + Metro/`import()` 표준 지연 로드.
- 외부 구현 복사 없음.

## 특허 검토 메모 (보장 아님)
- 모듈 지연 로드는 일반적 기법. **특허 비침해를 보장하지 않음.**

## 롤백
`restore-perf-bundle-c.bat`
