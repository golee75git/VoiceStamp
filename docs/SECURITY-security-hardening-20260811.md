# 보안·라이선스·특허 점검 — 사업 취합 API 하드닝 (2026-08-11)

## 변경 요약
- **S1**: `api/project.js` `action=ncpProbe` 공개 차단 → `404 gone` (라이브 Put/Delete·키 메타 응답 중단).
- **S2**: 취합 PIN 실패 시 IP·사업별 5분 10회 제한 → `429 too_many_attempts`. 신규 사업 PIN **6자리**만 허용(기존 4~5자리 해시는 계속 검증).
- 500 응답에서 버킷·액세스 키 prefix·NCP hint 제거(서버 로그만).
- 앱: 사업 만들기 UI·오류 문구·도움말 갱신.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `api/project.js`, `src/components/ProjectCollectScreen.tsx`, `src/services/projectCollectApi.ts`, `public/help.html`, `docs/NCP-PROJECT-SETUP.md` |
| **신규** | 본 문서, `restore-security-hardening.bat`, `api.pre-security-hardening/`, `src.pre-security-hardening/`, `public.pre-security-hardening/` |
| **재사용** | `api/visitor.js`와 같은 **인메모리 윈도 카운트** 관용 패턴(신규 npm 없음). 명칭·문구는 VoiceStamp 사업 취합용으로 자체 작성 |

## 글꼴 (OFL)
- 폰트 파일·웹폰트 **추가 없음**. 시스템 UI 글꼴만. 기존 OFL 번들 변경 없음.

## 의존성·GPL
- **신규 npm 없음.**
- jszip MIT 경로·node-forge BSD 경로 유지 ([LICENSE-NOTICE.md](./LICENSE-NOTICE.md) §3).
- GPL 경로 채택 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| S1 ncpProbe | 공개 진단 제거 — Data safety·스토어 심사에 유리 |
| S2 PIN | 브루트포스 속도 완화(서버리스 인스턴스 로컬 — 완벽 공유 아님) |
| PIN 자릿수 | 신규 6자리 — 기존 사업 호환 |
| PROJECT_PIN_SALT | 운영자가 Vercel에 랜덤 설정 권장(코드 기본값은 문서 경고) |
| 헬스체크 | API·도움말만 — A/B/C 핫패스 미변경 |

## 특허
- 특허 비침해를 보장하지 않음. PIN 시도 제한·진단 엔드포인트 비활성은 일반 관용 패턴일 수 있음. 별도 청구항 비교 대상 없음.

## 롤백
```bat
restore-security-hardening.bat
```
