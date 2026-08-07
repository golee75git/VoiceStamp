# 보안·라이선스·특허 점검 — 사업 QR 일시 취합 설계 (2026-08-07)

## 변경 요약
- **문서만.** `src/`·네이티브·APK 미변경.
- FEAT-NCP-PROJECT-01: QR 1회 참여 + NCP Object Storage(`kr-standard`) 일시 중계 + 관리자 수신→사업 폴더→취합 엑셀 UI/구현 계획.
- 구현 착수 전 취약점·Play·라이선스 기준을 설계 단계에 고정.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `docs/DESIGN-NCP-PROJECT-QR-UI-20260807.md`, `docs/PLAN-NCP-PROJECT-IMPLEMENTATION.md`, 본 문서 |
| **재사용·수정(문서)** | `docs/PLAN.md` §4.5, `docs/README.md`, `docs/PRD.md`(로드맵 행) |
| **재사용 예정(구현 시·코드 미손)** | `exportXlsx.ts`, `qrCodeService.ts`, `exportOnDemand.ts`, `MainScreen` 화면 전환, `settingsService` |
| **src/** | **변경 없음** |

## 글꼴 (OFL)
- 폰트 파일·웹폰트 **추가 없음**.
- 앱은 기존과 같이 **시스템 UI 글꼴**만 사용 (도움말 「시스템 글꼴」정책과 동일).
- 설계·구현 계획에 신규 OFL 번들 요구 없음.

## 의존성·GPL
- **신규 npm/Gradle 없음** (본 라운드·설계 기준).
- 구현 시에도 신규 라이브러리 추가 금지(필요 시 사전 보고만). QR·엑셀은 기존 `qrcode`(MIT)·`exceljs` 재사용 예정.
- `jszip`은 기존과 같이 **MIT 경로만** 사용 ([LICENSE-NOTICE.md](./LICENSE-NOTICE.md)). GPL 경로 미선택.
- 본 설계로 GPL copyleft 확산 **도입 없음**.

## 취약점·보안·Play Store (설계 기준)

| 항목 | 결과 / 구현 시 필수 |
|------|---------------------|
| 비밀키 | NCP Access Key는 Cloud Function 환경변수만. 앱·git 금지 |
| QR 내용 | `projectId` + **uploadCode만**. 취합 PIN 미포함 |
| 권한 분리 | uploadCode = PUT만 / collectorPin = GET·삭제·종료 |
| objectKey | prefix `voicestamp/projects/{projectId}/` 서버 강제 |
| Presign | 만료 ~15분, 버킷 Private |
| 추측 공격 | uploadCode 엔트로피 + API rate limit |
| IDOR | manifest/GET에 collectorPin 필수 |
| 동의 | 참여 확인 시트 없이 딥링크 자동 연결 금지 |
| TTL | 기본 7일·사업 종료·import-ack로 중계 삭제 |
| 기본값 | 마스터 OFF = 네트워크 전송 없음 |
| Data safety (Play) | 구현 시: 선택적 수집, 사용자 개시, 일시 보관, 한국 리전 명시. PRIVACY.md 갱신 |
| 네트워크 | 설계상 신규 전송은 opt-in 사업 연결 후에만 |

## 저작권·독자성
- VoiceStamp 자체 저장 목록·설정·내보내기·QR 캡션 패턴을 확장하는 **독자 설계**.
- 외부 협업/현장앱·GitHub·특허 문서 구현을 복사·번역·변형하지 않음.
- UI 카피 「사업 취합」「일시 저장소(한국)」「내 폰으로」「취합 엑셀」등은 본 프로젝트 문구.

## 특허 검토 메모 (보장 아님)
- QR로 방에 참여·Presigned 업로드·TTL 삭제는 일반적 클라우드 패턴일 수 있음.
- **특허 비침해를 보장하지 않음.** 상용화·스토어 전 필요 시 법무가 청구항 대비 검토.
- 실시간 공동편집·얼굴 클라우드 매칭·영구 서버 아카이브는 **범위 밖**.

## 헬스체크
- 번들 A/B/C 재적용 없음. 본 라운드 소스 미변경 → 성능 회귀 없음.
- 구현 시 업로드 큐·엑셀은 기존 on-demand/바이너리 경로 재사용 (HEALTHCHECK 회귀만).

## 롤백
- 문서만: git revert 해당 커밋.
- 구현 시(예정): `src.pre-ncp-project-qr/` + `restore-ncp-project-qr.bat`.

## L1–L31 적용 메모 (본 라운드)
| 항목 | 처리 |
|------|------|
| L24 도움말 | **기능 미구현** → help에 미노출(허위 안내 방지). 구현 P7에서 갱신 |
| L26–L29 APK·랜딩 URL | 소스 미변경 → **APK 재빌드·교체 생략** (동일 바이너리) |
| L30 설정 APK 파일명 | 이미 `APK_BUILD_FILENAME` 표시됨. 본 라운드 추가 수정 없음 |
