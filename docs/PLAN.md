# VoiceStamp 개발 계획 (Plan)

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.7 |
| 작성일 | 2026-06-11 |
| 기준 커밋 | `182f4e7` (main) |
| 관련 문서 | [PRD.md](./PRD.md), [PROJECT.md](./PROJECT.md) |

---

## 1. 프로젝트 단계 요약

| 단계 | 목표 | 상태 |
|------|------|------|
| **Phase 0** | MVP — 촬영·음성·저장·목록·PDF | ✅ 완료 |
| **Phase 1** | 설정·위치 제목·휴지통·갤러리·웹 배포 | ✅ 완료 |
| **Phase 2** | PDF 고도화·UI/UX·손잡이·내보내기 확장 | ✅ 완료 |
| **Phase 3** | 배포·법무 문서·앱 내 정책 표시 | 🔄 진행 중 (LEG-04 ✅) |
| **Phase 4** | 목적별 UX·보고서 서식·데이터 백업 | 📋 계획 |

---

## 2. Phase 2 완료 항목 (2026-06-07)

기능 단위 **최소 수정** + `src.pre-*` 백업 + `restore-*.bat` + 커밋·Vercel·APK 재빌드 원칙으로 반영됨.

| # | 기능 | 커밋 | RESTORE |
|---|------|------|---------|
| 31 | 앨범·기본 카메라로 사진 가져오기 | (세션) | §37 |
| 32 | 제목·메모 정렬 설정 | (세션) | §38 |
| 33 | 설정 화면 스크롤 | `c05376a` | §39 |
| 34 | PDF 사진·텍스트 정렬 맞춤 | `a32eff6` | §40 |
| 35 | PDF 이미지 크기 확대 | `354a942` | §41 |
| 36 | PDF 일시·파일명·빈 메모 처리 | `6989370` | §42 |
| 37 | PDF 1페이지 보고서 제목 | `ab897ba` | §43 |
| 38 | 카메라·목록 메뉴 재배치 | `ecf2823` | §44 |
| 39 | 카메라 메뉴 하단 코너 배치 | `c7d4925` | §45 |
| 40 | 손잡이(왼손/오른손) 카메라 메뉴 | `111bc3c` | §46 |
| 41 | 손잡이에 따른 마이크 버튼 위치 | `86e06e5` | §47 |
| 42 | 마이크 PNG 아이콘 | `5c7b1de` | §48 |
| 43 | 녹음 중 점(●) 표시 | `4d4e68b` | §49 |
| 44 | 목록·설정·카메라 메뉴 타원 크기 통일 | `b0086c0` | §50 |
| 45 | 선택 스탬프 합성 JPEG 갤러리 저장 | `db111b3` | §51 |
| 46 | 갤러리 앨범 분류 실패 시 성공 처리 | `e4eada2` | §52 |
| 47 | 제목·메모 별도 영역 / 워터마크 | `539c4c4` | §53 |
| 48 | PDF·이미지 공통 파일명 | `31332dc` | §54 |
| 49 | Android 뒤로가기 (종료 확인·화면 복귀) | `3b6201a` | §55 |
| 50 | 3D 액자 앱 아이콘 | `565e4b3` | §8 |
| 51 | Vercel `.vercelignore` | `919dbf2` | — |
| 52 | 아이콘 Adaptive Icon safe zone 여백 | `591666e` | §8 |
| 53 | APK 마이크 권한(RECORD_AUDIO) 복구 | `b222581` | §56 |
| 54 | 현장명·날짜별 앱 폴더·갤러리 앨범 분류 | `9ae5725` | §57 |
| 55 | 현장명 입력을 저장 모달로 이동 | `ebda9cc` | §58 |
| 56 | 갤러리 앨범 분류 (legacy initialAsset) | `bbec4aa` | §59 |
| 57 | 갤러리 앨범 (MediaLibrary Next + 읽기 권한) | `204ba88` | §60 |
| 58 | 갤러리 앨범 (쓰기 전용 + 앨범 ID 캐시) | `3076dc6` | §61 |
| 59 | 저장 모달 장소명 라벨 문구 변경 | `3b88fe9` | §62 |
| 60 | 저장·수정 모달 사진 전체 보기 | `27e5f6e` | §63 |
| 61 | 전체 보기에서 사진 버리기·휴지통 이동 | `cd7ed89` | §64 |
| 62 | 수정 화면 저장 폴더 표시·갤러리 앨범 이동 | `2f2385b` | §65 |
| 63 | 수정 화면 저장 폴더 선택 모달 | `6baa947` | §66 |

## 2A. Phase 2 추가 완료 (2026-06-09)

| # | 기능 | 커밋 | RESTORE |
|---|------|------|---------|
| 64 | 신규 저장 시 `YYYYMMDD_장소명` 폴더명 자동 채움·기존 폴더 선택 | `a3d4351` | `restore-site-group-full.bat` §64 |
| 65 | 웹 크래시 수정 (`galleryService.web.ts` 스텁) | `59c7007` | `restore-gallery-web-stub.bat` §65 |
| 66 | 목록 선택 휴지통 후 스크롤 유지 (1차: silent load) | `eef0891` | — |
| 67 | 목록 휴지통 후 스크롤 (skipRefresh·scrollToOffset) | `5831512` | `restore-list-trash-scroll.bat` §66 |
| 68 | 목록 휴지통 스크롤 앵커 인덱스 (시도) | `6cf82f5` | — |
| 69 | 앵커 인덱스 되돌림 (앱 종료 방지) | `953c2cd` | — |
| 70 | 카메라→목록 재진입 무한 로딩 수정 | `bfb77d8` | `restore-list-silent-loading.bat` §67 |
| 71 | 수정 모달 휴지통 후 목록 스크롤 유지 | `b44c469` | `restore-edit-trash-scroll.bat` §68 |
| 72 | 목록 헤더 「설정」·설정 복귀(목록/카메라) | `a4a55d2` | `restore-info-leg04.bat` §69 |
| 73 | LEG-04 앱 정보·정책 웹 (`public/*.html`) | `a4a55d2` | `restore-info-leg04.bat` §69 |
| 74 | 저장 폴더 기본 현장명 유지 (GPS→제목만) | `4f56b07` | `restore-site-folder-keep.bat` §70 |
| 75 | `/info` GitHub APK 다운로드 링크 | `3468630` | `restore-apk-download.bat` |

## 2B. Phase 2 추가 완료 (2026-06-11)

| # | 기능 | 커밋 | RESTORE |
|---|------|------|---------|
| 76 | 시스템 카메라 자동 실행 (줌 지원, CameraView 제거) | `be8bd93` | `restore-system-camera-auto.bat` |
| 77 | 워터마크 JPEG 비율 보존 (aspectRatio·onLoadEnd) | `3306c3d` | `restore-watermark-aspect.bat` |
| 78 | 워터마크 픽셀 준비 + ViewShot (`prepareExportPhoto`) | `ef71f5a` | `restore-watermark-pixel.bat` |
| 79 | 워터마크 네이티브 텍스트 합성 (`react-native-image-marker`) | `f61697d` | `restore-watermark-native.bat` |
| 80 | 저장 시 갤러리 모드 (원본만 / 캡션만 / 원본+캡션) | `6948a96` | `restore-gallery-save-mode.bat` |
| 81 | 학교 POI 우선 위치 제목 | `4b4d25d` | `restore-school-poi.bat` §71 |
| 82 | 온보딩 인트로 (최초 실행) | `784c163` | `restore-intro.bat` §72 |
| 83 | 온보딩 4단계 슬라이드 | `db81ef9` | `restore-intro-4.bat` §73 |
| 84 | 온보딩 반응형 레이아웃 | `73ee56f` | `restore-intro-layout.bat` §74 |
| 85 | 온보딩 이미지 갱신 (버튼 제거판) | `fac7734` | `restore-onboarding-images.bat` §75 |

### 2.1 문서 동기화 이력

| 커밋 | 내용 |
|------|------|
| `f125897` | PRD·PROJECT·PLAN·PRIVACY·LICENSE 문서 정리 (기준 `539c4c4`) |
| `470606d` | PRD·PROJECT·PLAN 문서 정리 (기준 `31332dc`) |
| `ffa77bf` | PRD·PROJECT·PLAN·RESTORE 문서 정리 (기준 `3b6201a`) |
| `3eb9fd9` | PRD·PROJECT·PLAN·RESTORE 문서 정리 (기준 `591666e`) |
| `36361b4` | PRD·PROJECT·PLAN·README 문서 정리 (기준 `b222581`) |
| `cc5c3f1` | PRD·PROJECT·PLAN·README 문서 정리 (기준 `6baa947`) |
| `89a9ee2` | PRD·PROJECT·PLAN·README 문서 정리 (기준 `b44c469`) |
| `453e160` | PRD·PROJECT·PLAN·README 문서 정리 (기준 `a4a55d2`) |
| `876f390` | PRD·PROJECT·PLAN·README 문서 정리 (기준 `4f56b07`) |
| `a45a750` | PRD·PROJECT·PLAN·README 문서 정리 (기준 `0970d3d`) |
| (본 갱신) | `182f4e7` 반영 — 학교 POI·온보딩 4단계·반응형·이미지 갱신·APK별·날짜별 이력 |

---

## 3. Phase 3 — 배포·법무 (진행 중)

| ID | 작업 | 우선순위 | 상태 |
|----|------|----------|------|
| DEP-01 | 3D 액자 앱 아이콘 (`assets` 5종) | P1 | ✅ `565e4b3` |
| DEP-02 | Adaptive Icon safe zone 여백 | P1 | ✅ `591666e` |
| DEP-03 | Vercel `.vercelignore` | P2 | ✅ `919dbf2` |
| LEG-01 | LICENSE 저작권 (이형우, MIT + OSS 고지) | P1 | ✅ 커밋됨 (`f125897`) |
| LEG-02 | [PRIVACY.md](./PRIVACY.md) 개인정보 처리 안내 | P1 | ✅ 커밋됨 |
| LEG-03 | [KAKAO-KEY-SECURITY.md](./KAKAO-KEY-SECURITY.md) | P1 | ✅ 커밋됨 |
| LEG-04 | 버전·라이선스·개인정보·도움말 (설정 앱 정보 + 웹 `/privacy` 등) | P2 | ✅ `a4a55d2` |
| LEG-05 | Play 스토어 등록용 스크린샷·스토어 문구 | P3 | 📋 미구현 (정책 URL: `/privacy` 준비됨) |
| DEP-04 | `/info` GitHub Releases APK 다운로드 링크 | P2 | ✅ `3468630` |

> **참고:** APK/Web만 배포할 때는 문서(`docs/`)만으로도 내부·테스터 배포는 가능. 스토어 등록 시 LEG-04·05 권장.

---

## 4. Phase 4 — 후보 기능 (미구현)

PRD §10.1 및 기획 메모(`최소수정.txt`)에서 도출.

### 4.1 UX·콘텐츠

| ID | 내용 | 비고 |
|----|------|------|
| UX-C | 구·동 먼저 표시, 건물명은 나중 추가 | `kakaoLocal.ts` |
| UX-D2 | 위치 실패 시 짧은 안내 문구 | 선택 |
| UX-PURPOSE | **사진 목적별** 제목·메모 라벨 (여행→이야기, 점검→결과 등) | 설정 또는 프로필 |
| FEAT-02 | PDF 생성 진행 표시 UI | |

### 4.2 데이터·복구

| ID | 내용 | 비고 |
|----|------|------|
| FEAT-03 | DB+메타데이터 내보내기/가져오기 | 재설치 복구 |
| FEAT-03b | 갤러리 사진 ↔ SQLite 메타 연동 | Out of Scope에 가까움 |

### 4.3 보고서·서식 (장기)

| ID | 내용 | 비고 |
|----|------|------|
| RPT-01 | HTML/PDF **서식 템플릿** 선택·업로드 | 점검 보고서 등 |
| RPT-02 | xlsx 다중 이미지 POC | exceljs |
| RPT-03 | hwpx POC | 범위 조정 가능 |

---

## 5. 개발 원칙 (유지)

1. **최소 수정** — 요청 범위만 변경, 기존 구조·패턴 유지  
2. **되돌리기** — `src.pre-<feature>/` + `restore-<feature>.bat` + `RESTORE.md` § 추가  
3. **검증** — 커밋 → `git push` → Vercel `--prod` → `build-apk.bat` (날짜·시간 APK)  
4. **문서** — 기능 완료 시 PRD·PROJECT·본 PLAN 갱신  
5. **Expo SDK 56** — [공식 문서](https://docs.expo.dev/versions/v56.0.0/) 기준

---

## 6. 다음 권장 작업 순서

| 순서 | 작업 | 이유 |
|------|------|------|
| 1 | LEG-05 Play 스토어 스크린샷·등록 | 정책 URL 준비됨 |
| 2 | UX-D2 위치 실패 안내 | 작은 diff, 체감 개선 |
| 3 | FEAT-02 PDF 진행 표시 | 다장 PDF 시 UX |
| 4 | UX-PURPOSE 목적별 필드 라벨 | 기획 메모 반영 |
| 5 | FEAT-03 백업/복원 | 재설치 시나리오 |
| 6 | RPT-01 보고서 서식 | 별도 PDCA·POC 필요 |

---

## 7. 배포·아티팩트 (현재)

| 항목 | 값 |
|------|-----|
| GitHub | https://github.com/golee75git/VoiceStamp (`main`) |
| Vercel | https://voicestamp-gilt.vercel.app |
| 최신 APK (문서 기준) | `VoiceStamp_20260611_232649.apk` (`182f4e7`) |
| APK 다운로드 (웹) | https://voicestamp-gilt.vercel.app/info → GitHub Releases |
| 정책 URL | https://voicestamp-gilt.vercel.app/privacy |
| Android 패키지 | `com.voicestamp.app` |

---

## 8. 문서 갱신 규칙

| 이벤트 | 갱신 대상 |
|--------|-----------|
| 기능 추가·변경 | PRD §3, PROJECT §4, PLAN §2·§4, RESTORE § |
| 배포 | PROJECT §7, PLAN §7, PRD 헤더 커밋 해시 |
| 법무·정책 | PRIVACY, LICENSE, PLAN §3 |
| 분기 점검 | 본 문서 §6 우선순위 재검토 |

---

## 9. 관련 문서

| 문서 | 설명 |
|------|------|
| [PRD.md](./PRD.md) | 요구사항·기능 ID |
| [PROJECT.md](./PROJECT.md) | 구현 이력·모듈·커밋 |
| [README.md](./README.md) | docs 목록 |
| [../RESTORE.md](../RESTORE.md) | 되돌리기 §1~75 |
| [DESIGN-INFO-PAGES.md](./DESIGN-INFO-PAGES.md) | 정보·정책 페이지 설계·구현 (`a4a55d2`) |

---

## 10. 날짜별 개발 요약

| 날짜 | Phase | 요약 |
|------|-------|------|
| 2026-06-05 | 0 | Git 저장소 생성 |
| 2026-06-06 | 0→1 | MVP·PDF·웹·설정·위치·휴지통·갤러리·APK 파이프라인 |
| 2026-06-07 | 2 | PDF/JPEG보내기·UI·손잡이·Android 뒤로·아이콘·권한 |
| 2026-06-08 | 2→3 | 장소·폴더·갤러리 앨범·수정 UX·폴더 선택·문서 동기화 |
| 2026-06-09 | 2→3 | 폴더 자동 채움·웹 스텁·목록 스크롤·**LEG-04·목록 설정** |
| 2026-06-10 | 3 | **저장 폴더 현장명 유지**·`/info` APK 링크·문서 동기화 |
| 2026-06-11 | 2→3 | **시스템 카메라**(줌)·워터마크 JPEG·**저장 시 갤러리 모드**·**학교 POI 위치**·**4단계 온보딩** |

---

## 11. APK 빌드별 요약

| APK (권장) | 커밋 | 한 줄 |
|------------|------|--------|
| `VoiceStamp_20260611_232649.apk` | `182f4e7` | **최신** — 온보딩 4단계·반응형·이미지 갱신 |
| `VoiceStamp_20260611_222640.apk` | `e14950a` | 학교 POI 우선 위치 제목 |
| `VoiceStamp_20260611_184601.apk` | `0970d3d` | 저장 시 갤러리 원본/캡션/둘 다 |
| `VoiceStamp_20260611_182919.apk` | `f61697d` | 워터마크 네이티브 합성 |
| `VoiceStamp_20260611_172409.apk` | `be8bd93` | 시스템 카메라 (줌) |
| `VoiceStamp_20260610_233157.apk` | `4f56b07` | 저장 폴더 현장명 유지 |
| `VoiceStamp_20260609_183510.apk` | `a4a55d2` | 설정·앱 정보·정책 웹 |
| `VoiceStamp_20260609_181249.apk` | `b44c469` | 수정 휴지통 스크롤 |
| `VoiceStamp_20260609_173859.apk` | `6cf82f5` | **배포 금지** |
| `VoiceStamp_20260608_235051.apk` | `6baa947` | 폴더 선택 모달 |
| `VoiceStamp_20260607_145955.apk` | `3b6201a` | Android 뒤로가기 |

전체: [PROJECT.md](./PROJECT.md) §7.4 · [PRD.md](./PRD.md) §13
