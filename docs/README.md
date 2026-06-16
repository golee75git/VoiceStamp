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
| [PRIVACY.md](./PRIVACY.md) | 배포·법무 | 개인정보 원본 (웹: `/privacy`) |
| [KAKAO-KEY-SECURITY.md](./KAKAO-KEY-SECURITY.md) | 운영 | 카카오 REST API 키 체크리스트 |

## 루트 문서

| 문서 | 설명 |
|------|------|
| [../README.md](../README.md) | 실행 방법 요약 |
| [../LICENSE](../LICENSE) | MIT (Copyright 2026 이형우) |
| [../RESTORE.md](../RESTORE.md) | 기능별 되돌리기 (§1~107) |
| [../BUILD-APK.md](../BUILD-APK.md) | Android APK 빌드 가이드 |

---

## 현재 상태 스냅샷 (2026-06-17)

- **최신 커밋:** `87c7e15` (main)
- **웹:** https://voicestamp-gilt.vercel.app
- **정책:** `/privacy` · `/license` · `/help` · `/info`
- **권장 APK (로컬):** `VoiceStamp_20260617_001635.apk` — 워터마크 **검은/흰 반투명**·갤러리·촬영 캡슐·HWPX/XLSX/ZIP
- **GitHub APK:** `releases/VoiceStamp_20260616_082006.apk` (`f74012f`, 워터마크 스타일·캡슐 버튼 **미포함**)
- **APK raw URL (GitHub):** https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260616_082006.apk
- **APK 다운로드:** `/info` → GitHub Releases
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
| 06-17 | **워터마크 스타일** (검은 반투명 / **흰색 반투명**) |

### APK별 (권장·주요)

| APK | 커밋 | 한 줄 |
|-----|------|--------|
| `VoiceStamp_20260617_001635.apk` | `87c7e15` | **설치 권장** — 워터마크 검은/흰 반투명 |
| `VoiceStamp_20260617_000721.apk` | `534c9f7` | 워터마크 빨간 세로줄 (구버전) |
| `VoiceStamp_20260616_173518.apk` | `7e453ea` | 갤러리·촬영 캡슐 (워터마크 스타일 미포함) |
| `VoiceStamp_20260616_170713.apk` | `72ccc32` | 갤러리 아이콘 (캡슐 미포함) |
| `VoiceStamp_20260616_094515.apk` | `7c127aa` | 목록 UI·첨부·카메라 홈 |
| `releases/VoiceStamp_20260616_082006.apk` | `f74012f` | **GitHub 최신 커밋 APK** |
| `VoiceStamp_20260614_114256.apk` | `100e123` | 자동 제목·층 표기·전체 06-14 |
| `VoiceStamp_20260609_173859.apk` | `6cf82f5` | **배포 금지** |

상세 표: [PROJECT.md](./PROJECT.md) §7.4 · [PRD.md](./PRD.md) §13 · [PLAN.md](./PLAN.md) §11

### 개선 시 참고

1. [PLAN.md](./PLAN.md) §6 — 다음 작업 (LEG-05 등)
2. [PRD.md](./PRD.md) §10.1 — 미구현 후보
3. [PROJECT.md](./PROJECT.md) §4 — 기능·RESTORE §
