# VoiceStamp 문서

프로젝트 문서 모음입니다. **소스 코드는 `src/`**, 되돌리기·빌드는 루트의 MD·BAT를 참고하세요.

---

## 문서 목록

| 문서 | 대상 | 설명 |
|------|------|------|
| [PRD.md](./PRD.md) | 기획·QA | 요구사항, 기능 ID, **§12 날짜별** · **§13 APK별** 요약 |
| [PROJECT.md](./PROJECT.md) | 개발 | 구현 이력, **§7.4 APK 빌드별 상세**, **§12 날짜별 커밋** |
| [PLAN.md](./PLAN.md) | 기획·개발 | 단계·완료 기능, **§10 날짜별** · **§11 APK별** |
| [DESIGN-INFO-PAGES.md](./DESIGN-INFO-PAGES.md) | 기획·UI | LEG-04 정책 페이지 설계·구현 (`a4a55d2`) |
| [DESIGN-ML-KIT-SCENE-LABEL.md](./DESIGN-ML-KIT-SCENE-LABEL.md) | 기획·AI | **AI-ML-01** ML Kit 설계 (구현 `43d1f13` → **`0869e93` 되돌림**) |
| [DESIGN-PRIVACY-BLUR.md](./DESIGN-PRIVACY-BLUR.md) | 기획·AI | **AI-ML-02** 온디바이스 얼굴·숫자 **블러** MVP 설계 (구현 전·소스 미변경) |
| [DESIGN-GOOGLE-SHEETS-UPLOAD.md](./DESIGN-GOOGLE-SHEETS-UPLOAD.md) | 기획·연동 | **GS-UPLOAD-01** 공용 시트 원클릭·압축 업로드 **초안** (앱 미연동) |
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
| [../RESTORE.md](../RESTORE.md) | 기능별 되돌리기 (§1~185) |
| [../BUILD-APK.md](../BUILD-APK.md) | Android APK 빌드 가이드 |

---

## 현재 상태 스냅샷 (2026-07-24)

- **문서 갱신일:** 2026-07-24 — **AI-ML-02** 개인정보 가리기(블러) MVP · APK `105355`
- **이전 문서 갱신일:** 2026-07-23 — **날짜별·APK별 이력 보강** (`170650`·`182753` 등) · 권장 APK `185321`
- **최신 기능 커밋:** (본 배포) — 온디바이스 얼굴·숫자 모자이크 블러
- **웹:** https://voicestamp-gilt.vercel.app — **`/`** APK 안내 랜딩 · **`/app`** 웹 테스트 앱 · **`/`** 하단 **오늘·누적 방문** 집계 · **QR·링크 공유** (개인정보 패널 위)
- **정책:** `/privacy` · `/license` · `/help` · `/info` · [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)
- **권장 APK (설치·GitHub):** `releases/VoiceStamp_20260724_114341.apk` — **개인정보 가리기(해상도 비례 강도)**
- **APK raw URL (GitHub):** https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260724_114341.apk
- **이전 권장 APK:** `releases/VoiceStamp_20260723_185321.apk` (별도영역 이미지 흐림 수정)
- **비권장 APK:** `VoiceStamp_20260625_161125.apk` (`143a140`, 갤러리 경로 이슈)
- **사용 금지 APK:** `VoiceStamp_20260620_165718.apk` (`55c33df`, JSON seed — **부팅 멈춤**)
- **APK 다운로드:** `/` · `/info` → GitHub `releases/`
- **배포 금지 APK:** `VoiceStamp_20260609_173859.apk` (`6cf82f5` 크래시)
- **개선 후보(미구현):** **F-QR-01** · **AI-ML-02** 개인정보 가리기(블러) 설계만 · **AI-ML-01** 장면 라벨(되돌림) (PRD §10.1 · PLAN §4)

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
| 07-24 | **AI-ML-02** 얼굴·숫자 온디바이스 블러 MVP · `voicestamp-mlkit` · 도움말·PRIVACY · APK `105355` |

### APK별 (권장·주요)

> **2026-07-23:** 권장 파일은 **`VoiceStamp_20260723_185321.apk`**.

| APK | 커밋 | 한 줄 |
|-----|------|--------|
| `releases/VoiceStamp_20260723_185321.apk` | `8bad078` | **설치·GitHub 권장** — **별도영역 이미지 흐림 수정** |
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
