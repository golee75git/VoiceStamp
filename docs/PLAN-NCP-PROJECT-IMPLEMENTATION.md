# FEAT-NCP-PROJECT-01 — 구현 계획

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2026-08-07 |
| 상태 | 📋 **계획만** (`src/` 변경 없음) |
| 기능 ID | **FEAT-NCP-PROJECT-01** |
| UI 스펙 | [DESIGN-NCP-PROJECT-QR-UI-20260807.md](./DESIGN-NCP-PROJECT-QR-UI-20260807.md) (v1.1) |
| 인프라 기반 | [PLAN.md](./PLAN.md) §12 `FEAT-03-NCP` |
| 스토리지 | NCP Object Storage `kr-standard` · TTL 기본 7일 |

> 본 문서는 구현 순서·산출물·리스크·완료 정의만 다룬다.  
> 구현 착수 시 `src.pre-ncp-project-qr/` + `restore-ncp-project-qr.bat` + `RESTORE.md` 절을 추가한다.

---

## 1. 목표 요약

```text
촬영자: QR 1회 → 저장 시 자동 업로드(압축 JPEG+메타)
관리자: 수신 → 사업 폴더로 내 폰에 가져오기 → 취합 엑셀(기존 XLSX)
클라우드: 일시 중계만 (TTL / ack 삭제). 영구 아카이브 아님.
```

| UX ID | 구현 반영 |
|-------|-----------|
| U1–U5 | QR·자동 업로드·opt-in·로컬 우선 |
| U6 | import 시 `groupName` = 날짜_사업명 또는 사업명 |
| U7–U8 | 로컬 모은 뒤 기존 `exportXlsx`로 **새** XLSX |

---

## 2. 전제·제약

| 항목 | 내용 |
|------|------|
| 최소 수정 | `MainScreen` screen enum 확장, 설정 key-value, 기존 내보내기 재사용 |
| 외부 라이브러리 | **신규 추가 금지** (필요 시 사전 라이선스 보고만). QR은 기존 `qrcode` / `qrCodeService` 재사용 |
| 글꼴 | 신규 UI 문구만. 새 글꼴 파일 추가 없음 |
| GPL | 신규 GPL 의존성 도입 금지 |
| 네비 | React Navigation 추가 없음 |
| 엑셀 | `src/services/exportXlsx.ts` · on-demand import 패턴 유지 |

---

## 3. 단계 (P0–P8)

| 단계 | 내용 | 산출물 | 의존 |
|------|------|--------|------|
| **P0** | 문서 확정 (UI 1.1 + 본 계획) | 본 MD · DESIGN v1.1 | — |
| **P1** | NCP 버킷·API Gateway·Cloud Function | `docs/NCP-PROJECT-SETUP.md` (신규) | NCP 계정 |
| **P2** | 설정 키·`deviceId`·마스터 스위치·S0–S1 뼈대 | 설정 섹션 + Hub (스텁 API 가능) | P0 |
| **P3** | S2 만들기 + S3 QR + PIN SecureStore | 관리자 QR UX | P1, P2 |
| **P4** | S4 참여 + `saveStamp` 후 업로드 큐 | 촬영자 자동 올리기 | P1, P3 |
| **P5** | S5 수신 + **내 폰으로**(폴더 규칙) + 목록 뱃지 | 로컬 취합 (U6) | P1, P4 |
| **P6** | **취합 엑셀** — S1 CTA · S5 엑셀 · 폴더 필터 | U7–U8 | P5 |
| **P7** | TTL·ack 삭제·코드 재발급·PRIVACY·help | 운영·법무 | P5 |
| **P8** | APK·현장 스모크 (관리 1 + 촬영 2) | 검증 체크리스트 | P6–P7 |

권장 병렬: **P1(인프라)** ‖ **P2(UI 뼈대)**.

---

## 4. P1 API 체크리스트

| Method | Path | 역할 |
|--------|------|------|
| POST | `/project/create` | 사업·uploadCode·TTL |
| POST | `/project/presign-put` | 촬영자 PUT |
| POST | `/project/complete` | 메타·manifest |
| GET | `/project/manifest` | 관리자 목록 |
| POST | `/project/presign-get` | 관리자 GET |
| POST | `/project/import-ack` | 가져온 뒤 삭제(선택) |
| POST | `/project/close` | 사업 종료 |
| POST | `/project/rotate-upload-code` | QR 재발급 |

보안:

- Access Key는 Function 환경변수만  
- 업로드 코드 ≠ 취합 PIN  
- `objectKey` prefix 강제: `voicestamp/projects/{projectId}/`  
- 버킷 Private · Presign 만료 ~15분  

---

## 5. P5–P6 상세 (폴더·엑셀)

### 5.1 내 폰으로 (P5)

1. manifest 선택분 → presign-get → cache 파일  
2. `persistImage` + `insertStamp`  
3. `groupName`:
   - 기본: `YYYYMMDD_{sanitize(사업명)}` (가져오기 시각 또는 사업 생성일 — **구현 시 하나로 고정**, UI 미리보기와 동일)
   - 대안 칩: `sanitize(사업명)`만  
4. (옵션) `import-ack`로 서버 오브젝트 삭제  
5. `refreshKey` bump  

### 5.2 취합 엑셀 (P6)

1. 로컬에서 `groupName == 사업폴더` (또는 수신함「가져옴」id 집합) 조회  
2. 기존 파일명 모달 — 기본값 `{사업명}_취합_{yyyyMMdd}`  
3. `createStampsXlsx` → `shareStampsXlsx`  
4. **append 없음** — 이후 추가 수신분은 다시 가져와 새 파일 생성  

미import 선택 시 엑셀 CTA: UI 스펙 `excel_need_import` 안내.

---

## 6. 앱 파일 후보 (구현 시)

| 구분 | 경로 | 비고 |
|------|------|------|
| 신규 | `ProjectHubScreen.tsx` 등 S1–S5 | DESIGN §12 |
| 신규 | `ncpProjectService.ts`, `projectUploadQueue.ts` | Presign·큐 |
| 수정 | `MainScreen.tsx` | screen + BackHandler |
| 수정 | `SettingsScreen.tsx` | S0 섹션 |
| 수정 | `saveStamp.ts` / 저장 성공 경로 | 큐 push |
| 수정 | `StampListScreen.tsx` | 뱃지·필터(최소) |
| 재사용 | `exportXlsx.ts`, `qrCodeService.ts`, `exportOnDemand.ts` | 신규 로직 금지에 가깝게 |
| 설정 | `settingsService.ts` | DESIGN §4 키 |

되돌리기: `src.pre-ncp-project-qr/` → `restore-ncp-project-qr.bat`.

---

## 7. 설정 키 (구현 시 `app_settings`)

DESIGN §4와 동일. 요약:

- `project_collect_enabled` (default false)  
- `device_id`, `project_join_*`, `project_auto_upload`, `project_wifi_only`  
- `project_owned_json`  
- PIN: SecureStore `project_pin_{projectId}`  
- import 폴더 방식: `project_import_folder_mode` = `date_name` \| `name_only` (default `date_name`)

---

## 8. 보안·개인정보·스토어

| 항목 | 조치 |
|------|------|
| 비밀키 | 앱·git 금지 |
| QR | uploadCode만. PIN 미포함 |
| 동의 | S4 확인 시트 필수 |
| PRIVACY | §3 일시 중계·TTL·한국 리전 |
| Play | 데이터 안전성: 선택적 수집·일시·사용자 개시 전송 명시 |
| 특허 | Presigned·QR 참여는 일반 패턴. **특허 비침해 보장 문구 사용 금지**. 특이 청구항 검토 필요 시 별도 기록 |

취약점 주의:

- 업로드 코드 무제한 추측 → rate limit·코드 엔트로피  
- manifest IDOR → collectorPin 필수  
- 만료 사업 PUT 거부  

---

## 9. 리스크·완화

| 리스크 | 완화 |
|--------|------|
| NCP 미개설 | P2 UI 스텁, P1 병렬 |
| 다량 엑셀 OOM | 기존 바이너리 경로·장수 경고 |
| 폴더명 충돌 | sanitize + 날짜 prefix 기본 |
| QR 카메라 권한 | S4 코드 입력 탭 |
| 현장 망 | wifi_only·큐 재시도 |

---

## 10. 검증 (P8)

| # | 시나리오 |
|---|----------|
| 1 | 마스터 OFF → 업로드·QR 진입 불가 |
| 2 | 촬영 2대 QR 참여 → 각 1장 저장 → 관리자 수신 2건 |
| 3 | 내 폰으로 → 목록에 사업 폴더로 보임 |
| 4 | 취합 엑셀 → 썸네일·제목·메모 포함, 새 파일 |
| 5 | TTL/종료 후 PUT 실패 안내 |
| 6 | 코드 재발급 후 옛 QR 거부 |
| 7 | `restore-ncp-project-qr.bat`로 소스 복원 가능 |

---

## 11. 완료 정의 (MVP)

1. QR 1회 참여 후 저장 시 자동 업로드  
2. 관리자 수신 → 사업 폴더로 로컬 저장  
3. 해당 폴더 기준 **엑셀 1파일**로 사진+설명 취합 공유  
4. 기본 7일(또는 종료) 후 중계 삭제 · 기본 OFF 시 전송 없음  
5. PRIVACY·도움말 문구 반영  
6. 되돌리기 bat 동작  

---

## 12. 문서·배포 (구현 완료 시)

| 작업 | 대상 |
|------|------|
| PRD·PROJECT·PLAN §4.5 한 줄 | 기능 ID 상태 |
| RESTORE.md | restore 절 |
| help / PRIVACY | 사용자 문구 |
| APK·Vercel·커밋 | 구현 라운드에서만 (본 계획 작성 시점에는 수행하지 않음) |

---

## 13. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-08-07 | 구현 계획 1.0 — P0–P8 · 폴더·엑셀 · 소스 변경 없음 |
