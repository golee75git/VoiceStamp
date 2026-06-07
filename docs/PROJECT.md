# VoiceStamp 프로젝트 현황

문서 작성일: **2026-06-08**  
최신 커밋 기준: `b222581` (main)

---

## 1. 프로젝트 요약

| 항목 | 내용 |
|------|------|
| 이름 | VoiceStamp |
| 설명 | 사진 + 음성/텍스트 메모 스탬프 앱 |
| 프레임워크 | Expo SDK **56.0.8** |
| 언어 | TypeScript |
| DB | expo-sqlite |
| Android 패키지 | `com.voicestamp.app` |
| GitHub | https://github.com/golee75git/VoiceStamp |
| 웹 배포 | Vercel (`npm run build:web` → `dist/`) |

---

## 2. 디렉터리 구조

```
VoiceStamp/
├── App.tsx                 # 앱 진입
├── app.json                # Expo 설정·플러그인
├── src/
│   ├── components/         # CameraScreen, StampListScreen, StampSaveModal,
│   │                       # SettingsScreen, TrashScreen, VoiceInputField,
│   │                       # StampExportCard, StampImageExportHost
│   ├── screens/            # MainScreen
│   ├── services/           # saveStamp, fileService, exportPdf, exportStampImage,
│   │                       # settingsService, kakaoLocal, locationService,
│   │                       # pdfImageForExport, galleryService, stampTrash,
│   │                       # stampRepository, pickStampImage, pdfTitleFormat
│   ├── hooks/              # useSpeechInput
│   ├── db/                 # database, schema
│   ├── types/              # stamp
│   └── utils/              # id, cameraPictureSize
├── android/                # 네이티브 Android (로컬 빌드용)
├── docs/                   # PRD, PROJECT, PLAN, PRIVACY, 문서 목록
├── build-apk.bat           # Release APK 빌드
├── RESTORE.md              # 기능별 되돌리기 (§8~56)
├── LICENSE                 # MIT (Copyright 2026 이형우)
├── BUILD-APK.md            # APK 빌드 가이드
├── vercel.json             # Vercel 웹 설정
├── .vercelignore           # Vercel CLI 업로드 제외 (APK·android 등)
├── apply-icon.bat          # 아이콘 적용 (수동)
├── restore-icon.bat        # assets.pre-icon 복원
├── assets.pre-icon/        # 아이콘 되돌리기 백업
└── .env                    # EXPO_PUBLIC_KAKAO_REST_KEY (git 제외)
```

---

## 3. 화면 구성

| 화면 | 파일 | 설명 |
|------|------|------|
| 카메라 | `CameraScreen.tsx` | 촬영, 설정·목록·앨범, 손잡이별 하단 메뉴 |
| 저장 모달 | `StampSaveModal.tsx` | 제목·메모·음성·저장, 위치 로딩, 키보드 스크롤 |
| 목록 | `StampListScreen.tsx` | 목록·선택·PDF·이미지 저장·수정·휴지통·⚙ 설정 |
| 휴지통 | `TrashScreen.tsx` | 터치 복원 |
| 설정 | `SettingsScreen.tsx` | 폴더·PDF·내보내기·손잡이·휴지통 비우기 |
| JPEG 캡처 | `StampExportCard.tsx`, `StampImageExportHost.tsx` | 합성 JPEG (ViewShot) |
| 메인 | `MainScreen.tsx` | camera / list / settings / trash 전환, Android `BackHandler` |

### 3.1 목록 화면 UI (현재)

| 영역 | 요소 |
|------|------|
| 상단 | 「← 카메라」(큰 버튼) |
| 헤더 | 저장 목록 · 휴지통 · 선택/취소 |
| 본문 | 스탬프 카드 (600px+ 2열) |
| 선택 모드 | PDF·이미지 파일명 · 보고서 제목 · PDF 만들기/저장/공유 · 이미지 저장 |
| 하단 | 중앙 ⚙ → 설정 |

### 3.2 Android 하드웨어 뒤로 (`MainScreen`, `3b6201a`)

| 현재 화면 | 동작 |
|-----------|------|
| 카메라 | 「앱 종료 / 아니오」 확인 → 종료 시 `BackHandler.exitApp()` |
| 목록·설정 | 카메라로 |
| 휴지통 | 목록으로 |
| 저장·수정 모달 | `StampSaveModal` `onRequestClose` (모달 우선) |

---

## 4. 기능별 구현 이력

개발 원칙: **최소 수정**, **기능별 백업(`src.pre-*`)**, **`restore-*.bat`**

| # | 기능 | 커밋 (요약) | 되돌리기 |
|---|------|-------------|----------|
| 1 | 초기 앱 (카메라·음성·스탬프·APK) | `e4fe0d3` | RESTORE §1~6 |
| 2 | 커스텀 앱 아이콘 | `565e4b3` · `591666e` | `restore-icon.bat` §8 |
| 3 | 목록 터치 수정 | (세션 내) | `restore-edit.bat` §9 |
| 4 | PDF 만들기/공유 | `a78d347` | `restore-pdf.bat` §10 |
| 5 | Vercel 웹 배포 | `a78d347` | `restore-vercel.bat` §11 |
| 6 | 웹 사진 저장 (data URI) | `88da589` | `restore-web-fs.bat` §12 |
| 7 | 웹 PDF 사진 출력 | (세션 내) | `restore-web-pdf.bat` §13 |
| 8 | PDF 파일명 편집 | `1224df8` | `restore-pdf-name.bat` §14 |
| 9 | 사진 저장 폴더 설정 | `b5faa2f` | `restore-settings.bat` §15 |
| 10 | 길게 누르기 선택 | `8d8e41c` | `restore-longpress.bat` §16 |
| 11 | 반응형 2열 목록 | `3213851` | `restore-responsive.bat` §17 |
| 12 | 음성 이어쓰기 | `3213851` | `restore-speech-append.bat` §18 |
| 13 | PDF 페이지당 1~4장 | `57c6fb0` | `restore-pdf-per-page.bat` §19 |
| 14 | 제목 기반 사진 파일명 | `82df9cd` | `restore-stamp-filename.bat` §20 |
| 15 | 카메라 화면 설정 버튼 | `b18babc` | `restore-camera-settings.bat` §21 |
| 16 | PDF save copyAsync 수정 | `292b61f` | `restore-pdf-save.bat` §22 |
| 17 | 카카오 위치 자동 제목 | `2ec2768` | `restore-location-title.bat` §23 |
| 18 | `.env` gitignore | `200d49b` | `restore-env-gitignore.bat` §24 |
| 19 | 제목 건물명 보조 | `9f8ffc4` | `restore-building-title.bat` §25 |
| 20 | 카메라 최대 해상도 | `2309d62` | `restore-camera-resolution.bat` §26 |
| 21 | PDF 화질 원본/표준/압축 | `4e8d3f2` | `restore-pdf-quality.bat` §27 |
| 22 | 제목 즉시 표시 (1단계 A) | `8a9c7ce` | `restore-title-ux.bat` §28 |
| 23 | 위치 확인 중 표시 (1단계 D) | `02b0cb1` | `restore-location-loading.bat` §29 |
| 24 | 저장 모달 키보드 스크롤 | `b96658e` | `restore-keyboard-scroll.bat` §30 |
| 25 | GPS 캐시·타임아웃 (UX-B) | `c52a22e` | `restore-location-fast.bat` §31 |
| 26 | 휴지통 (소프트 삭제) | `50cd4bf` | `restore-trash.bat` §32 |
| 27 | 갤러리 VoiceStamp 앨범 저장 | `4e8675d` | `restore-gallery-save.bat` §33 |
| 28 | PDF 원본 HTML 상한 (2400px) | `b77c296` | `restore-pdf-original-cap.bat` §34 |
| 29 | 목록 ← 카메라 버튼 확대 | `a49a374` | `restore-list-back-button.bat` §35 |
| 30 | 목록 하단 ⚙ 설정 푸터 | `9f4a525` | `restore-list-gear-footer.bat` §36 |
| 31 | 앨범·기본 카메라 사진 가져오기 | (세션) | `restore-image-picker.bat` §37 |
| 32 | 제목·메모 정렬 | (세션) | `restore-text-align.bat` §38 |
| 33 | 설정 화면 스크롤 | `c05376a` | `restore-settings-scroll.bat` §39 |
| 34 | PDF 사진·텍스트 정렬 | `a32eff6` | `restore-pdf-align.bat` §40 |
| 35 | PDF 이미지 크기 확대 | `354a942` | `restore-pdf-image-size.bat` §41 |
| 36 | PDF 일시·파일명·빈 메모 | `6989370` | `restore-pdf-datetime-memo.bat` §42 |
| 37 | PDF 1페이지 보고서 제목 | `ab897ba` | `restore-pdf-report-title.bat` §43 |
| 38 | 카메라·목록 메뉴 재배치 | `ecf2823` | `restore-camera-nav.bat` §44 |
| 39 | 카메라 메뉴 하단 코너 | `c7d4925` | `restore-camera-nav-bottom.bat` §45 |
| 40 | 손잡이 카메라 메뉴 | `111bc3c` | `restore-camera-hand.bat` §46 |
| 41 | 손잡이 마이크 위치 | `86e06e5` | `restore-mic-hand.bat` §47 |
| 42 | 마이크 PNG 아이콘 | `5c7b1de` | `restore-mic-icon.bat` §48 |
| 43 | 마이크 녹음 ● 표시 | `4d4e68b` | `restore-mic-dot.bat` §49 |
| 44 | 메뉴 타원 크기 통일 | `b0086c0` | `restore-nav-button-size.bat` §50 |
| 45 | 합성 JPEG 이미지 저장 | `db111b3` | `restore-stamp-image-export.bat` §51 |
| 46 | 갤러리 앨범 분류 예외 처리 | `e4eada2` | `restore-gallery-album-fix.bat` §52 |
| 47 | 별도 영역 / 워터마크 | `539c4c4` | `restore-stamp-text-layout.bat` §53 |
| 48 | PDF·이미지 공통 파일명 | `31332dc` | `restore-export-filename.bat` §54 |
| 49 | Android 뒤로가기 (종료 확인·화면 복귀) | `3b6201a` | `restore-back-handler.bat` §55 |
| 50 | 3D 액자 앱 아이콘 (나무 액자·금색 마이크·VS) | `565e4b3` | `restore-icon.bat` §8 |
| 51 | Vercel `.vercelignore` (로컬 배포 EBUSY 방지) | `919dbf2` | `.vercelignore` 삭제 또는 수정 |
| 52 | 아이콘 Adaptive Icon safe zone 여백 | `591666e` | `restore-icon.bat` §8 |
| 53 | APK 마이크 권한(RECORD_AUDIO) 복구 | `b222581` | `restore-mic-permission.bat` §56 |

전체 일정·후보: [PLAN.md](./PLAN.md)

---

## 5. 의존성 (package.json)

| 패키지 | 용도 |
|--------|------|
| expo-camera | 촬영 |
| expo-speech-recognition | 음성 입력 |
| expo-sqlite | DB |
| expo-file-system | 파일 저장 |
| expo-location | GPS |
| expo-media-library | 갤러리 저장 |
| expo-print / expo-sharing | PDF |
| expo-image-manipulator | PDF·JPEG 이미지 압축 |
| expo-image-picker | 앨범·카메라 앱에서 사진 선택 |
| react-native-view-shot | APK 합성 JPEG 캡처 |
| react-native-web | 웹 |

---

## 6. 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `EXPO_PUBLIC_KAKAO_REST_KEY` | 위치 제목 사용 시 | 카카오 REST API 키 |

- 로컬: 프로젝트 루트 `.env`
- Vercel: 프로젝트 Environment Variables
- **git에 커밋하지 않음** (`.gitignore`에 `.env` 포함)

---

## 7. 빌드·배포

### 7.1 웹 (Vercel)

```bash
npm run build:web
```

`main` 브랜치 푸시 시 Vercel 자동 배포.

### 7.2 Android APK

```bat
build-apk.bat
```

- 출력: `VoiceStamp_YYYYMMDD_HHmmss.apk`, `VoiceStamp.apk`
- arm64-v8a Release
- **소스 또는 `.env` 변경 후** 재빌드 필요
- `.env` 키 반영이 안 되면: `cd android && gradlew.bat clean assembleRelease`

### 7.3 최신 APK (문서 작성 시점)

| 파일 | 비고 |
|------|------|
| `VoiceStamp_20260608_080743.apk` | APK 마이크 권한 복구 (`b222581`) |
| `VoiceStamp_20260608_003141.apk` | 아이콘 safe zone 여백 (`591666e`) |
| `VoiceStamp_20260608_001727.apk` | 3D 액자 아이콘 (`565e4b3`) |
| `VoiceStamp_20260607_145955.apk` | Android 뒤로가기 (종료 확인·화면 복귀) |

---

## 8. 서비스 모듈

| 모듈 | 역할 |
|------|------|
| `saveStamp.ts` | 저장·수정 오케스트레이션, 갤러리 저장 호출 |
| `fileService.ts` | 이미지 persist, 제목 포맷, URI resolve, 삭제 |
| `stampRepository.ts` | SQLite CRUD, soft delete 필터 |
| `stampTrash.ts` | 휴지통 이동·복원·비우기 |
| `galleryService.ts` | 갤러리 VoiceStamp 앨범 저장 (선택적 파일명 복사) |
| `settingsService.ts` | 앱 설정 get/set |
| `exportPdf.ts` | PDF HTML·생성·저장·공유 (워터마크·보고서 제목) |
| `exportStampImage.ts` | 합성 JPEG, `buildExportJpegFileName` |
| `pdfTitleFormat.ts` | PDF·내보내기 제목·파일명 포맷 |
| `pickStampImage.ts` | 앨범·카메라 앱 피커 |
| `pdfImageForExport.ts` | PDF용 이미지 압축 (원본 2400px 상한) |
| `locationService.ts` | GPS 캐시·타임아웃·카카오 연동 |
| `kakaoLocal.ts` | 카카오 역지오코딩 |
| `useSpeechInput.ts` | 음성 인식 훅 |

---

## 9. 제목 자동 생성 규칙 (현재)

1. 저장 모달 열림 → **즉시** `formatDefaultStampTitle(capturedAt)` (날짜·시간만)
2. 동시에 「위치 확인 중…」 표시
3. `getCurrentPlaceLabel()`: `getLastKnownPositionAsync`(5분) → `getCurrentPositionAsync`(6초 타임아웃) → 카카오 API
4. 성공 시 같은 `capturedAt`으로 `formatDefaultStampTitle(capturedAt, 장소)` 갱신
5. 실패 시 날짜·시간 제목 유지
6. 사용자 제목 수정·제목 마이크 시작 시 자동 덮어쓰기 중단

예: `20260606_1815` → `20260606_1815_강남구역삼동래미안`

---

## 10. PDF 옵션 (설정)

| 설정 | 값 | 기본 |
|------|-----|------|
| 페이지당 사진 수 | 1, 2, 3, 4 | 1 |
| 화질 | 원본, 표준, 압축 | 원본 |
| 촬영 일시 표시 | 표시 / 숨김 | 표시 |
| PDF 파일명 날짜·시간 | 포함 / 제외 | 포함 |
| 제목·메모 정렬 | 왼쪽 / 가운데 / 오른쪽 | 왼쪽 |
| 제목·메모 표시 | 별도 영역 / 워터마크 | 별도 영역 |
| 카메라 손잡이 | 왼손 / 오른손 | 오른손 |

**원본** PDF 프리셋: HTML 임베드 최대 2400px, JPEG 92% (디스크 원본 파일은 미변경).

### 10.1 선택 모드 내보내기 파일명

| 항목 | 설명 |
|------|------|
| UI | 「PDF·이미지 파일명」 |
| PDF | 입력값 기준 `.pdf` |
| JPEG | 1장 `{name}.jpg`, 다장 `{name}_N.jpg` |
| 되돌리기 | `restore-export-filename.bat` §54 |

---

## 11. 제목·위치 UX 로드맵

| 단계 | 내용 | 상태 |
|------|------|------|
| A | 모달 열림 즉시 날짜·시간 제목, `capturedAt` 고정 | ✅ `8a9c7ce` |
| B | `getLastKnownPositionAsync` + GPS 타임아웃 | ✅ `c52a22e` |
| C | 구·동 먼저, 건물명 나중 표시 | 미구현 |
| D | 위치 확인 중 로딩 표시 | ✅ `02b0cb1` |
| D2 | 위치 실패 안내 문구 | 미구현 |

---

## 12. 커밋 로그 (최근)

```
b222581 Fix APK mic permission stripped by expo-image-picker config.
3eb9fd9 Sync PRD, PROJECT, PLAN, and RESTORE docs to commit 591666e.
591666e Add padding to app icon assets for adaptive icon safe zone.
919dbf2 Add .vercelignore to avoid local file lock during Vercel deploy.
565e4b3 Update app icon assets to the new VoiceStamp frame design.
ffa77bf Sync PRD, PROJECT, PLAN, and RESTORE docs to commit 3b6201a.
3b6201a Handle Android back: confirm exit on camera, navigate on sub-screens.
470606d Update PRD, PROJECT, and PLAN docs to commit 31332dc.
31332dc Use shared export filename for PDF and JPEG image saves.
f125897 Sync PRD, PROJECT, and PLAN docs to commit 539c4c4.
539c4c4 Add caption vs watermark layout setting for PDF and image export.
e4eada2 Treat gallery save as success when album grouping fails.
db111b3 Add JPEG export for selected stamps with title and memo.
b0086c0 Unify list and settings nav pill size with camera menu.
4d4e68b Show dot indicator while mic is listening.
5c7b1de Replace mic emoji with PNG icon in voice input.
86e06e5 Place mic button on left when left-hand mode is set.
111bc3c Add left/right hand camera menu placement setting.
c7d4925 Move camera side menu to bottom-right corner.
ecf2823 Reorganize camera and list navigation menus.
ab897ba Add separate PDF report title on first page.
6989370 Add PDF datetime settings and omit empty memo in exports.
354a942 Enlarge PDF stamp images in exported layout.
a32eff6 Align PDF images with title text alignment setting.
c05376a Add vertical scroll to settings screen for long content.
9f4a525 Show centered gear icon for settings on the stamp list footer.
```

---

## 13. 관련 문서

| 문서 | 설명 |
|------|------|
| [README.md](./README.md) | docs 폴더 문서 목록 |
| [PRD.md](./PRD.md) | 제품 요구사항 정의서 |
| [PLAN.md](./PLAN.md) | 개발 계획·로드맵 |
| [PRIVACY.md](./PRIVACY.md) | 개인정보 처리 안내 |
| [../RESTORE.md](../RESTORE.md) | 되돌리기 절차 (§8~56) |
| [../BUILD-APK.md](../BUILD-APK.md) | APK 빌드 |
| [../README.md](../README.md) | 프로젝트 루트 소개 |
| [../LICENSE](../LICENSE) | MIT 라이선스 |
| [../AGENTS.md](../AGENTS.md) | Expo SDK 56 문서 참조 규칙 |
