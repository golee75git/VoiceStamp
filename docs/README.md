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
| [../RESTORE.md](../RESTORE.md) | 기능별 되돌리기 (§1~117) |
| [../BUILD-APK.md](../BUILD-APK.md) | Android APK 빌드 가이드 |

---

## 현재 상태 스냅샷 (2026-06-27)

- **최신 커밋:** `4b6834d` (main)
- **웹:** https://voicestamp-gilt.vercel.app — **`/`** APK 안내 랜딩 · **`/app`** 웹 테스트 앱 · **`/`** 하단 **오늘·누적 방문** 집계 · **QR·링크 공유** (개인정보 패널 위)
- **정책:** `/privacy` · `/license` · `/help` · `/info` · [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)
- **권장 APK (설치·GitHub):** `releases/VoiceStamp_20260627_092959.apk` — **busy 오버레이 깜빡임 수정** + `233248` 기능 전부
- **APK raw URL (GitHub):** https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260627_092959.apk
- **이전 권장 APK:** `releases/VoiceStamp_20260626_233248.apk` (`1940314`, 음성 수동 커서)
- **비권장 APK:** `VoiceStamp_20260625_161125.apk` (`143a140`, 갤러리 경로 이슈)
- **사용 금지 APK:** `VoiceStamp_20260620_165718.apk` (`55c33df`, JSON seed — **부팅 멈춤**)
- **APK 다운로드:** `/` · `/info` → GitHub `releases/`
- **배포 금지 APK:** `VoiceStamp_20260609_173859.apk` (`6cf82f5` 크래시)

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

### APK별 (권장·주요)

| APK | 커밋 | 한 줄 |
|-----|------|--------|
| `releases/VoiceStamp_20260627_092959.apk` | `547b693` | **설치·GitHub 권장** — busy 오버레이 깜빡임 수정 + `233248` 기능 전부 |
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
