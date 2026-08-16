# VoiceStamp 문서

프로젝트 문서 모음입니다. **소스 코드는 `src/`**, 되돌리기·빌드는 루트의 MD·BAT를 참고하세요.

---

## 문서 목록

| 문서 | 대상 | 설명 |
|------|------|------|
| [CHANGELOG.md](./CHANGELOG.md) | 전체 | **날짜별·APK별** 최근 변경 요약 (권장 APK 포함) |
| [RELEASE-CHANNELS.md](./RELEASE-CHANNELS.md) | 배포 | 테스터 APK vs Play 스토어 · 서명·버전 정책 |
| [PLAY-STORE-QA.md](./PLAY-STORE-QA.md) | 배포·QA | Play 본격 테스트·AAB·Internal 동등성 런북 |
| [PLAY-DATA-SAFETY.md](./PLAY-DATA-SAFETY.md) | 배포·법무 | Play Console Data safety 초안 |
| [LEG-05-STORE-LISTING.md](./LEG-05-STORE-LISTING.md) | 배포 | LEG-05 스크린샷·스토어 문구 초안 |
| [HEALTHCHECK.md](./HEALTHCHECK.md) | 개발·QA | **성능·헬스체크 고정 기준** (번들 A/B/C 적용됨 · 다음 후보) |
| [PRD.md](./PRD.md) | 기획·QA | 요구사항, 기능 ID, **§12 날짜별** · **§13 APK별** 요약 |
| [PROJECT.md](./PROJECT.md) | 개발 | 구현 이력, **§7.4 APK 빌드별 상세**, **§12 날짜별 커밋** |
| [PLAN.md](./PLAN.md) | 기획·개발 | 단계·완료 기능, **§10 날짜별** · **§11 APK별** |
| [DESIGN-INFO-PAGES.md](./DESIGN-INFO-PAGES.md) | 기획·UI | LEG-04 정책 페이지 설계·구현 (`a4a55d2`) |
| [DESIGN-ML-KIT-SCENE-LABEL.md](./DESIGN-ML-KIT-SCENE-LABEL.md) | 기획·AI | **AI-ML-01** ML Kit 장면 키워드 (재도입 `06ae8e2` / `114802`) |
| [DESIGN-PRIVACY-BLUR.md](./DESIGN-PRIVACY-BLUR.md) | 기획·AI | **AI-ML-02** 온디바이스 얼굴·숫자 **블러** MVP 설계·구현 기준 |
| [DESIGN-ML-KIT-OCR-TITLE.md](./DESIGN-ML-KIT-OCR-TITLE.md) | 기획·AI | **AI-ML-03** OCR→제목·메모 초안 (**MVP** `8b74ccf` / `104328`) |
| [DESIGN-GOOGLE-SHEETS-UPLOAD.md](./DESIGN-GOOGLE-SHEETS-UPLOAD.md) | 기획·연동 | **GS-UPLOAD-01** 공용 시트 원클릭·압축 업로드 **초안** (앱 미연동) |
| [DESIGN-NCP-PROJECT-QR-UI-20260807.md](./DESIGN-NCP-PROJECT-QR-UI-20260807.md) | 기획·UI | **FEAT-NCP-PROJECT-01** 사업 QR·일시 취합 UI 스펙 |
| [PLAN-NCP-PROJECT-IMPLEMENTATION.md](./PLAN-NCP-PROJECT-IMPLEMENTATION.md) | 계획 | **FEAT-NCP-PROJECT-01** 구현 단계 — **앱 연동됨**(2026-08-07~) |
| [SECURITY-ncp-project-qr-20260807.md](./SECURITY-ncp-project-qr-20260807.md) | 보안·법무 | **FEAT-NCP-PROJECT-01** OFL·GPL·취약점·Play·특허 메모 (문서만) |
| [SECURITY-join-kakao-fallback-20260811.md](./SECURITY-join-kakao-fallback-20260811.md) | 보안·UX | 카톡 `/join` 자동 intent·메인 fallback 수정 |
| [SECURITY-mainint1-refresh-20260811.md](./SECURITY-mainint1-refresh-20260811.md) | 보안·에셋 | 왼손 홈 `mainint1.png` 교체 (로직 없음) |
| [SECURITY-collect-tx-badge-20260811.md](./SECURITY-collect-tx-badge-20260811.md) | 보안·UX | 취합전송 칩 확대 · QR 안내를 설정으로 이동 |
| [SECURITY-collect-join-banner-20260811.md](./SECURITY-collect-join-banner-20260811.md) | 보안·UX | 취합 중 카메라 홈·저장 직전 안내 |
| [SECURITY-landing-utf8-fix-20260811.md](./SECURITY-landing-utf8-fix-20260811.md) | 보안·웹 | 랜딩 UTF-8/`</title>` 깨짐 복구 |
| [SECURITY-collect-banner-shutter-20260812.md](./SECURITY-collect-banner-shutter-20260812.md) | 보안·UX | 취합 중 배너를 촬영 버튼 위로 |
| [SECURITY-collect-banner-copy-20260812.md](./SECURITY-collect-banner-copy-20260812.md) | 보안·UX | 카메라 홈 「이 사업으로 전송」 문구 |
| [SECURITY-collect-back-hit-20260812.md](./SECURITY-collect-back-hit-20260812.md) | 보안·UX | 사업 취합 큰 뒤로 + 시스템 뒤로 |
| [SECURITY-inbox-import-progress-20260812.md](./SECURITY-inbox-import-progress-20260812.md) | 보안·UX | 수신 가져오기 진행 n/전체 |
| [SECURITY-import-progress-inset-20260812.md](./SECURITY-import-progress-inset-20260812.md) | 보안·UX | 가져오기 진행 표시 시스템 내비 회피 |
| [SECURITY-collect-press-feedback-20260812.md](./SECURITY-collect-press-feedback-20260812.md) | 보안·UX | 사업 취합 버튼 눌림 표시 |
| [SECURITY-collect-link-flag-20260812.md](./SECURITY-collect-link-flag-20260812.md) | 보안·UX | 카메라 취합 vs 공유링크 플래그 분리 |
| [SECURITY-join-app-links-20260812.md](./SECURITY-join-app-links-20260812.md) | 보안·딥링크 | App Links·매니페스트 join 필터 |
| [SECURITY-ux-friendly-basics-20260812.md](./SECURITY-ux-friendly-basics-20260812.md) | 보안·UX | 온보딩 3컷·설정 고급 접기 |
| [SECURITY-collect-save-feedback-20260812.md](./SECURITY-collect-save-feedback-20260812.md) | 보안·UX | 취합 연결 원패스·저장/업로드 피드백 |
| [SECURITY-inbox-pick-mark-20260814.md](./SECURITY-inbox-pick-mark-20260814.md) | 보안·UX | 수신함 하단 고름 표시·엑셀 미선택 안내 |
| [SECURITY-xlsx-row-fill-20260816.md](./SECURITY-xlsx-row-fill-20260816.md) | 보안·UX | 엑셀 5장 이상 가로 막대 |
| [drafts/google-sheets-upload/README.md](./drafts/google-sheets-upload/README.md) | 기획·연동 | Apps Script `Code.gs`·클라이언트 API·샘플 payload |
| [PRIVACY.md](./PRIVACY.md) | 배포·법무 | 개인정보 원본 (웹: `/privacy`) |
| [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) | 배포·법무 | OSS 고지·dual-license 검토 결론 (MIT/BSD 확정) |
| [KAKAO-KEY-SECURITY.md](./KAKAO-KEY-SECURITY.md) | 운영 | 카카오 REST API 키 체크리스트 |

## 루트 문서

| 문서 | 설명 |
|------|------|
| [../README.md](../README.md) | 실행 방법 요약 |
| [../LICENSE](../LICENSE) | MIT (Copyright 2026 이형우) |
| [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) | OSS·dual-license 검토 결론 |
| [../assets/open_source_licenses.json](../assets/open_source_licenses.json) | OSS 목록 (앱 설정에서 열람) |
| [../RESTORE.md](../RESTORE.md) | 기능별 되돌리기 (§1~211) |
| [../BUILD-APK.md](../BUILD-APK.md) | Android APK 빌드 가이드 |

---

## 현재 상태 스냅샷 (2026-08-14)

- **문서 갱신일:** 2026-08-14 — 수신함 고름 표시·엑셀 미선택 안내
- **최신 기능 커밋:** `e9f0bae` / APK `171058` — 수신함 하단 단추 고름 표시
- **배포 단계:** 베타·테스터 APK + Play Internal **인프라 준비** — [RELEASE-CHANNELS.md](./RELEASE-CHANNELS.md) · LEG-05 콘솔 반영은 미완
- **성능·헬스체크:** [HEALTHCHECK.md](./HEALTHCHECK.md) — A/B/C **누적 적용**, 기준선 APK `193317`, 다음 후보는 §2
- **웹:** https://voicestamp-gilt.vercel.app — **`/`** APK 안내·큰 **웹테스트**(`/app`) · 방문 집계 · **보안 헤더**·visitor POST 제한 · **QR·링크 공유**
- **정책:** `/privacy` · `/license` · `/help` · `/info` · [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) · [PLAY-DATA-SAFETY.md](./PLAY-DATA-SAFETY.md)
- **권장 APK (설치·GitHub):** `releases/VoiceStamp_20260814_171058.apk` — 수신함 고름 표시·엑셀 안내
- **APK raw URL (GitHub):** https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260814_171058.apk
- **이전 권장 APK:** `releases/VoiceStamp_20260810_105750.apk` — 엑셀 미리보기 px
- **이전 권장 APK:** `releases/VoiceStamp_20260810_102144.apk` — 조인 QR Modal
- **이전 권장 APK:** `releases/VoiceStamp_20260809_183720.apk` — 수신 「가져옴」매칭
- **이전 권장 APK:** `releases/VoiceStamp_20260808_231815.apk` — 수신 촬영자·엑셀 열
- **이전 권장 APK:** `releases/VoiceStamp_20260808_143848.apk` — 수신함 병합
- **이전 권장 APK:** `releases/VoiceStamp_20260801_193317.apk` — **성능 번들 C** (헬스체크 기준선)
- **비권장 APK:** `VoiceStamp_20260625_161125.apk` (`143a140`, 갤러리 경로 이슈)
- **사용 금지 APK:** `VoiceStamp_20260620_165718.apk` (`55c33df`, JSON seed — **부팅 멈춤**)
- **APK 다운로드:** `/` · `/info` → GitHub `releases/`
- **배포 금지 APK:** `VoiceStamp_20260609_173859.apk` (`6cf82f5` 크래시)
- **개선 후보(미구현·확장):** F-QR-01 **워터마크/PDF** 확장 · **GS-UPLOAD-01** 설계만 · LEG-05 Play 콘솔 업로드 · **AI-ML-02/03/01** ✅ MVP+

### 날짜별 요약

| 날짜 | 핵심 |
|------|------|
| 06-05 | 저장소 생성 |
| 06-06 | MVP·PDF·웹·위치·휴지통·갤러리 |
| 06-07 | PDF/JPEG·UI·Android 뒤로·아이콘 |
| 06-08 | 장소·폴더·갤러리·수정 UX |
| 06-09 | 스크롤 UX·**LEG-04**·목록 헤더 설정 |
| 06-10 | **저장 폴더 현장명 유지**·`/info` APK 링크 |
| 06-11 | **시스템 카메라**(줌)·워터마크 JPEG·**저장 시 갤러리 모드**·**학교 POI 위치**·**4단계 온보딩** |
| 06-12 | **캡션 네이티브**·흰 여백 PNG·온보딩 30일·설정 재생 |
| 06-13 | **GPS**·저장 미리보기·**줌/크롭**·갤러리 백그라운드·start·**웹 카메라**·**층 선택** |
| 06-14 | **이전 장소 캐시**·**좌표 표기**·음성 커서·저장 모달 UX·**워터마크 미리보기**·**층 표기·자동 제목(기본 날짜)**·NCP 백업 설계 |
| 06-15 | **프로젝트 ZIP·XLSX·HWPX**·웹 report·카메라 홈 스플래시·설정 UI |
| 06-16 | **카메라 홈 리디자인**·목록 **헤더·카드**·하단 **갤러리·촬영 캡슐 버튼**·**내비 여백 31px** |
| 06-17 | **워터마크**·/report JPEG·보라 아이콘·**10색 파스텔**·**기관명/하단 문구**·**설정 뒤로가기**·위치 revert·**학교 200m·건물명/도로명** |
| 06-19 | **`7b6b0c1` 문서 동기화** · **앱 내 OSS 라이선스**·LICENSE-NOTICE(베타)·LEG-06 |
| 06-20 | **로컬 학교 DB** → **`schools.sqlite`** (부팅 수정) · **목록 제목·메모 검색** |
| 06-21 | **좌표 없음=숨김** · **촬영 후 3버튼** · **연속 촬영 위치 재사용** |
| 06-22 | **GPS 프리페치** · **연속 인앱 카메라** · GitHub `094203` · **스플래시 flex 확대** |
| 06-23 | 웹 **휴지통 confirm** · **`/` APK 랜딩 + `/app`** · 랜딩 **개인정보·APK 권장** 안내 |
| 06-24 | **휴지통 비우기 화면** · 목록 **보내기 하단바**·헤더 축소 · 내비 31px · 비우기 후 **목록 복귀** · APK `094846` |
| 06-25 | 랜딩 **방문자 집계**·CountAPI · 저작권 · **도로·지번·POI** · 갤러리 **DISPLAY_NAME**·`_orig` · 캡션 **EXIF** · APK `171805` |
| 06-26 | **`place_label`** · **장소 마이크** · **음성 커서** · **도로+POI** · ML Kit **되돌림** · 랜딩 정리 · **3버튼 눌림·리플** · **위치 조회 끔** · 학교 **200m** · **층→장소** · **음성 수동 커서** · APK `233248` |
| 06-27 | 시스템 카메라 **busy 오버레이 깜빡임** · APK `092959` · 랜딩 **QR·Web Share** (qrcodejs MIT) |
| 07-01 | **위치 속도**·저장 **즉시 미리보기**·**촬영 후 모드** · **학교명만**·저장 **성능**·**처리 중 오버레이** · APK `165406`·`230340` |
| 07-03 | 갤러리 **앱만** · **위치 끔**이어도 **장소 입력** · PDF **캡션 너비**·**동일 photo-slot** · APK `162433` |
| 07-06 | 저장·수정 미리보기 **zoom 배지** · 목록 내보내기 **파일명·보고서 제목 모달** · APK `112756` |
| 07-09 | **직전 장소**·**일반 촬영 카메라**·**인앱 핀치/더블탭**·설정 **저장 고정**·**· 기본 칩**·**하단 바**·**빠른 로드** · APK `170409` |
| 07-10 | 앱 내 **1x·3x·5x**·**촬영음** · 확대 뷰어 **닫기·적용** 손잡이 하단 · APK `233524` |
| 07-11 | **층 school_only** · **목록 성능 A+B** · **목록 검색 음성** · **내보내기 파일명·제목 음성** · **위치 끔=GPS+학교** · **저장 손잡이** · APK `101055` |
| 07-13 | `/report` **행 삭제** · 프로젝트 ZIP **PDF 미포함** · **바이너리/청크 내보내기**(OOM) · **카메라 권한 확인 중 생략**(홈 즉시) · APK `231004` |
| 07-14 | **GS-UPLOAD-01** Google Sheets(공용 시트)·압축 사진·원클릭 업로드 **설계·초안만** (`docs/`) — **앱·APK 변경 없음** · 당시 권장 APK `231004` |
| 07-20 | **PDF → `YYYYMMDD_장소` 폴더 archive** · 도움말 · APK `225635` · Vercel |
| 07-21 | 크롭 뷰포트/라이브/UI-flush **시도 후 롤백** → **`225635` 크롭 동작 복구** · APK `235129` · Vercel |
| 07-22 | **필드 표시명**·**추가1·2**·표 · **자르기 적용 비활성** `170650` · **글자 크기** `182753` · Vercel |
| 07-23 | **저장 템플릿**·목록 표시 · 표·초록 테두리·**별도영역 이미지 흐림 수정** `185321` · Vercel · 문서 이력 보강 |
| 07-24 | **AI-ML-02** 블러 MVP `105355` · 해상도 비례 `111410` · **하단 촬영 일시** `114341` · **EXIF** `182721` · **전후면** · 문서 동기화 |
| 07-25 | 템플릿 **적용 중/사용자수정** `095546` · 가리기 **수동 영역** `101238` · **AI-ML-03** OCR `104328` · **AI-ML-01** 장면 `114802` |
| 07-27 | OCR **긴 메모 스크롤** · 웹 한도·저장 액션 나란히 |
| 07-28 | 카메라 홈·시작 **mainint/mainint1** · 배경 설정 · APK `105823`~`135843` |
| 07-30 | **F-QR-01** caption QR MVP · APK `114713` · 문서 동기화(소스 없음) |
| 07-31 | **F-CAM-27** 왼손 홈 테마(`094832`) · 랜딩 **웹테스트** · **QR URL 마이크·https://**(`102403`) · 웹 보안 hardening(`626c1a4`) · 본 문서 동기화 |
| 08-01 | **QR URL 연결확인**(`172149`) · **성능 번들 A/B/C**(`185512`→`191117`→`193317`) · **헬스체크 기준 고정** · 음성 타깃 가드(`232652`) · Vercel |
| 08-02 | 목록 플랫·행 높이 · 설정 필드 표시명 UI 제거 · 선택 취소 썸네일 · **저장 유형 필터** · APK `105935`→`214047` · [CHANGELOG.md](./CHANGELOG.md) |
| 08-03 | 웹 저장·장소 칩·항목 말하기 · APK `101849`→`161016` |
| 08-07 | **FEAT-NCP** 앱 연동 · APK `121056`~`233124` |
| 08-08 | 조인·배지·**수신함 병합** · NCP 직통·초대·엑셀 · APK `081515`~`231815` · RELEASE-CHANNELS |
| 08-09 | 목록 썸네일·취소 · 만든이 · 취합 배지·보낸 사진 · 홈 취합 · 가져옴 매칭 · APK `085617`~`183720` |
| 08-10 | 취합 사업명·전환 · QR Modal · 엑셀 px·800·글자 · APK `085356`~`113846` · **본 문서 동기화(소스 없음)** |
| 08-14 | 수신함 하단 **고름 표시**·엑셀 미선택 안내 · APK `171058` |

### APK별 (권장·주요)

> **2026-08-14:** 권장 파일은 **`VoiceStamp_20260814_171058.apk`** (`e9f0bae`). 요약: [CHANGELOG.md](./CHANGELOG.md).

| APK | 커밋 | 한 줄 |
|-----|------|--------|
| `releases/VoiceStamp_20260814_171058.apk` | `e9f0bae` | **설치·GitHub 권장** — 수신함 고름 표시·엑셀 안내 |
| `releases/VoiceStamp_20260810_113846.apk` | `dda285a` | **이전** — 엑셀 800칩·글자 작음/보통/큼 |
| `releases/VoiceStamp_20260810_105750.apk` | `8c47b5d` | **이전** — 엑셀 미리보기 px |
| `releases/VoiceStamp_20260810_102144.apk` | `39cc93a` | **이전** — 조인 QR Modal |
| `releases/VoiceStamp_20260809_183720.apk` | `2ba4edf` | **이전** — 수신 「가져옴」매칭 |
| `releases/VoiceStamp_20260808_231815.apk` | `1f53a7d` | **이전** — 수신 촬영자·엑셀 열 |
| `releases/VoiceStamp_20260808_143848.apk` | `89b643d` | **이전** — 수신함 병합 |
| `releases/VoiceStamp_20260803_161016.apk` | `6cd1dc4` | **이전** — 「항목 말하기」표시명 + 08-03 누적 |
| `releases/VoiceStamp_20260803_151943.apk` | `114b3dc` | **이전** — 칸 말하기 유형·말하기 예 |
| `releases/VoiceStamp_20260803_145506.apk` | `7fbd20b` | **이전** — 저장 직후 칸 말하기 |
| `releases/VoiceStamp_20260803_101849.apk` | `190a5e6` 계열 | **이전** — 장소 칩 · 저장 모달 유형 선택 |
| `releases/VoiceStamp_20260802_214047.apk` | `acb9a43` | **이전** — 목록 저장 유형 필터 |
| `releases/VoiceStamp_20260802_124143.apk` | `2a00578` | **이전** — 선택 취소 썸네일 유지 |
| `releases/VoiceStamp_20260802_115453.apk` | `869a0bb` | **이전** — 설정 필드 표시명 UI 제거 |
| `releases/VoiceStamp_20260802_111920.apk` | `2dcf74b` | **이전** — 목록 행 높이 추가 축소 |
| `releases/VoiceStamp_20260802_105935.apk` | `037b0af` | **이전** — 목록 플랫 행 |
| `releases/VoiceStamp_20260801_232652.apk` | `f005041` | **이전** — 음성 타깃 가드 |
| `releases/VoiceStamp_20260801_193317.apk` | `073c8bf` | **이전** — **성능 번들 C** (헬스체크 기준선) |
| `releases/VoiceStamp_20260801_191117.apk` | `9d8ccfa` | **이전** — **성능 번들 B** |
| `releases/VoiceStamp_20260801_185512.apk` | `e45026b` | **이전** — **성능 번들 A** |
| `releases/VoiceStamp_20260801_172149.apk` | `d363b00` | **이전** — QR URL **연결확인** |
| `releases/VoiceStamp_20260731_102403.apk` | `a9509b9` | **이전** — QR URL 마이크·https:// 기본 |
| `releases/VoiceStamp_20260731_094832.apk` | `3be0a07` | **이전** — **F-CAM-27** 왼손 홈 테마 |
| `releases/VoiceStamp_20260730_114713.apk` | `49e9c70` | **이전** — **F-QR-01** caption QR MVP |
| `releases/VoiceStamp_20260728_135843.apk` | `a67c68c` | **이전** — 홈 기본=mainint · 스타일2=mainint1 |
| `releases/VoiceStamp_20260725_114802.apk` | `3ebb51f` | **이전** — **AI-ML-01** 장면 키워드 |
| `releases/VoiceStamp_20260725_104328.apk` | `0897335` | **이전** — **AI-ML-03** OCR 제목·메모 |
| `releases/VoiceStamp_20260725_101238.apk` | `94950ff` | **이전** — 가리기 **수동 영역** |
| `releases/VoiceStamp_20260725_095546.apk` | `658af2b` | **이전** — 템플릿 **적용 중/사용자수정** |
| `releases/VoiceStamp_20260724_182721.apk` | `35f6d9b` | **이전** — 가리기 **EXIF 정렬** |
| `releases/VoiceStamp_20260724_114341.apk` | `f6403fe` | **이전** — **하단 촬영 일시** |
| `releases/VoiceStamp_20260724_111410.apk` | `239883c` | **이전** — 모자이크 **해상도·영역 비례** |
| `releases/VoiceStamp_20260724_105355.apk` | `449da4d` | **이전** — **AI-ML-02** 개인정보 가리기 MVP |
| `releases/VoiceStamp_20260723_185321.apk` | `8bad078` | **이전** — **별도영역 이미지 흐림 수정** |
| `releases/VoiceStamp_20260723_170552.apk` | `f4be621` | **이전** — 저장 목록 표시 모드 |
| `releases/VoiceStamp_20260723_153816.apk` | `1109346` | **이전** — 별도영역 이미지 표 |
| `releases/VoiceStamp_20260723_151910.apk` | `d13caf8` | **이전** — 초록 테두리 수정 |
| `releases/VoiceStamp_20260722_182753.apk` | `3af94ec` | **이전** — **스탬프 글자 크기** |
| `releases/VoiceStamp_20260722_170650.apk` | `ca16ea2` | **이전** — **확대 자르기(적용) 비활성** |
| `releases/VoiceStamp_20260722_095047.apk` | `4501a7f` | **이전** — **추가1·추가2(저장·음성·워터마크)** |
| `releases/VoiceStamp_20260722_091825.apk` | `30aed21` | **이전** — 필드 표시명 커스텀 |
| `releases/VoiceStamp_20260713_231004.apk` | `afb5e88` | **이전** — **카메라 권한 확인 중 생략**(홈 즉시) + 내보내기 OOM 수정 + ZIP PDF 미포함 + `/report` 행 삭제 |
| `releases/VoiceStamp_20260713_171406.apk` | `73dcb4f` | **내보내기 OOM 수정** + ZIP PDF 미포함 + `/report` 행 삭제 (권한 홈 즉시 **미포함**) |
| `releases/VoiceStamp_20260713_163836.apk` | `66c5d5b` | ZIP PDF 미포함 + `/report` 행 삭제 (바이너리 쓰기 **미포함**) |
| `releases/VoiceStamp_20260711_101055.apk` | `831030e` | **저장 손잡이** + **위치 끔=GPS+학교** + 내보내기·목록 음성 |
| `releases/VoiceStamp_20260711_092106.apk` | `c0e0a32` | **위치 끔=GPS+학교 DB만** |
| `releases/VoiceStamp_20260711_084109.apk` | `b588d83` | **내보내기 파일명·제목 음성** + 목록 검색 음성 |
| `releases/VoiceStamp_20260711_082557.apk` | `46d6a41` | **목록 검색 음성** + 목록 성능 A+B |
| `releases/VoiceStamp_20260711_081130.apk` | `4e0fce6` | **목록 성능 A+B** + school_only 층 가드 |
| `releases/VoiceStamp_20260711_074726.apk` | `40805e9` | **층 school_only** 비학교 lastFloor/저장 가드 |
| `releases/VoiceStamp_20260710_233524.apk` | `a0d05b9` | 확대 뷰어 **닫기·적용** 손잡이 하단 + 촬영음·1x·3x·5x |
| `releases/VoiceStamp_20260710_171301.apk` | `76aca1f` | 앱 내 **촬영음** 켜기/끄기 + 1x·3x·5x |
| `releases/VoiceStamp_20260706_112756.apk` | `f6d33fd` | **zoom.png 투명 배지** + 07-06 전부 |
| `releases/VoiceStamp_20260706_103245.apk` | `91ce71f` | 목록 내보내기 **파일명·보고서 제목 모달** |
| `releases/VoiceStamp_20260706_101457.apk` | `08cf91b` | 미리보기 배지 **`zoom.png`** |
| `releases/VoiceStamp_20260703_162433.apk` | `baf6a30` | PDF **동일 photo-slot** + 07-03 (07-06 **미포함**) |
| `releases/VoiceStamp_20260703_154800.apk` | `af6609e` | PDF **캡션 너비=사진** (photo-slot **미포함**) |
| `releases/VoiceStamp_20260703_152212.apk` | `c3b1bef` | **위치 끔**이어도 **장소 입력** (PDF **미포함**) |
| `releases/VoiceStamp_20260703_143138.apk` | `61bb13a` | 갤러리 **앱만** 저장 (장소·PDF **미포함**) |
| `releases/VoiceStamp_20260701_230340.apk` | `376368b` | 저장 **성능**·**처리 중 오버레이**·학교명만 (07-03 **미포함**) |
| `releases/VoiceStamp_20260701_225211.apk` | `b641d78` | **처리 중 오버레이** (`230340` **미포함**) |
| `releases/VoiceStamp_20260701_221146.apk` | `d809e99` | 저장 모달 **성능**·학교명만 (오버레이 **미포함**) |
| `releases/VoiceStamp_20260701_165406.apk` | `61ca32a` | **촬영 후 선택/저장 바로** + 07-01 위치·미리보기 (저장 성능·오버레이 **미포함**) |
| `releases/VoiceStamp_20260701_163737.apk` | `5b150a3` | 3버튼 시트 **fast 위치** (촬영 후 모드 **미포함**) |
| `releases/VoiceStamp_20260701_160259.apk` | `5f63f07` | 카메라 **위치 워밍업** (fast 시트 **미포함**) |
| `releases/VoiceStamp_20260701_153110.apk` | `9e1821c` | 저장 모달 **즉시 미리보기** (워밍업 **미포함**) |
| `releases/VoiceStamp_20260701_145618.apk` | `ff22c24` | prefetch **중복 생략**·학교 fast (미리보기 **미포함**) |
| `releases/VoiceStamp_20260627_092959.apk` | `547b693` | busy 오버레이 깜빡임 수정 + `233248` (07-01 **미포함**) |
| `releases/VoiceStamp_20260626_233248.apk` | `1940314` | 음성 **수동 커서** + `231436` 기능 전부 (busy 수정 **미포함**) |
| `releases/VoiceStamp_20260626_231436.apk` | `480e01f` | **층→장소**·수정 모달 입력 (수동 커서 **미포함**) |
| `releases/VoiceStamp_20260626_225833.apk` | `26e8975` | 학교 반경 **200m** |
| `releases/VoiceStamp_20260626_194421.apk` | `bdf4376` | **위치 조회 끔** |
| `releases/VoiceStamp_20260626_184823.apk` | `6f95aa8` | 3버튼 **눌림·리플** + `172205` 기능 전부 |
| `releases/VoiceStamp_20260626_172205.apk` | `fb0363b` | 도로+POI·음성 커서·장소 마이크·`place_label` (버튼 눌림 **미포함**) |
| `releases/VoiceStamp_20260626_170125.apk` | `0b5c1b8` | 음성 끝 공백·커서 |
| `releases/VoiceStamp_20260626_163412.apk` | `b06310a` | 장소 마이크 |
| `releases/VoiceStamp_20260626_152305.apk` | `0869e93` | ML Kit **되돌림** |
| `releases/VoiceStamp_20260625_171805.apk` | `847ea63` | 캡션 EXIF·DISPLAY_NAME·도로 위치 |
| `releases/VoiceStamp_20260625_165551.apk` | `44997be` | DISPLAY_NAME 한글 (캡션 EXIF **미포함**) |
| `VoiceStamp_20260625_161125.apk` | `143a140` | 한글 파일명 — 갤러리 **불안정**, 비권장 |
| `VoiceStamp_20260625_100743.apk` | `511a67c` | 도로·지번·POI (갤러리 한글 **미포함**) |
| `releases/VoiceStamp_20260624_094846.apk` | `64aa037` | 휴지통 비우기 UX·보내기 하단바·내비 31px |
| `VoiceStamp_20260624_093448.apk` | `c5cbeec` | 보내기 하단바 31px (비우기 후 목록 **미포함**) |
| `VoiceStamp_20260624_092411.apk` | `ecb3fe1` | 목록 보내기 하단바·헤더 축소 |
| `VoiceStamp_20260624_085417.apk` | `64d6728` | 휴지통 비우기 → 휴지통 화면 |
| `VoiceStamp_20260623_164337.apk` | `0ab0f93` | GPS 프리페치·연속 인앱 카메라·스플래시·3버튼 |
| `releases/VoiceStamp_20260622_094203.apk` | `4f20bca` | GPS 프리페치·연속 인앱 카메라 (**이전 GitHub**) |
| `VoiceStamp_20260622_000517.apk` | `b5922eb` | 3버튼·연속 위치 재사용 |
| `VoiceStamp_20260621_234030.apk` | `ec4930e` | 촬영 후 **3버튼** |
| `VoiceStamp_20260621_125741.apk` | `3ecb4f4` | **좌표 없음=숨김** |
| `VoiceStamp_20260620_234924.apk` | `eaa17e4` | 목록 검색 + `schools.sqlite` |
| `VoiceStamp_20260620_165718.apk` | `55c33df` | JSON seed — **부팅 멈춤**, 사용 금지 |
| `VoiceStamp_20260609_173859.apk` | `6cf82f5` | **배포 금지** |

상세 표: [PROJECT.md](./PROJECT.md) §7.4 · [PRD.md](./PRD.md) §13 · [PLAN.md](./PLAN.md) §11

### 개선 시 참고

1. [PLAN.md](./PLAN.md) §6 — 다음 작업 (LEG-05 등)
2. [PRD.md](./PRD.md) §10.1 — 미구현 후보
3. [PROJECT.md](./PROJECT.md) §4 — 기능·RESTORE §
