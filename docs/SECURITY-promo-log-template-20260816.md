# 보안·라이선스·특허 점검 — 홍보기록 기본 템플릿 (2026-08-16)

## 변경 요약
- 기본 저장 템플릿에 「홍보기록」추가 (`id: promo-log`).
- 칸 표시명: 홍보명·장소·홍보내용·채널·대상·단계.
- QR URL 설정·JPEG QR 렌더는 변경하지 않음. 안내 사진은 기존 설정 → 사진 URL → QR과 함께 쓰면 됨.
- 신규 네트워크·권한·패키지 없음. 기존 `STAMP_FIELD_TEMPLATES` 배열만 확장.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-promo-log-template.bat`, 본 문서 |
| **재사용·수정** | `src/services/stampFieldTemplates.ts`, `public/help.html`, `RESTORE.md` |
| **스냅샷** | `src.pre-promo-log-template/`, `public.pre-promo-log-template/` |

## 글꼴 (OFL)
- 폰트 파일(`.ttf`/`.otf`/웹폰트) 추가 없음.
- 앱 UI는 시스템 글꼴만 사용. 프로젝트에 OFL 번들 폰트 파일이 없으며, 이번 변경으로 글꼴 자산을 건드리지 않음.

## 의존성·GPL
- 신규 npm/Gradle 없음.
- GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) — jszip MIT, node-forge BSD-3-Clause.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한 | 변경 없음 |
| 네트워크 | 변경 없음 |
| 데이터 | 기기 내 기존 템플릿 적용 경로만 사용. 서버·NCP 메타 추가 없음 |
| Data safety | 기존과 동일. 신규 수집 없음 |
| Play | 스토어 권한·데이터 유형 변경 없음 |

## 저작권·독자성
- VoiceStamp 기존 기본 템플릿 배열 확장. 외부 구현 복사 없음.
- 식별자 `promo-log`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 필드 표시명 프리셋은 일반 폼 UX 수준.
- **특허 비침해를 보장하지 않음.**
- 청구항 대조가 필요하면 법무에서 별도 검토.

## 롤백
`restore-promo-log-template.bat`
