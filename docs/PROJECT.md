# VoiceStamp 프로젝트 현황

문서 작성일: **2026-06-14**  
최신 커밋 기준: `100e123` (main)

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
│   ├── components/         # CameraScreen, StampListScreen, StampSaveModal, StampSavePreview,
│   │                       # IntroScreen, SettingsScreen, TrashScreen, VoiceInputField,
│   │                       # StampExportCard, StampImageExportHost
│   ├── screens/            # MainScreen (공유 StampImageExportHost)
│   ├── services/           # saveStamp, fileService, exportPdf, exportStampImage,
│   │                       # renderStampWatermarkNative, settingsService, kakaoLocal, locationService,
│   │                       # stampFloor, pdfImageForExport, galleryService(.web), stampTrash,
│   │                       # stampRepository, stampFolderService, pickStampImage,
│   │                       # pdfTitleFormat
│   ├── hooks/              # useSpeechInput
│   ├── db/                 # database, schema
│   ├── types/              # stamp
│   └── utils/              # id, cameraPictureSize, geoDistance
├── android/                # 네이티브 Android (로컬 빌드용)
├── docs/                   # PRD, PROJECT, PLAN, PRIVACY, 문서 목록
├── build-apk.bat           # Release APK 빌드
├── public/                 # 정책 정적 HTML (info, privacy, license, help)
├── RESTORE.md              # 기능별 되돌리기 (§8~105)
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
| 카메라 | `CameraScreen.tsx` | 시스템 카메라 자동 실행(줌), 설정·목록, 손잡이별 하단 메뉴 |
| 저장 모달 | `StampSaveModal.tsx` | 장소명·저장 폴더·제목·메모·음성·전체 보기·폴더 선택 |
| 목록 | `StampListScreen.tsx` | 목록·선택·PDF·이미지 저장·수정·휴지통·⚙ 설정 |
| 휴지통 | `TrashScreen.tsx` | 터치 복원 |
| 설정 | `SettingsScreen.tsx` | 폴더·PDF·내보내기·손잡이·휴지통 비우기 |
| JPEG 캡처 | `StampExportCard.tsx`, `StampImageExportHost.tsx` | 캡션 합성 (ViewShot, MainScreen 공유) |
| 메인 | `MainScreen.tsx` | camera / list / settings / trash 전환, `BackHandler`, `StampImageExportHost` |

### 3.1 목록 화면 UI (현재)

| 영역 | 요소 |
|------|------|
| 상단 | 「← 카메라」(큰 버튼) · 「앨범」 |
| 헤더 | 저장 목록 · 휴지통 · **설정** · 선택/취소 |
| 본문 | 스탬프 카드 (600px+ 2열) |
| 선택 모드 | PDF·이미지 파일명 · 보고서 제목 · PDF 만들기/저장/공유 · 이미지 저장 |

### 3.2 Android 하드웨어 뒤로 (`MainScreen`)

| 현재 화면 | 동작 |
|-----------|------|
| 카메라 | 「앱 종료 / 아니오」 확인 → 종료 시 `BackHandler.exitApp()` |
| 목록 | 카메라로 |
| 설정 | 진입 화면으로 (목록에서 왔으면 목록, 카메라에서 왔으면 카메라) |
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
| 54 | 현장명·날짜별 앱 폴더·갤러리 앨범 | `9ae5725` | `restore-site-group.bat` §57 |
| 55 | 현장명 저장 모달 배치 | `ebda9cc` | `restore-site-modal.bat` §58 |
| 56 | 갤러리 앨범 (initialAsset) | `bbec4aa` | `restore-gallery-album-v2.bat` §59 |
| 57 | 갤러리 (Next API + 읽기) | `204ba88` | `restore-gallery-album-v3.bat` §60 |
| 58 | 갤러리 (쓰기 전용 + ID 캐시) | `3076dc6` | `restore-gallery-album-v4.bat` §61 |
| 59 | 장소명 라벨 문구 | `3b88fe9` | `restore-site-label.bat` §62 |
| 60 | 사진 전체 보기 | `27e5f6e` | `restore-image-viewer.bat` §63 |
| 61 | 전체 보기 삭제·버리기 | `cd7ed89` | `restore-image-viewer-delete.bat` §64 |
| 62 | 수정 화면 폴더·앨범 이동 | `2f2385b` | `restore-stamp-folder-edit.bat` §65 |
| 63 | 수정 화면 폴더 선택 모달 | `6baa947` | `restore-stamp-folder-picker.bat` §66 |
| 64 | 저장 폴더 `YYYYMMDD_장소명` 자동 채움 | `a3d4351` | `restore-site-group-full.bat` §64 |
| 65 | 웹 갤러리 스텁 (ExpoMediaLibraryNext 크래시 방지) | `59c7007` | `restore-gallery-web-stub.bat` §65 |
| 66 | 목록 선택 휴지통 후 스크롤 유지 | `5831512` | `restore-list-trash-scroll.bat` §66 |
| 67 | 휴지통 후 카메라→목록 무한 로딩 수정 | `bfb77d8` | `restore-list-silent-loading.bat` §67 |
| 68 | 수정 모달 휴지통 후 목록 스크롤 유지 | `b44c469` | `restore-edit-trash-scroll.bat` §68 |
| 69 | 목록 헤더 「설정」·설정 복귀(목록/카메라) | `a4a55d2` | `restore-info-leg04.bat` §69 |
| 70 | 앱 정보 링크·정책 웹페이지 (LEG-04) | `a4a55d2` | `restore-info-leg04.bat` §69 |
| 71 | 저장 폴더 기본 현장명 유지 (GPS→제목만) | `4f56b07` | `restore-site-folder-keep.bat` §70 |
| 72 | `/info` GitHub APK 다운로드 링크 | `3468630` | `restore-apk-download.bat` |
| 73 | 시스템 카메라 자동 실행 (줌, CameraView 제거) | `be8bd93` | `restore-system-camera-auto.bat` |
| 74 | 워터마크 JPEG 비율 보존 | `3306c3d` | `restore-watermark-aspect.bat` |
| 75 | 워터마크 픽셀 준비 + ViewShot | `ef71f5a` | `restore-watermark-pixel.bat` |
| 76 | 워터마크 네이티브 텍스트 합성 (`react-native-image-marker`) | `f61697d` | `restore-watermark-native.bat` |
| 77 | 저장 시 갤러리 모드 (원본만 / 캡션만 / 원본+캡션) | `6948a96` | `restore-gallery-save-mode.bat` |
| 78 | 학교 POI 우선 위치 제목 (`kakaoLocal` SC4) | `4b4d25d` | `restore-school-poi.bat` §71 |
| 79 | 온보딩 인트로 (최초 실행 3단계) | `784c163` | `restore-intro.bat` §72 |
| 80 | 온보딩 4단계 (`img/1-1`~`1-4`) | `db81ef9` | `restore-intro-4.bat` §73 |
| 81 | 온보딩 반응형 (`contain` + 하단 버튼) | `73ee56f` | `restore-intro-layout.bat` §74 |
| 82 | 온보딩 이미지 갱신 (이미지 내 버튼 제거) | `fac7734` | `restore-onboarding-images.bat` §75 |
| 83 | 온보딩 30일 미사용 재표시 | `c92ed84` | `restore-onboarding-30d.bat` §76 |
| 84 | 설정 → 온보딩 다시 보기 | `84a2447` | `restore-onboarding-replay.bat` §77 |
| 85 | 캡션 네이티브 합성 | `2844213` | `restore-caption-native.bat` §78 |
| 86 | 캡션 흰 여백·PNG | `5b1e3f4` | `restore-caption-white-png.bat` §79 |
| 87 | GPS 좌표 캡션·워터마크·PDF | `2196ece` | `restore-gps-caption.bat` §80 |
| 88 | 저장 모달 제목·메모 미리보기 | `3ece91f` | `restore-save-preview-text.bat` §81 |
| 89 | 저장 전체 화면 핀치 줌·이동 | `8e269a8` | `restore-save-zoom.bat` §82 |
| 90 | 크롭 적용 vs 닫기·`_orig` 보존 | `4a85cc8`, `ece0865` | `restore-save-viewer-actions.bat` §87 |
| 91 | 저장 후 갤러리 백그라운드 | `fc2423d` | `restore-save-fast-gallery.bat` §89 |
| 92 | 마이크 `(눌러서 말하기)` | `01f0f9e` | `restore-mic-hint.bat` §88 |
| 93 | 수정 모달 크롭·적용 | `7d908fd` | `restore-edit-crop.bat` §90 |
| 94 | 목록 PDF·이미지보내기 안내 | `fbcc872` | `restore-list-export-hint.bat` §91 |
| 95 | Intro 후 StartScreen (`start.png`) | `56898a7` | `restore-start-screen.bat` §92 |
| 96 | 웹 브라우저 카메라 | `9260376` | `restore-web-camera.bat` §93 |
| 97 | 학교 층 선택 (1~5, `school_only` 기본) | `f4201a7` | — |
| 98 | GPS 조회 전 300m 이전 장소 캐시 표시 | `e7e6147` | `restore-location-place-cache.bat` §94 |
| 99 | 좌표 표기 설정 (GPS/좌표/없음) | `f36601e` | `restore-coords-label.bat` §95 |
| 100 | 음성 입력 커서 위치 삽입 | `fb053f7` | `restore-speech-cursor.bat` §96 |
| 101 | 저장 모달 하단 취소·저장 고정 (키보드·내비) | `6b6e70a` | `restore-save-modal-footer.bat` §97 |
| 102 | 저장 모달 Android 내비 바 여백 | `4912535` | `restore-save-modal-nav-padding.bat` §98 |
| 103 | 저장 모달 720px 미리보기 썸네일 | `41dce4f` | `restore-save-preview-thumb.bat` §99 |
| 104 | Android 미리보기 URI 정규화 | `3cc3845` | `restore-save-preview-android-fix.bat` §100 |
| 105 | 워터마크 미리보기 180px 높이 (미해결) | `b72f0a2` | `restore-watermark-preview-layout.bat` §101 |
| 106 | 워터마크 미리보기 absoluteFill (미해결) | `19684c5` | `restore-watermark-preview-v2.bat` §102 |
| 107 | 워터마크 미리보기 캡션 슬롯 재사용 (**해결**) | `69c0b66` | `restore-watermark-preview-caption-slot.bat` §103 |
| 108 | 층 표기 설정 (`floor_display_mode`: suffix/cursor) | `0f5c7c2` | `restore-floor-display-mode.bat` §104 |
| 109 | 자동 제목 설정 (`title_datetime_mode`, 기본 `date`) | `100e123` | `restore-title-datetime-mode.bat` §105 |

> **참고:** `6cf82f5`(scrollToIndex 앵커)는 앱 종료로 `953c2cd`에서 되돌림. `eef0891`은 `5831512`로 대체됨. 워터마크 미리보기는 `69c0b66`에서 Android 수정 완료.

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
| react-native-view-shot | APK 캡션 합성 JPEG 캡처 |
| react-native-image-marker | APK 워터마크 네이티브 텍스트 합성 |
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

| 파일 | 커밋 | 비고 |
|------|------|------|
| **`VoiceStamp_20260614_114256.apk`** | `100e123` | **설치 권장 (로컬)** — 자동 제목(기본 날짜)·층 표기·전체 06-14 기능 |
| `VoiceStamp_20260614_113244.apk` | `0f5c7c2` | 층 표기(커서 삽입) |
| `VoiceStamp_20260614_110346.apk` | `69c0b66` | 워터마크 미리보기 수정 |
| `releases/VoiceStamp_20260613_234943.apk` | `484ac4c` | **GitHub 최신 커밋 APK** — 층 선택 (`f4201a7`), 06-14 수정 미포함 |
| `releases/VoiceStamp_20260613_114227.apk` | `b697025` | start·크롭·GPS·목록 안내 |
| `VoiceStamp_20260611_232649.apk` | `182f4e7` | 4단계 온보딩·반응형·이미지 갱신 |
| `VoiceStamp_20260611_222640.apk` | `e14950a` | 학교 POI 우선 위치 제목 |
| `VoiceStamp_20260611_184601.apk` | `0970d3d` | 저장 시 갤러리 원본/캡션/둘 다 |
| `VoiceStamp_20260610_233157.apk` | `4f56b07` | 저장 폴더 현장명 유지 (GPS→제목만) |
| `VoiceStamp_20260609_183510.apk` | `a4a55d2` | 목록 설정·앱 정보·정책 웹 |
| `VoiceStamp_20260609_181249.apk` | `b44c469` | 수정 모달 휴지통 스크롤 유지 |
| `VoiceStamp_20260609_175552.apk` | `bfb77d8` | 휴지통 후 목록 재진입 무한 로딩 수정 |
| `VoiceStamp_20260609_174552.apk` | `953c2cd` | 앵커 인덱스 되돌림 |
| `VoiceStamp_20260608_235051.apk` | `6baa947` | 수정 화면 폴더 선택 모달 |

### 7.4 APK 빌드별 수정 사항 (전체)

앱 **버전명**은 모두 `1.0.0` (`app.json`). 아래는 **파일명(빌드 시각)** 기준입니다. 주요 APK는 git에 포함되며, 로컬 `build-apk.bat`로 동일 이름으로 재빌드 가능합니다.

#### 2026-06-14

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260614_114256.apk` | `100e123` | 설정「자동 제목」(없음/날짜/날짜+시간, **기본 날짜**) | **권장** |
| `VoiceStamp_20260614_113244.apk` | `0f5c7c2` | 설정「층 표기」(제목 뒤 붙이기 / 제목 커서 삽입) | OK |
| `VoiceStamp_20260614_110346.apk` | `69c0b66` | 워터마크 미리보기: 캡션 120px 슬롯 재사용 + 텍스트 오버레이 (Android 수정 완료) | OK |
| `VoiceStamp_20260614_105426.apk` | `19684c5` | 워터마크 미리보기 v2 (`absoluteFill` Image) — 사진 미표시 | 보관용 |
| `VoiceStamp_20260614_104508.apk` | `b72f0a2` | 워터마크 미리보기 180px 고정 높이 — 사진 미표시 | 보관용 |
| `VoiceStamp_20260614_103920.apk` | `3cc3845` | Android 미리보기 URI 캐시 복사·`normalizeDisplayUri` | OK |
| `VoiceStamp_20260614_102657.apk` | `41dce4f` | 720px `prepareStampPreviewThumb`·로딩 스피너 | OK |
| `VoiceStamp_20260614_101510.apk` | `4912535` | 저장 모달 하단 `paddingBottom` 56 (내비 바) | OK |
| `VoiceStamp_20260614_100718.apk` | `6b6e70a` | 취소·저장을 ScrollView 밖 고정 (키보드·내비) | OK |
| `VoiceStamp_20260614_095801.apk` | `fb053f7` | 음성 입력 커서 위치 삽입 | OK |
| `VoiceStamp_20260614_095037.apk` | `f36601e` | 설정「좌표 표기」(GPS/좌표/없음) | OK |
| `VoiceStamp_20260614_093720.apk` | `e7e6147` | 300m 이내 이전 `placeLabel` 즉시 표시 | OK |

#### 2026-06-13 (후반)

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260613_234943.apk` | `484ac4c` | 학교 층 선택 칩 (1~5), 기본 `school_only` | **GitHub** |
| `releases/VoiceStamp_20260613_114227.apk` | `b697025` | start 배너·목록 안내·수정 크롭·저장 속도·줌/크롭·GPS | OK |
| `VoiceStamp_20260613_11xxxx.apk` 등 | `56898a7`~`9260376` | 동일 기능군 로컬 빌드 | 로컬 |

> **웹:** `9260376` 브라우저 카메라 — Vercel 반영. APK는 `234943` 이후 빌드에 포함.

#### 2026-06-13 (전반)

#### 2026-06-12

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| (문서·소스만) | `c92ed84`~`023118d` | 캡션 네이티브·흰 여백 PNG·온보딩 30일·설정 재생·한글 파일명 되돌림 | 소스만 (별도 APK 커밋 없음) |

#### 2026-06-11

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260611_232649.apk` | `182f4e7` | 온보딩 이미지 갱신 (`img/1-1`~`1-4`, 이미지 내 버튼 제거) | **권장** |
| `VoiceStamp_20260611_230629.apk` | `00d55d3` | 온보딩 `contain` + 하단 고정 RN 버튼 (다음/시작하기) | OK |
| `VoiceStamp_20260611_225542.apk` | `134b1a8` | 온보딩 4단계 슬라이드 | OK |
| `VoiceStamp_20260611_224610.apk` | `f21c4da` | 최초 온보딩 인트로 (3단계) | OK |
| `VoiceStamp_20260611_222640.apk` | `e14950a` | 학교 POI 우선 위치 제목 (카카오 SC4) | OK |
| `VoiceStamp_20260611_184601.apk` | `0970d3d` | 저장 시 갤러리: 원본만 / 캡션·워터마크만 / 원본+캡션 (`gallery_save_mode`) | OK |
| `VoiceStamp_20260611_182919.apk` | `f61697d` | 워터마크: `prepareExportPhoto` + `react-native-image-marker` (ViewShot 재캡처 제거) | OK |
| `VoiceStamp_20260611_180033.apk` | `ef71f5a` | 워터마크: 픽셀 준비 + ViewShot (중간 단계) | 보관용 |
| `VoiceStamp_20260611_174204.apk` | `3306c3d` | 워터마크 JPEG 비율 보존 (`aspectRatio`, `onLoadEnd`) | OK |
| `VoiceStamp_20260611_172409.apk` | `be8bd93` | 시스템 카메라 자동 실행 (줌), 앱 내 CameraView 제거 | OK |

#### 2026-06-10

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260610_233157.apk` | `4f56b07` | 저장 폴더: GPS로 덮어쓰지 않음, `current_site_name`+날짜 유지; 제목만 위치 반영 | **권장** |

#### 2026-06-09

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260609_183510.apk` | `a4a55d2` | 목록 헤더 설정, 설정→목록 복귀, 앱 정보(버전·개인정보·라이선스·도움말), `public/*.html` | OK |
| `VoiceStamp_20260609_181249.apk` | `b44c469` | 수정 모달 휴지통 후 목록 스크롤 유지 | OK |
| `VoiceStamp_20260609_175552.apk` | `bfb77d8` | 카메라→목록 재진입 무한 로딩 수정 | OK |
| `VoiceStamp_20260609_174552.apk` | `953c2cd` | scrollToIndex 앵커 되돌림 | OK |
| `VoiceStamp_20260609_173859.apk` | `6cf82f5` | scrollToIndex 앵커 (휴지통 반복) | **금지** (앱 종료) |
| `VoiceStamp_20260609_172915.apk` | `5831512` | 선택 휴지통 후 스크롤 유지 | OK |
| `VoiceStamp_20260609_151610.apk` | `59c7007` 근처 | 웹 갤러리 스텁·폴더 자동 채움 포함 빌드 | OK |
| `VoiceStamp_20260609_171954.apk` | — | 중간 빌드 (스크롤 UX 작업 중) | 보관용 |

#### 2026-06-08

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260608_235051.apk` | `6baa947` | 수정 화면 폴더 선택 모달 | OK |
| `VoiceStamp_20260608_233514.apk` | `2f2385b` | 수정 화면 폴더·갤러리 앨범 이동 | OK |
| `VoiceStamp_20260608_080743.apk` | `b222581` | APK `RECORD_AUDIO` 마이크 권한 복구 | OK |
| `VoiceStamp_20260608_003141.apk` | `591666e` | Adaptive Icon safe zone 여백 | OK |
| `VoiceStamp_20260608_001727.apk` | `565e4b3` | 3D 액자 앱 아이콘 | OK |
| `VoiceStamp_20260608_21xxxx.apk` 등 | `9ae5725`~`cd7ed89` | 장소·폴더·갤러리·전체보기 작업 중간 빌드 다수 | 보관용 |

#### 2026-06-07

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260607_145955.apk` | `3b6201a` | Android 뒤로가기 (카메라 종료 확인) | OK |
| `VoiceStamp_20260607_12xxxx.apk` ~ `13xxxx.apk` | `31332dc` 이전 | PDF·JPEG·UI 고도화 중간 빌드 | 보관용 |

#### 2026-06-06

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| (초기 다수) | `e4fe0d3` ~ | MVP·PDF·위치·휴지통·갤러리 | 보관용 |

**웹 정책 URL (APK와 별도, Vercel만 갱신 가능):**  
https://voicestamp-gilt.vercel.app/privacy · /license · /help · /info

---

## 8. 서비스 모듈

| 모듈 | 역할 |
|------|------|
| `saveStamp.ts` | 저장·수정, 갤러리·폴더 이동 오케스트레이션 |
| `fileService.ts` | persist, 그룹 폴더, `moveStampImageToGroup`, rename |
| `stampRepository.ts` | SQLite CRUD, `gallery_asset_id`, soft delete |
| `stampFolderService.ts` | 수정 모달용 기존 폴더 목록 수집 |
| `stampTrash.ts` | 휴지통 이동·복원·비우기 |
| `galleryService.ts` | MediaLibrary Next, 앨범 저장·이동, asset ID 반환 |
| `galleryService.web.ts` | 웹 스텁 (네이티브 갤러리 모듈 미로드) |
| `infoUrls.ts` | 정책 웹 URL·`Linking.openURL` |
| `settingsService.ts` | 앱 설정, `current_site_name`, `gallery_album_ids` |
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

설정 **「자동 제목」** (`title_datetime_mode`, 기본 `date`):

| 모드 | 접두 형식 | 예 (장소 없음) |
|------|-----------|----------------|
| `none` | 없음 | (빈 제목) |
| `date` | `YYYYMMDD` | `20260614` |
| `datetime` | `YYYYMMDD_HHmm` | `20260614_1142` |

1. 저장 모달 열림 → **즉시** `formatDefaultStampTitle(capturedAt)` (위 모드 적용)
2. 동시에 「위치 확인 중…」 표시
3. `getCurrentPlaceLabel()`: `getLastKnownPositionAsync`(5분) → `getCurrentPositionAsync`(6초 타임아웃) → 카카오 API
4. 성공 시 같은 `capturedAt`으로 `formatDefaultStampTitle(capturedAt, 장소)` 갱신
5. 실패 시 날짜·시간 제목 유지
6. 사용자 제목 수정·제목 마이크 시작 시 자동 덮어쓰기 중단

예 (`date`): `20260614` → `20260614_강남구역삼동래미안`  
예 (`datetime`): `20260614_1815` → `20260614_1815_강남구역삼동래미안`

### 9.1 저장 폴더(앨범) — `4f56b07`

1. 모달 열림 → `current_site_name`이 있으면 `refreshStampGroupDate` (날짜만 오늘로, 현장명 유지)
2. 없으면 `YYYYMMDD`만 표시
3. GPS 완료 후 **폴더명은 변경하지 않음** (제목만 §9 규칙 적용)
4. 저장 시 `setCurrentSiteName` — 다음 촬영 기본 폴더 갱신
5. 사용자 폴더 입력·**[선택]** 으로 변경 가능

예: `20260610_OO초` 유지, 제목만 `20260610_1430_강남구역삼동` 추가

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

## 12. 날짜별 수정 상세

### 2026-06-14

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`100e123` 기준) |
| `100e123` | 설정「자동 제목」(`title_datetime_mode`: none/date/datetime, **기본 date**) (`restore-title-datetime-mode.bat` §105) |
| `0f5c7c2` | 설정「층 표기」(`floor_display_mode`: suffix/cursor) (`restore-floor-display-mode.bat` §104) |
| `481b418` | PRD·PROJECT·PLAN·README 문서 동기화 (`69c0b66` 기준) |
| `69c0b66` | 워터마크 썸네일: 별도 영역과 동일 120px 사진 슬롯 + 텍스트 오버레이 (`restore-watermark-preview-caption-slot.bat` §103) |
| `19684c5` | 워터마크 미리보기 `absoluteFill` Image + `layoutSettingsLoaded` 게이트 (§102, 미해결) |
| `b72f0a2` | 워터마크 미리보기 180px 고정 높이 (§101, 미해결) |
| `3cc3845` | Android 미리보기 URI 캐시·`normalizeDisplayUri` (`restore-save-preview-android-fix.bat` §100) |
| `41dce4f` | 720px `prepareStampPreviewThumb`·로딩 스피너 (`restore-save-preview-thumb.bat` §99) |
| `4912535` | 저장 모달 `paddingBottom: 56` (`restore-save-modal-nav-padding.bat` §98) |
| `6b6e70a` | 취소·저장 버튼 ScrollView 밖 고정 (`restore-save-modal-footer.bat` §97) |
| `fb053f7` | 음성 입력 커서 위치 삽입 (`restore-speech-cursor.bat` §96) |
| `f36601e` | 설정「좌표 표기」(`coords_label`: gps/coords/off) (`restore-coords-label.bat` §95) |
| `e7e6147` | 300m 이내 이전 `placeLabel` 즉시 표시 (`restore-location-place-cache.bat` §94) |
| `b646e84` | PLAN §12 NCP Object Storage 백업 설계 (문서만) |

### 2026-06-13 (후반)

| 커밋 | 내용 |
|------|------|
| `484ac4c` | GitHub `releases/VoiceStamp_20260613_234943.apk` |
| `f4201a7` | 학교 층 선택 (1~5), `floor_picker_mode` 기본 `school_only`, DB `floor` 컬럼 |
| `76f575c` | PRD·PROJECT·PLAN·README 문서 동기화 (`9260376` 기준) |

### 2026-06-13

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`9260376` 기준) |
| `9260376` | 웹: `launchCameraAsync` 브라우저 카메라, 런처 차단 제거 (`restore-web-camera.bat` §93) |
| `b697025` | GitHub `releases/VoiceStamp_20260613_114227.apk` |
| `56898a7` | Intro 후 `StartScreen` (`assets/start.png`, 7일 숨김) (`restore-start-screen.bat` §92) |
| `fbcc872` | 목록 PDF·이미지 내보내기 안내 (`restore-list-export-hint.bat` §91) |
| `7d908fd` | 수정 모달 크롭·적용, `_orig` 유지 (`restore-edit-crop.bat` §90) |
| `fc2423d` | `insertStamp` 후 갤러리 백그라운드 (`restore-save-fast-gallery.bat` §89) |
| `01f0f9e` | 마이크 `(눌러서 말하기)` (`restore-mic-hint.bat` §88) |
| `ece0865` | 저장 미리보기 **닫기** vs **적용**(크롭) (`restore-save-viewer-actions.bat` §87) |
| `00a521d` | 줌 후 팬 제스처 수정 |
| `4a85cc8` | 저장 시 크롭 + `_orig` 내부 보관 |
| `00a1979` | Modal `GestureHandlerRootView` — 핀치 줌 수정 |
| `b7f0dec` | Vercel 웹 빌드 `babel-preset-expo` |
| `8e269a8` | 저장 전체 화면 핀치 줌 뷰어 |
| `3ece91f` | 저장 모달 썸네일 제목·메모 오버레이 |
| `2196ece` | 캡션·워터마크·PDF GPS 좌표 표시 |

### 2026-06-12

| 커밋 | 내용 |
|------|------|
| `023118d` | 갤러리 한글 파일명 되돌림 (저장 안정성) |
| `69a2246` | (되돌림됨) 갤러리 한글 파일명 시도 |
| `5b1e3f4` | 캡션 흰 여백·PNG·JPEG 품질 |
| `2844213` | 캡션 네이티브 합성 (`react-native-image-marker`) |
| `84a2447` | 설정 → 온보딩 다시 보기 |
| `c92ed84` | 30일 미사용 시 온보딩 재표시 |
| `4afd538` | 문서 동기화 (`182f4e7` 기준) |

### 2026-06-11

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`182f4e7` 기준) |
| `182f4e7` | APK `VoiceStamp_20260611_232649` — 온보딩 이미지 갱신 빌드 |
| `fac7734` | 온보딩 이미지 교체 (이미지 내 버튼 제거, RN 푸터 버튼 유지) (`restore-onboarding-images.bat`) |
| `00d55d3` | APK `VoiceStamp_20260611_230629` — 온보딩 레이아웃 빌드 |
| `73ee56f` | 온보딩 `contain` + 하단 고정 버튼 (`restore-intro-layout.bat`) |
| `134b1a8` | APK `VoiceStamp_20260611_225542` — 4단계 온보딩 빌드 |
| `db81ef9` | 온보딩 4단계 (`img/1-1`~`1-4`) (`restore-intro-4.bat`) |
| `f21c4da` | APK `VoiceStamp_20260611_224610` — 온보딩 인트로 빌드 |
| `784c163` | 최초 실행 온보딩 인트로 (`restore-intro.bat`) |
| `e14950a` | APK `VoiceStamp_20260611_222640` — 학교 POI 빌드 |
| `4b4d25d` | 학교 POI 우선 위치 제목 (`restore-school-poi.bat`) |
| `a45a750` | 문서 동기화 (`0970d3d` 기준) |
| `0970d3d` | APK `VoiceStamp_20260611_184601` — 갤러리 저장 모드 빌드 |
| `6948a96` | 저장 시 갤러리 `original_only` / `caption_only` / `original_and_caption` (`restore-gallery-save-mode.bat`) |
| `f61697d` | 워터마크 네이티브 합성 `renderStampWatermarkNative` (`restore-watermark-native.bat`) |
| `ef71f5a` | 워터마크 `prepareExportPhoto` + ViewShot (`restore-watermark-pixel.bat`) |
| `74e23f9` | `exportStampImage.ts` UTF-8 복구 |
| `3306c3d` | 워터마크 aspect ratio (`restore-watermark-aspect.bat`) |
| `be8bd93` | 시스템 카메라 자동 실행 (`restore-system-camera-auto.bat`) |
| `876f390` | 문서 동기화 (`4f56b07` 기준) |
| `b9a9b89` | APK `VoiceStamp_20260610_233157` |

### 2026-06-10

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`4f56b07` 기준) |
| `4f56b07` | 저장 폴더 GPS 덮어쓰기 제거 — `current_site_name`+날짜 유지, 제목만 위치 반영 (`restore-site-folder-keep.bat` §70) |
| `3468630` | `/info` GitHub Releases APK 다운로드 링크 (`restore-apk-download.bat`) |
| `453e160` | 문서 동기화 (`a4a55d2` 기준) |

### 2026-06-09

| 커밋 | 내용 |
|------|------|
| `a4a55d2` | 목록 헤더 설정·설정 복귀 분기·앱 정보 섹션·`public/*.html`·`vercel.json` rewrites (LEG-04) |
| `89a9ee2` | 문서 동기화 (`b44c469` 기준) |
| `b44c469` | 수정 모달 `onTrashed` + `removeStampsKeepScroll` — 휴지통 후 목록 스크롤 유지 |
| `bfb77d8` | `silent` load 완료 시에도 `setLoading(false)` — 카메라→목록 재진입 무한 로딩 해결 |
| `953c2cd` | `scrollToIndex` 앵커 방식 되돌림 (앱 종료) |
| `6cf82f5` | (되돌림됨) 반복 휴지통 이동 시 scrollToIndex 앵커 |
| `5831512` | `skipRefreshLoadRef` + `scrollToOffset` — 선택 휴지통 후 스크롤 유지 |
| `eef0891` | (대체됨) silent load로 목록 스크롤 유지 1차 시도 |
| `59c7007` | `galleryService.web.ts` — 웹 `ExpoMediaLibraryNext` 크래시 수정 |
| `a3d4351` | 저장 모달 저장 폴더 `YYYYMMDD_장소명` 자동 채움·기존 폴더 선택 |

### 2026-06-08

| 커밋 | 내용 |
|------|------|
| `cc5c3f1` | 문서 동기화 (`6baa947` 기준) |
| `6baa947` | 수정 화면 저장 폴더 선택 모달 |
| `2f2385b` | 수정 화면 저장 폴더·갤러리 앨범 이동 |
| `cd7ed89` | 전체 보기에서 사진 버리기·휴지통 |
| `27e5f6e` | 저장·수정 모달 사진 전체 보기 |
| `3b88fe9` ~ `9ae5725` | 장소명·날짜_장소 폴더·갤러리 앨범 분류 |
| `b222581` | APK `RECORD_AUDIO` 권한 복구 |
| `591666e` · `565e4b3` | 3D 액자 아이콘·safe zone |
| `3b6201a` | Android 뒤로가기 |

### 2026-06-07

| 커밋 | 내용 |
|------|------|
| `31332dc` | PDF·JPEG 공통 파일명 |
| `539c4c4` | 별도 영역 / 워터마크 레이아웃 |
| `db111b3` | 합성 JPEG 갤러리 저장 |
| `111bc3c` ~ `ecf2823` | 손잡이·카메라·목록 메뉴 UI |
| `ab897ba` ~ `6989370` | PDF 보고서 제목·일시·정렬·이미지 크기 |
| `1020bae` | 앨범·카메라 앱 사진 가져오기 |
| `9f4a525` · `a49a374` | 목록 ←카메라·⚙설정 |
| `50cd4bf` · `4e8675d` | 휴지통·갤러리 VoiceStamp 앨범 |
| `e1d45a0` | PRD·PROJECT 문서 최초 추가 |

### 2026-06-06

| 커밋 | 내용 |
|------|------|
| `e4fe0d3` | VoiceStamp 초기 앱 (카메라·음성·스탬프·APK) |
| `a78d347` | PDF·Vercel 웹 배포 |
| `2ec2768` | 카카오 역지오코딩 위치 제목 |
| `50cd4bf` | 휴지통 소프트 삭제 |
| `4e8d3f2` · `57c6fb0` | PDF 화질·페이지당 장수 |
| `b5faa2f` · `1224df8` | 설정 폴더·PDF 파일명 |

### 2026-06-05

| 커밋 | 내용 |
|------|------|
| `0b446a2` | Initial commit |

---

## 13. 커밋 로그 (최근)

```
100e123 Add auto title datetime mode setting with date default.
0f5c7c2 Add floor display mode setting for cursor insert.
481b418 Sync PRD, PROJECT, PLAN, and README docs to commit 69c0b66.
69c0b66 Use caption photo slot for watermark thumbnail preview.
19684c5 Render watermark preview with direct Image fill on Android.
… (이전 커밋은 `git log` 참고)
```

---

## 14. 관련 문서

| 문서 | 설명 |
|------|------|
| [README.md](./README.md) | docs 폴더 문서 목록 |
| [PRD.md](./PRD.md) | 제품 요구사항 정의서 |
| [PLAN.md](./PLAN.md) | 개발 계획·로드맵 |
| [DESIGN-INFO-PAGES.md](./DESIGN-INFO-PAGES.md) | 정보·법무 페이지 설계·구현 (`a4a55d2`) |
| [PRIVACY.md](./PRIVACY.md) | 개인정보 처리 안내 |
| [../RESTORE.md](../RESTORE.md) | 되돌리기 절차 (§1~105) |
| [../BUILD-APK.md](../BUILD-APK.md) | APK 빌드 |
| [../README.md](../README.md) | 프로젝트 루트 소개 |
| [../LICENSE](../LICENSE) | MIT 라이선스 |
| [../AGENTS.md](../AGENTS.md) | Expo SDK 56 문서 참조 규칙 |
