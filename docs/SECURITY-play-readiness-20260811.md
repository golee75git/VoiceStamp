# Play 스토어 게시 준비 — 통합 점검 보고서 (2026-08-11)

| 항목 | 내용 |
|------|------|
| 작성 | 2026-08-11 |
| 성격 | **보고서만** — 코드 변경 없음. 저작권 미확인 항목은 **검토 보류**로 표시 |
| 관련 | [LEG-05-STORE-LISTING.md](./LEG-05-STORE-LISTING.md) · [PLAY-STORE-QA.md](./PLAY-STORE-QA.md) · [PLAY-DATA-SAFETY.md](./PLAY-DATA-SAFETY.md) · [RELEASE-CHANNELS.md](./RELEASE-CHANNELS.md) · [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) |

이미 진행된 LEG-05 인프라(스토어 문구 초안, QA 런북, Data safety 초안, `eas.json` production 프로필, keystore 생성 스크립트)는 **중복 정리하지 않고 링크만** 겁니다. 이 문서는 그 문서들이 다루지 않은 **① 백엔드 보안 취약점**, **② 저작권 미확인 항목**을 추가로 확인해 Production 전 **차단 항목(blocker)**으로 명시하는 것이 목적입니다.

---

## 1. 요약 — Production 전 신규 차단 항목

| # | 항목 | 심각도 | 상태 |
|---|------|--------|------|
| S1 | `api/project.js` `ncpProbe` 액션 무인증 노출 | 🔴 높음 | **수정됨** `404 gone` (2026-08-11) |
| S2 | `collectorPin` 브루트포스 방어 없음 | 🔴 높음 | **수정됨** 실패 레이트리밋 + 신규 6자리 |
| S3 | `action=create`에 Origin·레이트리밋 없음 | 🟡 중간 | 미수정 |
| S4 | 500 에러 응답에 내부 정보 노출 | 🟡 중간 | **완화** detail만, bucket/prefix/hint 제거 |
| S5 | `PROJECT_PIN_SALT` 기본값이 소스에 하드코딩 | 🟡 중간 | Vercel env 설정 여부 확인 필요 |
| C1 | 앱 아이콘·온보딩 UI PNG 출처 미확인 | 🟡 중간 | **검토 보류** |
| C2 | `assets/zoom.png` 배지 출처 미확인 | 🟢 낮음 | **검토 보류** |
| C3 | `public/templates/report.hwpx` 템플릿 출처 미확인 | 🟡 중간 | **검토 보류** |

기존 LEG-05/QA 문서의 체크리스트(keystore, EAS 빌드, Console 업로드 등)는 §4에 상태만 재정리했습니다.

---

## 2. 보안 취약점 상세 (`api/project.js`)

이 API는 "사업 QR 취합" 기능(선택·옵트인)의 백엔드로, NCP Object Storage에 사진·메모를 저장합니다. `docs/PLAY-DATA-SAFETY.md`에 이 기능이 Data safety 콘솔 입력 대상으로 이미 올라가 있는데, 아래 취약점들은 그 데이터 취급 안전성에 직접 영향을 줍니다.

### S1. `ncpProbe` 액션 — 인증 없이 크리덴셜 일부·쓰기 권한 노출 (🔴 높음)
- 위치: `api/project.js:990-1010`, `ncpListProbe`/`ncpProbePutVariants` (512~613행)
- 누구든 `POST /api/project {"action":"ncpProbe"}` 한 번이면:
  - 응답으로 **버킷명, 액세스 키 앞 6자리, 액세스/시크릿 키 길이**를 받음
  - 서버가 실제로 **NCP 버킷에 PUT/DELETE(쓰기)를 여러 조합으로 라이브 시도**함
- 개발 중 SigV4 서명 방식(path/virtual, hash/unsigned) 디버깅용으로 만든 진단 엔드포인트가 배포에 그대로 남아있는 형태. `docs/SECURITY-ncp-project-qr-20260807.md`에도 "비밀키는 노출하지 않음"이라고만 되어 있고 이 액션 자체의 인증 부재는 언급 없음.
- **권장 조치**: 프로덕션에서 제거하거나, 관리자 전용 시크릿 헤더(예: `x-admin-token` + Vercel env 비교)로 보호.

### S2. `collectorPin` 브루트포스 방어 없음 (🔴 높음)
- 위치: `api/project.js:651-657` (`assertCollectorPin`), `manifest`/`downloadUrl`/`importAck`/`close`/`rotateUploadCode`/`setInviteTemplate` 액션 전체
- `collectorPin`은 생성 시 `/^\d{4,6}$/`만 검증(688~694행) — 4자리면 10,000가지뿐.
- 이 PIN 하나로 프로젝트의 **사진 열람·다운로드(downloadUrl), 삭제(importAck), 종료(close), 업로드 코드 재발급(rotateUploadCode)** 전부를 인증하는데, 시도 횟수 제한이나 잠금이 전혀 없음.
- `projectId`(`VS-YYYYMMDD-XXXX`, 랜덤부 4자 = 32^4 ≈ 105만 조합)도 QR 캡처·URL 공유로 새어나갈 수 있음.
- **위험**: projectId + PIN 4자리 온라인 브루트포스로 수집자 권한 탈취 → 참가자 사진/메모(개인정보 포함 가능)가 노출·삭제될 수 있음. `PLAY-DATA-SAFETY.md`에서 이 데이터는 "옵트인 클라우드"로 설명되는데, 실제로는 접근 통제가 취약한 상태.
- **권장 조치**: PIN 검증에 IP 또는 projectId 기준 레이트리밋(예: `api/visitor.js`의 `allowPost` 패턴 재사용) 추가, 또는 PIN 최소 자리수를 6자리로 상향.

### S3. `action=create`에 Origin 체크·레이트리밋 없음 (🟡 중간)
- 위치: `api/project.js:687-719`
- `api/visitor.js`는 Origin 검증(`isAllowedPostOrigin`) + IP당 분당 20회 제한이 있는데, `project.js`의 `create`(NCP에 오브젝트 2개 쓰기 발생)는 이런 제한이 전혀 없음.
- **위험**: 스토리지 비용 소모, 대량 프로젝트 생성 스팸.
- **권장 조치**: `visitor.js`와 동일한 IP 레이트리밋 패턴을 `create`에 추가.

### S4. 에러 응답에 내부 정보 과다 노출 (🟡 중간)
- 위치: `api/project.js:1013-1047`
- 500 에러 시 인증 없는 호출자에게 `bucket`, `accessKeyPrefix`, NCP 원본 에러 본문(`hint`, 최대 200자), 서명 스타일(`style`)을 반환.
- `docs/SECURITY-ncp-project-qr-20260807.md`에 "운영 진단만 돕고, 비밀키는 노출하지 않음"이라고 명시된 의도된 동작이지만, 실제로는 **인증 없이 누구나** 볼 수 있어 정찰(recon) 정보로 악용될 수 있음.
- **권장 조치**: 상세 정보는 서버 로그(`console.error`)에만 남기고, 클라이언트 응답은 `{error: 'server_error'}` 수준으로 축소. 필요 시 관리자 전용 디버그 모드로 분리.

### S5. `PROJECT_PIN_SALT` 기본값 하드코딩 (🟡 중간 — 설정 확인 필요)
- 위치: `api/project.js:122-125`
- `process.env.PROJECT_PIN_SALT || 'voicestamp-project-v1'` — Vercel에 이 환경변수를 설정하지 않았다면 salt가 공개 GitHub 저장소에 그대로 노출된 고정값으로 동작.
- 버킷 ACL 오설정 등으로 `project.json`(PIN/업로드코드 해시 포함)이 노출될 경우, 기본 salt를 쓰고 있었다면 오프라인에서 PIN·업로드코드를 즉시 역산 가능.
- **권장 조치**: **Vercel 프로젝트 환경변수에 `PROJECT_PIN_SALT`가 실제로 랜덤값으로 설정되어 있는지 지금 바로 확인.** (이건 코드 수정이 아니라 운영자가 Vercel 대시보드에서 1회 확인/설정하면 됨.)

### 참고 — 낮은 우선순위
- `prepareUpload`가 `putUrl`(content-type 서명됨)과 `putUrlPlain`(서명 안 됨) 둘 다 발급 — uploadCode 보유자가 `.jpg` 키에 임의 content-type으로 업로드 가능한 이론적 리스크. 즉시 차단 필요는 아님.
- `npm audit` (기존 점검 결과 유지): 프로덕션 런타임에 직접 노출되는 심각한 항목 없음. postcss/nanoid/shell-quote/exceljs→uuid는 빌드 툴체인·EAS 관련. `npm audit fix`(breaking 없는 것)로 정리 가능.
- `.env`는 git 이력에 커밋된 적 없음 — 양호.

---

## 3. 저작권 — 미확인 항목 (검토 보류)

`docs/LICENSE-NOTICE.md`의 §6 "UI·에셋 (별도 확인 권장)"에 이미 목록화되어 있던 항목들입니다. 코드만으로는 실제 제작 경위(직접 제작/구매/AI 생성/무료 소스 다운로드)를 알 수 없어 **자체 제작으로 임의 확정하지 않고 아래를 미결(pending)로 남깁니다.**

| 항목 | 경로 | 확인 필요 사항 |
|------|------|----------------|
| 앱 아이콘 | `assets/icon.png`, `assets/android-icon-*.png` | 제작 경위(직접 제작/외주/AI 생성 도구 이용약관) |
| 온보딩·UI PNG | `img/`, `assets/` 하위 다수 | 각 이미지 출처 |
| 확대/수정 배지 | `assets/zoom.png` | LICENSE-NOTICE에 "VoiceStamp UI용, Copyright © 2026 이형우"로 이미 기재되어 있으나 원본 제작 도구·소스 확인 권장 |
| HWPX 리포트 템플릿 | ~~`public/templates/report.hwpx` 출처 미확인~~ → **자체 생성** `vs-form.hwpx` (2026-08-18) | VoiceStamp 스크립트가 자리 표시만 넣은 껍데기. 외부 예제 미사용 |

**Play 스토어 게시 자체에는 앱 아이콘 등이 필수이므로 게시를 막지는 않지만**, 저작권 분쟁 리스크를 낮추려면 Production 전환 전에 각 파일에 대해 "내가 직접 만들었다 / 어디서 가져왔다"를 확인해 `docs/LICENSE-NOTICE.md` §6에 결론을 기록하는 것을 권장합니다. (MIT 소프트웨어 라이선스·OSS dual-license 검토는 이미 §3에서 확정되어 있어 문제 없음.)

---

## 4. Play 스토어 체크리스트 (기존 문서 상태 재확인 — 신규 항목 없음)

`RELEASE-CHANNELS.md` §5, `PLAY-STORE-QA.md` §6 체크리스트를 하나로 합쳐 현재 상태만 재확인했습니다. 실행 순서는 두 문서의 §6 그대로입니다.

### 완료 (문서·인프라)
- [x] `eas.json` `production` AAB 프로필 + `submit` internal draft
- [x] versionCode 정책 = EAS remote + autoIncrement (문서화 완료)
- [x] 업로드 keystore 생성 스크립트 (`scripts/create-upload-keystore.bat`)
- [x] 패키지·키 정책 문서화 (Play 전용 키 / 테스터 debug 키 분리)
- [x] 스토어 문구·스크린샷 가이드 초안 (`LEG-05-STORE-LISTING.md`)
- [x] Data safety 응답 가이드 초안 (`PLAY-DATA-SAFETY.md`)

### 남은 작업 — 운영자(실기기·Google 계정·서명키 필요, 이번 요청 범위 아님)
- [ ] 업로드 keystore 실제 생성 + 금고 백업
- [ ] Play App Signing 등록
- [ ] `eas credentials` 설정 + production AAB 1회 빌드
- [ ] Internal testing 설치 + APK/AAB 기능 동등성 확인 (`PLAY-STORE-QA.md` §3)
- [ ] Phase 0 P0 스모크 표 전수 Pass (`PLAY-STORE-QA.md` §1, 실기기)
- [ ] 스크린샷 촬영 + LEG-05 문구 콘솔 반영
- [ ] Data safety 콘솔 입력 (`/privacy` 최신본과 일치 확인)
- [ ] `LICENSE-NOTICE.md` 배포 단계 「베타」→「Play」 갱신 (Production 당일)
- [ ] Production 전환 + 랜딩 Play CTA

### 신규 — 이번 점검에서 추가된 항목 (Production 전 처리 권장)
- [ ] S1~S5 보안 취약점 수정 (§2) — 특히 S1, S2는 Production 전 필수 권장
- [x] C3 HWPX 서식 — 2026-08-18 자체 생성으로 정리 (`vs-form.hwpx`)
- [ ] C1~C2 아이콘·온보딩 PNG 출처 확인 후 `LICENSE-NOTICE.md` §6 갱신

---

## 5. 다음 단계 제안

1. **S1(ncpProbe), S2(PIN 브루트포스)** 는 실제 참가자 데이터를 다루는 라이브 엔드포인트에 존재하는 결함이라 우선순위가 가장 높습니다. 코드 수정을 원하시면 말씀해 주세요 — `api.pre-security-hardening/` 스냅샷 + `restore-security-hardening.bat`을 만들어 프로젝트 관례대로 되돌릴 수 있게 진행하겠습니다.
2. **S5**는 코드 변경 없이 Vercel 대시보드에서 `PROJECT_PIN_SALT` 값 설정 여부만 확인하면 됩니다.
3. **C1~C3**는 이형우 님만 답할 수 있는 정보이므로, 확인되는 대로 `LICENSE-NOTICE.md` §6에 반영해 드리겠습니다.
4. 나머지 체크리스트(§4 "남은 작업")는 실기기·Google Play Console 접근이 필요해 별도로 운영자가 직접 진행하시면 됩니다.

특허 비침해 보장 없음. 본 문서는 보안·라이선스·QA 정리이며 법무 확정이 아닙니다.
