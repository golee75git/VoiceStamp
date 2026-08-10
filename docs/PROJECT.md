# VoiceStamp 프로젝트 현황

문서 작성일: **2026-07-31**
문서 동기화: **2026-08-10** — 08-08~10 취합·엑셀·QR · [CHANGELOG.md](./CHANGELOG.md) · **본 커밋 소스 없음** (권장 APK `113846`)
최신 기능 커밋 기준: `54c93d2` / APK `89b643d` (`143848`)
변경 이력: [CHANGELOG.md](./CHANGELOG.md)
성능·헬스체크: [HEALTHCHECK.md](./HEALTHCHECK.md) (번들 A/B/C 기준선 `193317`)

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
├── docs/                   # PRD, PROJECT, PLAN, PRIVACY, DESIGN-*, drafts/google-sheets-upload
├── build-apk.bat           # Release APK 빌드
├── public/                 # 정책 정적 HTML (info, privacy, license, help)
├── RESTORE.md              # 기능별 되돌리기 (§8~111)
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
| JPEG 캡처 | `StampExportCard.tsx`, `StampImageExportHost.tsx`, `renderStampCaptionNative.ts` | 캡션 합성 (네이티브 불투명 JPEG; ViewShot은 호스트만 유지) |
| 메인 | `MainScreen.tsx` | camera / list / settings / trash 전환, `BackHandler`, `StampImageExportHost` |

### 3.1 목록 화면 UI (현재)

| 영역 | 요소 |
|------|------|
| 헤더 | 마이크 아이콘 · 저장 목록 · 선택/취소 · ⋮ 메뉴 (휴지통·설정·앱 정보) |
| 본문 | 스탬프 카드 (600px+ 2열) |
| 하단 | **갤러리** 캡슐 이미지 (`gallery.png`) · **촬영** 캡슐 이미지 (`capture.png`) — 시스템 내비 위 31px |
| 선택 모드 | PDF·이미지 파일명 · 보고서 제목 · PDF 만들기/저장/공유 · 이미지 저장 · 프로젝트·엑셀·HWPX · **파일명·보고서 제목 편집** 모달 |

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
| 110 | 선택 모드 **프로젝트 ZIP**·**XLSX** 내보내기 | `6737f13` | — |
| 111 | 웹 `/report` 썸네일 라이트박스 확대 | `84d13a7` | — |
| 112 | XLSX 썸네일 A열 배치 | `946360e` | — |
| 113 | **HWPX** 내보내기 (한컴 호환 템플릿) | `503e81a` | — |
| 114 | HWPX BinData jpeg→jpg·템플릿 렌더·APK `expo-asset` 로드 | `c112cb0`~`9ab30ee` | — |
| 115 | 카메라 홈 스플래시 (`camera-home.png`) | `338d919` | — |
| 116 | 카메라 홈 중앙 정렬·설정 아이콘/텍스트 UI 반복 | `8d282e6`~`027c6fa` | — |
| 117 | 카메라 홈 리디자인 (스플래시·촬영·하단 아이콘) | `7bf21fc` | — |
| 118 | 설정 톱니 PNG (`settings-icon.png`) | `ae0695f` | — |
| 119 | 목록 카메라-back 아이콘 | `3fca65b` | — |
| 120 | 목록 **첨부(클립) 아이콘** | `f110256` | — |
| 121 | 목록 UI (마이크 헤더·⋮ 메뉴·전체 N개·하단 첨부·촬영·카드) | `7c127aa` | — |
| 122 | 목록 하단바 시스템 내비 여백 (31px 상향) | `109bfa3` | `restore-list-bottom-lift.bat` |
| 123 | 목록 첨부 아이콘 28px 꽉 참 | `9ceb325` | `restore-list-attach-icon-full.bat` |
| 124 | 목록 갤러리 아이콘+「갤러리」라벨 | `72ccc32` | `restore-list-gallery-button.bat` |
| 125 | 목록 **갤러리 캡슐** 버튼 (`gallery.png`) | `0d7e72d` | `restore-list-gallery-pill.bat` |
| 126 | 목록 **촬영 캡슐** 버튼 (`capture.png`) | `7e453ea` | `restore-list-capture-pill.bat` |
| 127 | **워터마크 스타일** 설정 (검은 반투명 / 빨간 세로줄) | `534c9f7` | `restore-watermark-style.bat` §106 |
| 128 | 워터마크 **흰색 반투명** (`solid_light`), 세로줄 제거 | `87c7e15` | `restore-watermark-solid-light.bat` §107 |
| 129 | `/report` **클라이언트 JPEG ZIP** | `b9edc0e` | `restore-report-watermark.bat` |
| 130 | `/report` JPEG **글자 크기** 75~150% | `24d8fac` | `restore-report-textscale.bat` |
| 131 | 보라 VS **마이크 앱 아이콘** | `b2d5456` | — |
| 132 | Adaptive Icon **safe zone** 68% | `792df0c` | `restore-icon-safezone.bat` |
| 133 | **기관명·하단 문구** 오버레이 | `78fd3e6` | `restore-overlay-text.bat` |
| 134 | 워터마크 **10색 칩** 팔레트 | `35bdba6` | `restore-watermark-palette.bat` |
| 135 | 워터마크 **파스텔** 팔레트 | `60a9754` | `restore-watermark-pastel.bat` |
| 136 | 오버레이 **워터마크 한 바** 통합 | `3e6a90d` | `restore-overlay-watermark-layout.bat` |
| 137 | 설정 **뒤로가기 이미지 버튼** (`back-icon.png`, 하단 왼쪽 83px) | `8a9357b`~`4033f68` | — |
| 138 | 저장 미리보기 `isThumbnail` 선언 순서 (웹·앱 저장 모달 흰 화면) | `3af9203` | `git revert 3af9203` |
| — | *(시도·되돌림)* 위치 표시 3모드 (교육/공공/일반) | `08c132a` → `5699d9c` | — |
| — | *(시도·되돌림)* 위치 fast snapshot·GPS 3초·카카오 5초 타임아웃 | `c612e69` → `24e4b5e` | — |
| 139 | 위치 제목: **학교 200m 이내 학교명**, 그 외 **건물명→도로명** (`kakaoLocal.ts`) | `7b6b0c1` | `git revert 7b6b0c1` |
| 140 | 앱 내 **오픈소스 라이선스**·`open_source_licenses.json`·[LICENSE-NOTICE.md](./LICENSE-NOTICE.md) (LEG-06) | `2a5b75b` | — |
| 141 | **로컬 학교 DB** (공공데이터 CSV→JSON seed, 카카오 SC4 fallback) | `55c33df` | `restore-local-school-db.bat` |
| 142 | 빌드 타임 **`schools.sqlite`** (JSON seed 제거, 부팅 블로킹 해소) | `88671c1` | `restore-schools-sqlite.bat` |
| 143 | 저장 목록 **제목·메모 검색** (`stampListSearch`) | `eaa17e4` | `restore-list-search.bat` |
| 144 | **좌표 표기 없음=숨김** (`coords_label` off → null) | `3ecb4f4` | `restore-coords-off-hide.bat` §108 |
| 145 | 촬영 확인 후 **3버튼** (`CaptureActionSheet`) | `ec4930e` | `restore-capture-action-sheet.bat` §110 |
| 146 | **연속 촬영** 직전 위치·장소명 재사용 (`quickCaptureSave`) | `b5922eb` | `restore-quick-capture-location.bat` §111 |
| 147 | 촬영 확인 시트 열림 중 **GPS 프리페치** | `f5f1592` | `restore-capture-location-prefetch.bat` |
| 148 | 연속 촬영 **인앱 카메라** 옵션 | `e971934` | `restore-continuous-in-app-camera.bat` |
| 149 | 카메라 홈 스플래시 **flex 확대** | `a89e166` | `restore-camera-home-splash-size.bat` |
| 150 | 웹 휴지통 이동 **`confirmAlert`** (`window.confirm`) | `fcbf747` | `restore-web-trash-confirm.bat` |
| 151 | 웹 휴지통 비우기 **`confirmAlert`** | `4745255` | `restore-web-empty-trash-confirm.bat` |
| 152 | 웹 **`/` APK 랜딩** · **`/app`** 웹 테스트 앱 | `0c7e2dd` | `restore-root-landing.bat` |
| 153 | `expo export` 후 **`dist/index.html` 스왑** (랜딩/앱 분리) | `0ab0f93` | `restore-web-root-layout.bat` |
| 154 | 랜딩 **개인정보·APK 권장** 안내 패널 | `e6bb868` | `restore-landing-privacy.bat` |
| 155 | **휴지통 비우기** → 휴지통 화면 (설정에서 제거) | `64d6728` | `restore-trash-empty-in-trash.bat` |
| 156 | 목록 선택 **보내기 하단바**·헤더 축소·파일명 접기 | `ecb3fe1` | `restore-list-export-bottom-bar.bat` |
| 157 |보내기 하단바 **Android 내비 여백 31px** | `c5cbeec` | `restore-export-bottom-lift.bat` |
| 158 | 휴지통 비우기 후 **완료→목록** · `← 목록` 제거 | `64aa037` | `restore-trash-empty-back.bat` |
| 159 | GitHub APK `releases/20260624_094846` · 랜딩 링크 | `64aa037` | `restore-apk-download-20260624-094846.bat` |
| 160 | 랜딩 **방문자 집계** (`api/visitor.js`, `localStorage` 당일 1회) | `4b71431` · `608357d` | `restore-visitor-counter.bat` §112 |
| 161 | CountAPI(`countapi.xyz`) 중단 → **countapi.mileshilliard.com** 프록시 | `608357d` | (160과 동일) |
| 162 | 랜딩 푸터 저작권 **Lee Hyung Woo** (영문) | `f50a2fb` | — |
| 163 | **도로·지번·근처 POI** 위치 제목 fallback (`kakaoLocal.ts`, 학교 300m) | `511a67c` | `restore-road-place-fallback.bat` |
| 164 | 갤러리 **한글 파일명**·원본 `_orig` (경로 한글 → 저장 실패 이슈) | `143a140` | `restore-gallery-filename.bat` |
| 165 | 갤러리 **MediaStore DISPLAY_NAME** 한글 (`modules/voicestamp-gallery`) | `44997be` | `restore-gallery-display-name.bat` |
| 166 | 캡션 갤러리 JPEG **EXIF 복사**(ISO·GPS·크기, `androidx.exifinterface`) | `847ea63` | `restore-caption-exif.bat` |
| 167 | GitHub APK `releases/20260625_171805` · 랜딩·`/info` 링크 | `847ea63` | `restore-apk-download-20260625-171805.bat` |
| 168 | 저장 모달 **별도 장소** 필드 (`place_label`) | `e330e7e` | `restore-place-label.bat` |
| 169 | 마이크 **abort 무시**·`end` 이벤트 처리 | `565c089` | `restore-speech-mic-end.bat` |
| 170 | 마이크 **silence 옵션 제거**·`end` 처리 | `62d9ab7` | — |
| 171 | Android 음성 **silence 타임아웃** +1s | `ff6fee6` | `restore-speech-silence.bat` |
| 172 | **ML Kit** 장면 키워드 메모 초안 (시도) | `43d1f13` | `restore-mlkit-scene.bat` |
| 173 | ML Kit **되돌림** | `0869e93` | — |
| 174 | 랜딩 **웹 테스트 안내** 패널 제거 | `467059d` | `restore-landing-no-webtest-box.bat` |
| 175 | 랜딩 **사진 이용 책임** 안내 | `e79a4ac` | `restore-landing-photo-notice.bat` |
| 176 | 랜딩 **앱 정보** 링크 제거 | `622398d` | `restore-landing-no-info-link.bat` |
| 177 | **장소** 필드 마이크 | `b06310a` | `restore-place-speech.bat` §115 |
| 178 | 음성 **끝 공백·커서** (장소·제목·메모) | `0b5c1b8` | `restore-speech-end-gap.bat` §116 |
| 179 | **도로명+POI 근처** 장소 표기 | `fb0363b` | `restore-place-road-poi.bat` §117 |
| 180 | GitHub APK `releases/20260626_172205` · 랜딩·`/info` 링크 | `fb0363b` | `restore-apk-download-20260626-place-road-poi.bat` |
| 181 | 촬영 후 3버튼 **눌림 배경·Android 리플** | `a780b27` | `restore-capture-button-press.bat` |
| 182 | GitHub APK `releases/20260626_184823` · 랜딩·`/info` 링크 | `6f95aa8` | `restore-apk-download-20260626-184823.bat` |
| 183 | 설정 **위치 조회 끔** (`location_mode`) | `ab0a015` | `restore-location-off.bat` |
| 184 | GitHub APK `releases/20260626_194421` · 랜딩·`/info` | `bdf4376` | `restore-apk-download-20260626-194421.bat` |
| 185 | 학교·POI 반경 **300m→200m** | `a546968` | `restore-school-radius-200.bat` |
| 186 | GitHub APK `releases/20260626_225833` · 랜딩·`/info` | `26e8975` | `restore-apk-download-20260626-225833.bat` |
| 187 | **층 칩→장소** 표기·수정 모달 입력 안정화 | `86a2637` | `restore-floor-on-place.bat` |
| 188 | GitHub APK `releases/20260626_231436` · 랜딩·`/info` | `480e01f` | `restore-apk-download-20260626-231436.bat` |
| 189 | 음성 **수동 커서** 위치 존중 (`prepareSpeechTarget`) | `250a97d` | `restore-speech-cursor-respect.bat` |
| 190 | GitHub APK `releases/20260626_233248` · 랜딩·`/info` | `1940314` | `restore-apk-download-20260626-233248.bat` |
| 191 | 시스템 카메라 복귀 **busy 오버레이 깜빡임** (`AppState`) | `547b693` | `restore-camera-busy-overlay.bat` |
| 192 | GitHub APK `releases/20260627_092959` · 랜딩·`/info` | `547b693` | `restore-apk-download-20260627_092959.bat` |
| 193 | 랜딩 **QR·Web Share** (qrcodejs MIT 자체 호스팅) | `800971a` | `restore-landing-share.bat` |
| 194 | `restore-landing-share.bat`에 `license.html` 포함 | `4b6834d` | — |
| 195 | 촬영 prefetch 후 저장 모달 **중복 위치 조회 생략**·학교 DB fast path | `2b830ba` | `restore-location-prefetch-school.bat` |
| 196 | GitHub APK `releases/20260701_145618` · 랜딩·`/info` | `ff22c24` | `restore-apk-download-20260701_145618.bat` |
| 197 | 저장 모달 **즉시 미리보기**·prefetch 스냅샷·설정 **APK 파일명** | `a7e7504` | `restore-save-preview-fast.bat` |
| 198 | GitHub APK `releases/20260701_153110` · 랜딩·`/info` | `9e1821c` | `restore-apk-download-20260701_153110.bat` |
| 199 | 카메라 **위치 워밍업**·lastKnown GPS 우선·촬영 시트 장소 표시 | `0f53afe` | `restore-location-warmup.bat` |
| 200 | GitHub APK `releases/20260701_160259` · 랜딩·`/info` | `5f63f07` | `restore-apk-download-20260701_160259.bat` |
| 201 | 3버튼 시트 **fast 위치만**·정밀 GPS 백그라운드 | `a072bc4` | `restore-location-fast-sheet.bat` |
| 202 | GitHub APK `releases/20260701_163737` · 랜딩·`/info` | `5b150a3` | `restore-apk-download-20260701_163737.bat` |
| 203 | 설정 **촬영 후** (선택 화면 / 저장 화면 바로) | `b8c4406` | `restore-capture-after-mode.bat` |
| 204 | GitHub APK `releases/20260701_165406` · 랜딩·`/info` | `61ca32a` | `restore-apk-download-20260701_165406.bat` |
| 205 | 로컬 **학교명만** 표시 (Kakao region 생략) | `85460bf` | `restore-school-skip-region.bat` |
| 206 | GitHub APK `releases/20260701_221146` · 랜딩·`/info` | `d809e99` | `restore-apk-download-20260701_221146.bat` |
| 207 | 저장 모달 **성능** (워밍·설정 캐시·미리보기 지연) | `cff5cf3` | `restore-save-modal-perf.bat` |
| 208 | GitHub APK `releases/20260701_225211` · 랜딩·`/info` | `b641d78` | `restore-apk-download-20260701_225211.bat` |
| 209 | 촬영 후 **처리 중 오버레이** (런처 깜빡임 방지) | `52c8578` | `restore-post-capture-busy.bat` |
| 210 | GitHub APK `releases/20260701_230340` · 랜딩·`/info` | `376368b` | `restore-apk-download-20260701_230340.bat` |
| 211 | 갤러리 **앱만** 저장 모드 | `61bb13a` | `restore-gallery-app-only.bat` |
| 212 | GitHub APK `releases/20260703_143138` · 랜딩·`/info` | `61bb13a` | — |
| 213 | **위치 끔**이어도 저장 모달 **장소 입력** | `c3b1bef` | `restore-place-field-always.bat` |
| 214 | GitHub APK `releases/20260703_152212` · 랜딩·`/info` | `c3b1bef` | — |
| 215 | PDF **캡션 너비=사진** (별도 영역) | `af6609e` | `restore-pdf-caption-fit.bat` |
| 216 | GitHub APK `releases/20260703_154800` · 랜딩·`/info` | `af6609e` | — |
| 217 | PDF **페이지内 동일 photo-slot**·`object-fit: contain` | `baf6a30` | `restore-pdf-photo-slot.bat` |
| 218 | GitHub APK `releases/20260703_162433` · 랜딩·`/info` | `baf6a30` | — |
| 219 | 저장·수정 미리보기 **확대/수정 배지** (`zoomedit.png`) | `e04ce17` | `restore-stamp-preview-zoom-badge.bat` §130 |
| 220 | 미리보기 배지 **`zoom.png`** + 투명 배경 처리 | `08cf91b`·`822e830`·`f6d33fd` | `restore-stamp-zoom-png.bat` §131 · `restore-zoom-transparent.bat` §133 |
| 221 | 목록 내보내기 **파일명·보고서 제목 모달** (`ExportNameModal`) | `91ce71f` | `restore-list-export-name-modal.bat` §132 |
| 222 | GitHub APK `releases/20260706_112756` · 랜딩·`/info` | `f6d33fd` | `restore-apk-download-20260706_112756.bat` |

| 223 | **위치 끔** 시 **직전 장소** 자동 채움 | `392e611` | `restore-last-place-off.bat` §134 |
| 224 | GitHub APK `releases/20260709_140843` · 랜딩·`/info` | `392e611` | — |
| 225 | **일반 촬영 카메라** (시스템/앱 내) 설정 | `fc076c8` | `restore-primary-capture-camera.bat` §135 |
| 226 | GitHub APK `releases/20260709_145528` · 랜딩·`/info` | `fc076c8` | — |
| 227 | 앱 내 카메라 **핀치·더블탭 확대** (`InAppCameraPreview`) | `3c3ee0f` | `restore-in-app-camera-zoom.bat` §136 |
| 228 | GitHub APK `releases/20260709_151301` · 랜딩·`/info` | `3c3ee0f` | — |
| 229 | 설정 **저장 버튼 하단 고정** | `9fb7e16` | `restore-settings-sticky-save.bat` §137 |
| 230 | GitHub APK `releases/20260709_153137` · 랜딩·`/info` | `9fb7e16` | — |
| 231 | 설정 칩 **· 기본**·**기본값 버튼 제거** | `d68edeb` | `restore-settings-default-chips.bat` §138 |
| 232 | GitHub APK `releases/20260709_163343` · 랜딩·`/info` | `d68edeb` | — |
| 233 | 설정 **하단 바**(뒤로·저장 한 줄, `bottom: 31`) | `9903447` | `restore-settings-bottom-bar.bat` §139 |
| 234 | GitHub APK `releases/20260709_164922` · 랜딩·`/info` | `9903447` | — |
| 235 | 설정 **`loadSettingsForScreen()`** 일괄 로드·스피너 제거 | `ed2f7ec` | `restore-settings-fast-load.bat` §140 |
| 236 | GitHub APK `releases/20260709_170409` · 랜딩·`/info` | `ed2f7ec` | `restore-apk-download-20260709_170409.bat` |
| 237 | 앱 내 카메라 **1x·3x·5x** 배율 버튼 | `879658d` | `restore-camera-zoom-presets.bat` §141 |
| 238 | GitHub APK `releases/20260710_165146` · 랜딩·`/info` | `879658d` | `restore-apk-download-20260710_165146.bat` |
| 239 | 설정 **앱 내 촬영음** 켜기/끄기 | `76aca1f` | `restore-shutter-sound.bat` §142 |
| 240 | GitHub APK `releases/20260710_171301` · 랜딩·`/info` | `76aca1f` | `restore-apk-download-20260710_171301.bat` |
| 241 | 확대 뷰어 **닫기·적용** 손잡이 하단 | `a0d05b9` | `restore-viewer-action-hand.bat` §143 |
| 242 | GitHub APK `releases/20260710_233524` · 랜딩·`/info` | `a0d05b9` | `restore-apk-download-20260710_233524.bat` |
| 243 | **층 school_only** 비학교 lastFloor/저장 가드 | `40805e9` | `restore-floor-school-only.bat` §144 |
| 244 | GitHub APK `releases/20260711_074726` · 랜딩·`/info` | `40805e9` | `restore-apk-download-20260711_074726.bat` |
| 245 | **목록 성능 A+B** 스탬프 우선·FlatList·디스크 썸네일 | `4e0fce6` | `restore-list-perf-ab.bat` §145 |
| 246 | GitHub APK `releases/20260711_081130` · 랜딩·`/info` | `4e0fce6` | `restore-apk-download-20260711_081130.bat` |
| 247 | **목록 검색 음성** 마이크 | `46d6a41` | `restore-list-search-mic.bat` §146 |
| 248 | GitHub APK `releases/20260711_082557` · 랜딩·`/info` | `46d6a41` | `restore-apk-download-20260711_082557.bat` |
| 249 | **내보내기 파일명·제목 음성** 손잡이 쪽 마이크 | `b588d83` | `restore-export-name-mic.bat` §147 |
| 250 | GitHub APK `releases/20260711_084109` · 랜딩·`/info` | `bc32a8e` | `restore-apk-download-20260711_084109.bat` |
| 251 | **위치 끔=GPS+로컬 학교 DB만** (카카오·직전 장소 없음) | `3914d32` | `restore-location-school-only.bat` §148 |
| 252 | GitHub APK `releases/20260711_092106` · 랜딩·`/info` | `c0e0a32` | `restore-apk-download-20260711_092106.bat` |
| 253 | 저장 화면 **확대 아이콘·폴더 선택** 손잡이 쪽 | `d0dcdf9` | `restore-save-hand-side.bat` §149 |
| 254 | GitHub APK `releases/20260711_101055` · 랜딩·`/info` | `831030e` | `restore-apk-download-20260711_101055.bat` |
| 255 | `/report` **행 삭제** | `61a32ca` | `restore-report-row-delete.bat` §150 |
| 256 | 프로젝트 ZIP **PDF 미포함** (속도) | `a58157f` | `restore-project-zip-no-pdf.bat` §151 |
| 257 | GitHub APK `releases/20260713_163836` · 랜딩·`/info` | `66c5d5b` | `restore-apk-download-20260713_163836.bat` |
| 258 | 프로젝트·엑셀·HWPX **바이너리/청크 저장** (OOM 완화) | `f68b363` | `restore-export-binary-write.bat` §152 |
| 259 | GitHub APK `releases/20260713_171406` · 랜딩·`/info` | `73dcb4f` | `restore-apk-download-20260713_171406.bat` |
| 260 | **카메라 권한 확인 중 화면 생략** — 홈 즉시 표시 | `89941c6` | `restore-camera-permission-skip.bat` §153 |
| 261 | GitHub APK `releases/20260713_231004` · 랜딩·`/info` | `afb5e88` | `restore-apk-download-20260713_231004.bat` |
| 262 | **PDF archive → `stamps/YYYYMMDD_장소명/`** (다수 폴더=최다, 없으면 `exports/`) | `6060a48` | `restore-export-site-folder.bat` §154 |
| 263 | GitHub APK `releases/20260720_225635` · 랜딩·`/info` · 도움말 | `6060a48` | `restore-apk-download-20260720-225635.bat` |
| 264 | **확대 크롭 적용=화면 가시 영역**(뷰포트 수식) | `7e91198` | `restore-crop-viewport-fix.bat` §155 |
| 265 | **적용=라이브 줌**(`getCropViewport`) | `a9f396e` | `restore-crop-apply-live.bat` §156 |
| 266 | GitHub APK `releases/20260721_232039` · 랜딩·`/info` · 도움말 | `a9f396e` | — |
| 267 | **적용=UI 스레드 flush**(JS stale 수정) | `9734037` | `restore-crop-apply-ui-flush.bat` §157 |
| 268 | GitHub APK `releases/20260721_233651` · 랜딩·`/info` · 도움말 | `9734037` | — |
| 269 | **크롭을 `6060a48`/`225635`로 롤백** | `ee75aa8` | `restore-revert-crop-225635.bat` §158 |
| 270 | GitHub APK `releases/20260721_235129` · 랜딩·`/info` · 도움말 | `ee75aa8` | — |
| 271 | **앱 내 카메라 크롭「적용」수정**(레이스·뷰포트·UI flush) | `11a7d29` | `restore-crop-inapp-fix.bat` §159 |
| 272 | GitHub APK `releases/20260722_000609` · 랜딩·`/info` · 도움말 | `11a7d29` | — |
| 273 | **필드 표시명 커스텀 + 워터마크 「표시명: 내용」** | `30aed21` | `restore-field-labels.bat` §160 |
| 274 | GitHub APK `releases/20260722_091825` · 랜딩·`/info` · 도움말 | `30aed21` | — |
| 275 | **추가 필드 2개**(저장·음성·워터마크 값 있을 때만) | `4501a7f` | `restore-extra-fields.bat` §161 |
| 276 | GitHub APK `releases/20260722_095047` · 랜딩·`/info` · 도움말 | `4501a7f` | — |
| 277 | **별도 영역·PDF 2열 표**(표시명\|내용, 워터마크는 줄글 유지) | `b6adf01` | `restore-caption-table.bat` §162 |
| 278 | GitHub APK `releases/20260722_101525` · 랜딩·`/info` · 도움말 | `b6adf01` | — |
| 279 | **저장 화면 필드 순서**=워터마크·별도 영역(제목→장소→…) | `85c1577` | `restore-save-field-order.bat` §163 |
| 280 | GitHub APK `releases/20260722_102946` · 랜딩·`/info` · 도움말 | `85c1577` | — |
| 281 | **크롭 EXIF 방향 정규화**(앱 내·갤러리 적용=화면) | `2de35d6` | `restore-crop-orient.bat` §164 |
| 282 | GitHub APK `releases/20260722_110520` · 랜딩·`/info` · 도움말 | `2de35d6` | — |
| 283 | **저장 화면 표시명 탭 편집**(설정에도 저장) | `9a8242a` | `restore-save-label-edit.bat` §165 |
| 284 | GitHub APK `releases/20260722_111946` · 랜딩·`/info` · 도움말 | `9a8242a` | — |
| 285 | **스탬프별 표시명 스냅샷**(목록·PDF·이미지·저장 레이스 수정) | `0f9abfc` | `restore-stamp-field-labels.bat` §166 |
| 286 | GitHub APK `releases/20260722_130810` · 랜딩·`/info` · 도움말 | `0f9abfc` | — |
| 287 | **목록 빈 메모 숨김**(내용 없으면 `(표시명 없음)` 미표시) | `41eef0c` | `restore-list-hide-empty-memo.bat` §167 |
| 288 | GitHub APK `releases/20260722_133757` · 랜딩·`/info` · 도움말 | `41eef0c` | — |
| 289 | **확대 크롭 cover 일치**(화면=저장 영역) | `7302cd4` | `restore-crop-cover-match.bat` §168 |
| 290 | GitHub APK `releases/20260722_162518` · 랜딩·`/info` · 도움말 | `7302cd4` | — |
| 291 | **cover 크롭 롤백**(contain 뷰어·수식으로 복구) | `b47ca39` | §169 |
| 292 | GitHub APK `releases/20260722_164409` · 랜딩·`/info` · 도움말 | `b47ca39` | — |
| 293 | **확대 자르기(적용) 비활성**(미리보기 확대만 유지) | (07-22) | `restore-disable-crop-apply.bat` §170 |
| 303 | **별도영역 이미지 흐림 수정**(ViewShot→네이티브 불투명 JPEG) | `8bad078` | `restore-caption-export-wash.bat` §185 |
| 304 | GitHub APK `releases/20260723_185321` · 랜딩·`/info` · 도움말 | `8bad078` | — |
| 302 | GitHub APK `releases/20260723_135456` · 랜딩·`/info` · 도움말 | `e45db50` | — |
| 301 | GitHub APK `releases/20260723_133903` · 랜딩·`/info` · 도움말 | `80d69b6` | — |
| 300 | GitHub APK `releases/20260723_131102` · 랜딩·`/info` · 도움말 | `1eba298` | — |
| 299 | GitHub APK `releases/20260723_113840` · 랜딩·`/info` · 도움말 | `9a3a8a2` | — |
| 298 | GitHub APK `releases/20260723_110901` · 랜딩·`/info` · 도움말 | `dca00c5` | — |
| 297 | GitHub APK `releases/20260723_102421` · 랜딩·`/info` · 도움말 | `550c513` | — |
| 296 | GitHub APK `releases/20260723_094044` · 랜딩·`/info` · 도움말 | `20391a6` | — |
| 295 | GitHub APK `releases/20260723_091612` · 랜딩·`/info` · 도움말 | `4d56901` | — |
| 305 | **AI-ML-02 개인정보 가리기**(얼굴·숫자 온디바이스 모자이크, 설정 opt-in) | `449da4d` | `restore-privacy-blur.bat` §186 |
| 306 | GitHub APK `releases/20260724_105355` · 랜딩·`/info` · 도움말 | `449da4d` | — |
| 307 | **모자이크 해상도·영역 비례 강도**(약·중·강) | `239883c` | `restore-privacy-blur-scale.bat` §187 |
| 308 | GitHub APK `releases/20260724_111410` · 랜딩·`/info` · 도움말 | `239883c` | — |
| 309 | **하단 촬영 일시** 설정(`export_footer_datetime`) — PDF·캡션 하단 | `f6403fe` | `restore-export-footer-datetime.bat` §188 |
| 310 | GitHub APK `releases/20260724_114341` · 랜딩·`/info` · 도움말 | `f6403fe` | — |
| 311 | **가리기 EXIF 정렬**(시스템 카메라) | `35f6d9b` | — |
| 312 | GitHub APK `releases/20260724_182721` | `35f6d9b` | — |
| 313 | **앱 내 카메라 전후면 전환** | `39b3447` | — |
| 314 | **저장 템플릿 적용 중/사용자수정** | `a084982` | `restore-active-template-status.bat` |
| 315 | GitHub APK `releases/20260725_095546` | `658af2b` | — |
| 316 | **가리기 탭 수동 영역** + 하단 여백 | `29b86a1` | `restore-privacy-manual-region.bat` |
| 317 | GitHub APK `releases/20260725_101238` · 랜딩·`/info` | `94950ff` | — |
| 318 | **AI-ML-03** OCR→제목·메모 설계 문서 | (docs) | [DESIGN-ML-KIT-OCR-TITLE.md](./DESIGN-ML-KIT-OCR-TITLE.md) |
| 319 | **시작 배너** `mainint` 키비주얼 (`assets/start.png`) — 이후 복구 | `7e6fa63` | `restore-start-mainint.bat` §194 |
| 320 | GitHub APK `releases/20260728_105823` · 랜딩·`/info` · 도움말 | `7e6fa63` | `restore-apk-download-20260728_105823.bat` |
| 321 | **카메라 홈** `mainint` (`camera-home.png`) · 시작 배너 원복 | `2124da6` | `restore-camera-home-mainint.bat` §195 |
| 322 | GitHub APK `releases/20260728_111800` · 랜딩·`/info` · 도움말 | `2124da6` | `restore-apk-download-20260728_111800.bat` |
| 323 | **카메라 홈 배경** 설정(기본/스타일 2) | `00090a2` | `restore-camera-home-bg.bat` §196 |
| 324 | GitHub APK `releases/20260728_113356` · 랜딩·`/info` · 도움말 | `00090a2` | `restore-apk-download-20260728_113356.bat` |
| 325 | **카메라 홈 기본값** mainint1 · 검정 배경 유지 | `a9783a5` | `restore-camera-home-default-mainint1.bat` §197 |
| 326 | GitHub APK `releases/20260728_132816` · 랜딩·`/info` · 도움말 | `a9783a5` | `restore-apk-download-20260728_132816.bat` |
| 327 | **카메라 홈** 기본=mainint(검정)·스타일2=mainint1(흰색) | `a67c68c` | `restore-camera-home-bg-colors.bat` §198 |
| 328 | GitHub APK `releases/20260728_135843` · 랜딩·`/info` · 도움말 | `a67c68c` | `restore-apk-download-20260728_135843.bat` |
| 329 | **AI-ML-03** OCR→제목·메모 초안 (설정 opt-in) | `8b74ccf` | `restore-ocr-title-memo.bat` |
| 330 | GitHub APK `releases/20260725_104328` | `0897335` | — |
| 331 | **AI-ML-01** 장면 키워드 재도입 | `06ae8e2` | `restore-mlkit-scene.bat` |
| 332 | GitHub APK `releases/20260725_114802` | `3ebb51f` | — |
| 333 | OCR **긴 메모 칸·시트 스크롤** | `1413de9` | `restore-ocr-memo-scroll.bat` |
| 334 | 웹 한도·저장 액션 버튼 나란히 | `22597f6` | `restore-web-limit-ocr-row.bat` |
| 335 | **F-QR-01** caption QR MVP (`source_url`, MIT `qrcode`) | `9b9175c` | `restore-qr-caption.bat` |
| 336 | GitHub APK `releases/20260730_114713` · 랜딩·`/info` · Vercel | `49e9c70` | `restore-apk-download-20260730_114713.bat` |
| 337 | **F-CAM-27** 왼손 카메라 홈 테마 | `348130e` | `restore-camera-hand-theme.bat` §199 |
| 338 | GitHub APK `releases/20260731_094832` · 랜딩·`/info` | `3be0a07` | `restore-apk-download-20260731_094832.bat` |
| 339 | 랜딩 APK명 아래 큰 **웹테스트** 링크 | `98aeb25` | `restore-landing-web-test-link.bat` §200 |
| 340 | **QR URL** 마이크·기본 `https://` | `4a9e287` | `restore-qr-url-mic.bat` §201 |
| 341 | GitHub APK `releases/20260731_102403` · 랜딩·`/info` | `a9509b9` | `restore-apk-download-20260731_102403.bat` |
| 342 | 웹 보안 헤더·visitor POST·report imageFile | `626c1a4` | `restore-web-security-harden.bat` §202 |
| 343 | **QR URL 연결확인** (사설망 차단·타임아웃 GET) | `d363b00` | `restore-qr-url-check.bat` §203 |
| 344 | GitHub APK `releases/20260801_172149` · 랜딩·`/info` | `d363b00` | `restore-apk-download-20260801_172149.bat` |
| 345 | **성능 번들 A** — 촬영 JPEG 상한·갤러리 유휴 직렬·기본 앱만 | `e45026b` | `restore-perf-bundle-a.bat` §204 |
| 346 | GitHub APK `releases/20260801_185512` · 랜딩·`/info` | `e45026b` | `restore-apk-download-20260801_185512.bat` |
| 347 | **성능 번들 B** — Kakao POI 3종·장면 키워드 버튼 | `9d8ccfa` | `restore-perf-bundle-b.bat` §205 |
| 348 | GitHub APK `releases/20260801_191117` · 랜딩·`/info` | `9d8ccfa` | `restore-apk-download-20260801_191117.bat` |
| 349 | **성능 번들 C** — 내보내기 동적 import | `073c8bf` | `restore-perf-bundle-c.bat` §206 |
| 350 | GitHub APK `releases/20260801_193317` · 랜딩·`/info` | `073c8bf` | `restore-apk-download-20260801_193317.bat` |
| 351 | 내보내기 마이크 ↔ 목록 검색 음성 혼입 방지 | `f005041` | `restore-speech-target-guard.bat` §207 |
| 352 | GitHub APK `releases/20260801_232652` · 랜딩·`/info` | `f005041` | `restore-apk-download-20260801_232652.bat` |
| 353 | 저장 목록 플랫 행 (hairline·선택 악센트) | `037b0af` | `restore-list-row-compact.bat` §208 |
| 354 | GitHub APK `releases/20260802_105935` · 랜딩·`/info` | `037b0af` | `restore-apk-download-20260802_105935.bat` |
| 355 | 목록 행 높이 추가 축소 | `2dcf74b` | `restore-list-row-tighter.bat` §209 |
| 356 | GitHub APK `releases/20260802_111920` · 랜딩·`/info` | `2dcf74b` | `restore-apk-download-20260802_111920.bat` |
| 357 | 설정 필드 표시명 UI 제거 | `869a0bb` | `restore-hide-settings-field-labels.bat` §210 |
| 358 | GitHub APK `releases/20260802_115453` · 랜딩·`/info` | `869a0bb` | `restore-apk-download-20260802_115453.bat` |
| 359 | 선택 취소 후 목록 흰 썸네일 수정 | `2a00578` | `restore-list-thumb-selection-fix.bat` §211 |
| 360 | GitHub APK `releases/20260802_124143` · 랜딩·`/info` | `2a00578` | `restore-apk-download-20260802_124143.bat` |
| 361 | 목록 **저장 유형 필터** | `acb9a43` | `restore-template-list-filter.bat` §212 |
| 362 | GitHub APK `releases/20260802_214047` · 랜딩·`/info` | `acb9a43` | — |
| 363 | 웹 저장 알림·persist · **장소 칩**·저장 모달 유형 선택 | `5850f1c`·`190a5e6` | `restore-web-save-alert.bat` · `restore-place-chip-save-template.bat` |
| 364 | 앨범 **EXIF GPS → 장소** | `6f1dcc2`~`8825a72` | `restore-gallery-exif-place.bat` §215 |
| 365 | **F-Voice-10** 저장 직후 음성으로 항목 채우기 | `8856461` | `restore-save-slot-speech.bat` §217 |
| 366 | GitHub APK `releases/20260803_145506` · 랜딩·`/info` | `7fbd20b` | — |
| 367 | **F-Voice-11** 항목 말하기 유형·말하기 예 | `09f9c87` | `restore-slot-speech-type-hint.bat` §218 |
| 368 | GitHub APK `releases/20260803_151943` · 랜딩·`/info` | `114b3dc` | — |
| 369 | **표시명** 「항목 말하기」/「저장 직후 음성으로 항목 채우기」 | `6cd1dc4` | `restore-item-speak-label.bat` §219 |
| 370 | GitHub APK `releases/20260803_161016` · 랜딩·`/info` | `6cd1dc4` | — |

> **권장 APK:** `releases/VoiceStamp_20260808_143848.apk`

> **성능:** 번들 A/B/C 누적 적용. 회귀·다음 후보 → [HEALTHCHECK.md](./HEALTHCHECK.md)

> **참고:** `b46c9d3`(설정 연속 촬영 토글)는 `ec4930e`에서 3버튼 UI로 **대체**됨. 되돌리기: `restore-continuous-capture.bat` §109.

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
| react-native-view-shot | StampImageExportHost(오프스크린 호스트 유지; 캡션 갤러리 JPEG는 미사용) |
| react-native-image-marker | APK 워터마크·캡션(별도영역) 네이티브 JPEG 합성 (MIT) |
| exceljs | XLSX 내보내기 |
| jszip | 프로젝트 ZIP 내보내기 |
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
| **`releases/VoiceStamp_20260810_113846.apk`** | `dda285a` | **설치·GitHub 권장** — 엑셀 800칩·글자 작음/보통/큼 + 08-08~10 누적 |
| **`releases/VoiceStamp_20260810_105750.apk`** | `8c47b5d` | **이전** — 수신 엑셀 미리보기 가로 px |
| **`releases/VoiceStamp_20260810_102144.apk`** | `39cc93a` | **이전** — 조인 QR Modal·스캔 게이트 |
| **`releases/VoiceStamp_20260810_091329.apk`** | `48f9db6` | **이전** — 저장 배지 참여 사업 전환 |
| **`releases/VoiceStamp_20260809_183720.apk`** | `2ba4edf` | **이전** — 수신 「가져옴」매칭 |
| **`releases/VoiceStamp_20260809_150428.apk`** | `48dc7b5` | **이전** — 카메라 홈 취합 아이콘 |
| **`releases/VoiceStamp_20260808_231815.apk`** | `1f53a7d` | **이전** — 수신 촬영자·엑셀 선두 열 |
| **`releases/VoiceStamp_20260808_173120.apk`** | `8a5b58a` | **이전** — NCP presigned 직통 |
| **`releases/VoiceStamp_20260808_143848.apk`** | `89b643d` | **이전** — 수신함 병합·썸네일 |
| **`releases/VoiceStamp_20260803_161016.apk`** | `6cd1dc4` | **이전** — 「항목 말하기」표시명 + 08-03 누적 |
| **`releases/VoiceStamp_20260803_151943.apk`** | `114b3dc` | **이전** — 칸 말하기 유형·말하기 예 + 08-03 누적 |
| **`releases/VoiceStamp_20260803_145506.apk`** | `7fbd20b` | **이전** — 저장 직후 칸 말하기 |
| **`releases/VoiceStamp_20260802_214047.apk`** | `acb9a43` | **이전** — 목록 저장 유형 필터 |
| **`releases/VoiceStamp_20260802_124143.apk`** | `2a00578` | **이전** — 선택 취소 썸네일 유지 + 08-02 누적 |
| **`releases/VoiceStamp_20260802_115453.apk`** | `869a0bb` | **이전** — 설정 필드 표시명 UI 제거 |
| **`releases/VoiceStamp_20260802_111920.apk`** | `2dcf74b` | **이전** — 목록 행 높이 추가 축소 |
| **`releases/VoiceStamp_20260802_105935.apk`** | `037b0af` | **이전** — 목록 플랫 행 |
| **`releases/VoiceStamp_20260801_232652.apk`** | `f005041` | **이전** — 음성 타깃 가드 |
| **`releases/VoiceStamp_20260801_193317.apk`** | `073c8bf` | **이전** — **성능 번들 C** + B/A (헬스체크 기준선) |
| **`releases/VoiceStamp_20260801_191117.apk`** | `9d8ccfa` | **이전** — **성능 번들 B** + A 누적 |
| **`releases/VoiceStamp_20260801_185512.apk`** | `e45026b` | **이전** — **성능 번들 A** + QR 연결확인 누적 |
| **`releases/VoiceStamp_20260801_172149.apk`** | `d363b00` | **이전** — QR URL **연결확인** + 07-31 누적 |
| **`releases/VoiceStamp_20260731_102403.apk`** | `a9509b9` | **이전** — QR URL 마이크·https:// 기본 + F-CAM-27·caption QR 누적 |
| **`releases/VoiceStamp_20260730_114713.apk`** | `49e9c70` | **이전** — **F-QR-01** caption QR MVP + 07-28~07-25 누적 |
| **`releases/VoiceStamp_20260728_135843.apk`** | `a67c68c` | **이전** — 카메라 홈 기본=mainint(검정)·스타일2=mainint1 |
| **`releases/VoiceStamp_20260725_114802.apk`** | `3ebb51f` | **이전** — **AI-ML-01** 장면 키워드 |
| **`releases/VoiceStamp_20260725_104328.apk`** | `0897335` | **이전** — **AI-ML-03** OCR 제목·메모 |
| **`releases/VoiceStamp_20260725_101238.apk`** | `94950ff` | **이전** — 가리기 **수동 영역** + 하단 여백 + 07-25 누적 |
| **`releases/VoiceStamp_20260725_095546.apk`** | `658af2b` | **이전** — 저장 템플릿 **적용 중/사용자수정** |
| **`releases/VoiceStamp_20260724_182721.apk`** | `35f6d9b` | **이전** — 가리기 **EXIF 정렬** |
| **`releases/VoiceStamp_20260724_114341.apk`** | `f6403fe` | **이전** — **하단 촬영 일시** + 개인정보 가리기(해상도 비례) |
| **`releases/VoiceStamp_20260724_111410.apk`** | `239883c` | **이전** — 모자이크 **해상도·영역 비례** 약·중·강 |
| **`releases/VoiceStamp_20260724_105355.apk`** | `449da4d` | **이전** — **AI-ML-02** 개인정보 가리기 MVP |
| **`releases/VoiceStamp_20260723_185321.apk`** | `8bad078` | **이전** — **별도영역 이미지 흐림 수정**(네이티브 불투명 JPEG) + 07-23 누적 |
| **`releases/VoiceStamp_20260723_170552.apk`** | `f4be621` | **이전** — **저장 목록 표시 모드** |
| **`releases/VoiceStamp_20260720_225635.apk`** | `6060a48` | **이전** — **PDF → 현장(`YYYYMMDD_장소`) 폴더 archive** + 07-13 전부 |
| **`releases/VoiceStamp_20260713_231004.apk`** | `afb5e88` | **이전** — **카메라 권한 확인 중 화면 생략**(홈 즉시) + 내보내기 OOM 수정 + ZIP PDF 미포함 + `/report` 행 삭제 + 07-11 전부 |
| `releases/VoiceStamp_20260713_171406.apk` | `73dcb4f` | **내보내기 OOM 수정**(바이너리/청크) + ZIP PDF 미포함 + `/report` 행 삭제 (권한 홈 즉시 **미포함**) |
| `releases/VoiceStamp_20260713_163836.apk` | `66c5d5b` | 프로젝트 ZIP **PDF 미포함** + `/report` 행 삭제 (바이너리 쓰기 **미포함**) |
| `releases/VoiceStamp_20260711_101055.apk` | `831030e` | **저장 손잡이**(확대·폴더 선택) + **위치 끔=GPS+학교** + 내보내기·목록 음성 + 목록 성능 A+B |
| **`releases/VoiceStamp_20260711_092106.apk`** | `c0e0a32` | **위치 끔=GPS+학교 DB만** + `084109` 기능 |
| **`releases/VoiceStamp_20260711_084109.apk`** | `b588d83` | **내보내기 파일명·제목 음성** + 목록 검색 음성 + 목록 성능 A+B |
| **`releases/VoiceStamp_20260711_082557.apk`** | `46d6a41` | **목록 검색 음성** + 목록 성능 A+B + school_only 층 가드 |
| **`releases/VoiceStamp_20260711_081130.apk`** | `4e0fce6` | **목록 성능 A+B** + school_only 층 가드 |
| **`releases/VoiceStamp_20260711_074726.apk`** | `40805e9` | **층 school_only** 비학교 lastFloor/저장 가드 + 07-10 전부 |
| **`releases/VoiceStamp_20260710_233524.apk`** | `a0d05b9` | 확대 뷰어 **닫기·적용** 손잡이 하단 + 촬영음·1x·3x·5x + 07-09 전부 |
| **`releases/VoiceStamp_20260710_171301.apk`** | `76aca1f` | 앱 내 **촬영음** 켜기/끄기 + 1x·3x·5x + 07-09 전부 |
| **`releases/VoiceStamp_20260710_165146.apk`** | `879658d` | 앱 내 카메라 **1x·3x·5x** 배율 (촬영음 설정 **미포함**) |
| **`releases/VoiceStamp_20260709_170409.apk`** | `ed2f7ec` | 설정 **빠른 로드** + 07-09 (1x·3x·5x **미포함**) |
| `releases/VoiceStamp_20260709_164922.apk` | `9903447` | 설정 **하단 바**(뒤로·저장) (빠른 로드 **미포함**) |
| `releases/VoiceStamp_20260709_163343.apk` | `d68edeb` | 설정 칩 **· 기본**·기본값 버튼 제거 (하단 바 **미포함**) |
| `releases/VoiceStamp_20260709_153137.apk` | `9fb7e16` | 설정 **저장 하단 고정** (칩·하단 바 **미포함**) |
| `releases/VoiceStamp_20260709_151301.apk` | `3c3ee0f` | 앱 내 카메라 **핀치·더블탭 확대** (설정 UI **미포함**) |
| `releases/VoiceStamp_20260709_145528.apk` | `fc076c8` | **일반 촬영 카메라**(시스템/앱 내) (인앱 확대 **미포함**) |
| `releases/VoiceStamp_20260709_140843.apk` | `392e611` | **위치 끔** 시 **직전 장소** (07-09 카메라·설정 **미포함**) |
| **`releases/VoiceStamp_20260706_112756.apk`** | `f6d33fd` | **zoom.png 투명 배지** + 07-06 (07-09 **미포함**) |
| `releases/VoiceStamp_20260706_103245.apk` | `91ce71f` | 목록 내보내기 **파일명·보고서 제목 모달** (투명 zoom **미포함**) |
| `releases/VoiceStamp_20260706_101457.apk` | `08cf91b` | 미리보기 배지 **`zoom.png`** |
| `releases/VoiceStamp_20260703_162433.apk` | `baf6a30` | PDF **동일 photo-slot** + 07-03 (07-06 **미포함**) |
| `releases/VoiceStamp_20260703_154800.apk` | `af6609e` | PDF **캡션 너비=사진** (photo-slot **미포함**) |
| `releases/VoiceStamp_20260703_152212.apk` | `c3b1bef` | **위치 끔**이어도 **장소 입력** (PDF **미포함**) |
| `releases/VoiceStamp_20260703_143138.apk` | `61bb13a` | 갤러리 **앱만** 저장 (장소·PDF **미포함**) |
| `releases/VoiceStamp_20260701_230340.apk` | `376368b` | 저장 **성능**·**처리 중 오버레이**·학교명만 (07-03 **미포함**) |
| `releases/VoiceStamp_20260701_225211.apk` | `b641d78` | **처리 중 오버레이** (`230340` **미포함**) |
| `releases/VoiceStamp_20260701_221146.apk` | `d809e99` | 저장 모달 **성능**·학교명만 (오버레이 **미포함**) |
| **`releases/VoiceStamp_20260701_165406.apk`** | `61ca32a` | **촬영 후 선택/저장 바로** + 07-01 위치·미리보기 (저장 성능·오버레이 **미포함**) |
| `releases/VoiceStamp_20260701_163737.apk` | `5b150a3` | 3버튼 시트 fast 위치 (촬영 후 모드 **미포함**) |
| `releases/VoiceStamp_20260701_160259.apk` | `5f63f07` | 카메라 위치 워밍업 (fast 시트 **미포함**) |
| `releases/VoiceStamp_20260701_153110.apk` | `9e1821c` | 저장 모달 즉시 미리보기 (워밍업 **미포함**) |
| `releases/VoiceStamp_20260701_145618.apk` | `ff22c24` | prefetch 중복 생략·학교 fast (미리보기 **미포함**) |
| **`releases/VoiceStamp_20260627_092959.apk`** | `547b693` | busy 오버레이 깜빡임 수정 + `233248` (07-01 개선 **미포함**) |
| `releases/VoiceStamp_20260626_233248.apk` | `1940314` | 음성 **수동 커서** + `231436` 기능 전부 (busy 수정 **미포함**) |
| `releases/VoiceStamp_20260626_231436.apk` | `480e01f` | **층→장소** 표기·수정 모달 입력 수정 (수동 커서 **미포함**) |
| `releases/VoiceStamp_20260626_225833.apk` | `26e8975` | 학교 반경 **200m** (층→장소 **미포함**) |
| `releases/VoiceStamp_20260626_194421.apk` | `bdf4376` | **위치 조회 끔** (200m·층→장소 **미포함**) |
| `releases/VoiceStamp_20260626_184823.apk` | `6f95aa8` | 촬영 후 3버튼 **눌림 배경·Android 리플** + `172205` 기능 전부 |
| `releases/VoiceStamp_20260626_172205.apk` | `fb0363b` | 도로명+POI 근처·음성 커서·장소 마이크·`place_label` (버튼 눌림 **미포함**) |
| `releases/VoiceStamp_20260626_170125.apk` | `0b5c1b8` | 음성 끝 공백·커서 (도로+POI **미포함**) |
| `releases/VoiceStamp_20260626_163412.apk` | `b06310a` | 장소 마이크 (음성 커서·도로+POI **미포함**) |
| `releases/VoiceStamp_20260626_152305.apk` | `0869e93` | ML Kit **되돌림** |
| `VoiceStamp_20260626_134226.apk` | `3037ffe` | `place_label` (장소 마이크 **미포함**) |
| **`releases/VoiceStamp_20260625_171805.apk`** | `847ea63` | 캡션 EXIF·DISPLAY_NAME 한글·도로 위치 (`place_label` **미포함**) |
| `releases/VoiceStamp_20260625_165551.apk` | `44997be` | DISPLAY_NAME 한글 (캡션 EXIF **미포함**) |
| `VoiceStamp_20260625_161125.apk` | `143a140` | 한글 파일명 경로 — 갤러리 저장 **불안정**, 사용 비권장 |
| `VoiceStamp_20260625_100743.apk` | `511a67c` | 도로·지번·POI 위치 (갤러리 한글 **미포함**) |
| **`releases/VoiceStamp_20260624_094846.apk`** | `64aa037` | 휴지통 비우기 UX·목록보내기 하단바·내비 31px |
| `VoiceStamp_20260624_093448.apk` | `c5cbeec` |보내기 하단바 31px (비우기 후 목록 **미포함**) |
| `VoiceStamp_20260624_092411.apk` | `ecb3fe1` | 목록보내기 하단바·헤더 축소 |
| `VoiceStamp_20260624_085417.apk` | `64d6728` | 휴지통 비우기 → 휴지통 화면 |
| `VoiceStamp_20260623_164337.apk` | `0ab0f93` | GPS 프리페치·연속 인앱 카메라·스플래시·3버튼 |
| **`releases/VoiceStamp_20260622_094203.apk`** | `4f20bca` | GPS 프리페치·연속 인앱 카메라 (**이전 GitHub**) |
| `VoiceStamp_20260623_132828.apk` | `a89e166` | 스플래시 flex 확대 (프리페치·인앱 카메라 **미포함**) |
| `VoiceStamp_20260622_000517.apk` | `b5922eb` | 3버튼·연속 위치 재사용 (프리페치·인앱 카메라·스플래시 **미포함**) |
| `VoiceStamp_20260621_234030.apk` | `ec4930e` | 촬영 후 **3버튼** (연속 위치 재사용 **미포함**) |
| `VoiceStamp_20260621_125741.apk` | `3ecb4f4` | **좌표 표기 없음=숨김** (3버튼 **미포함**) |
| **`VoiceStamp_20260620_234924.apk`** | `eaa17e4` | 목록 **제목·메모 검색** + `schools.sqlite` (**GitHub `releases/`**) |
| `VoiceStamp_20260620_171910.apk` | `88671c1` | 빌드 타임 **schools.sqlite** (목록 검색 **미포함**) |
| `VoiceStamp_20260620_165718.apk` | `55c33df` | JSON seed 학교 DB — **부팅 멈춤**, 사용 금지 |
| `VoiceStamp_20260619_101343.apk` | `2a5b75b` | OSS 라이선스·베타 LICENSE-NOTICE (학교 DB·목록 검색 **미포함**) |
| `VoiceStamp_20260617_184121.apk` | `7b6b0c1` | OSS **미포함** — 학교 200m·건물명/도로명·뒤로가기·저장 모달·`.env` 카카오 키 |
| `VoiceStamp_20260617_182811.apk` | `5699d9c` | 위치 revert·뒤로가기 (200m 규칙 **미포함**) |
| `VoiceStamp_20260617_181630.apk` | `3af9203` | 저장 모달 흰 화면 수정 (3모드·fast snapshot **포함**, 위치 불안) |
| `VoiceStamp_20260617_174312.apk` | `c612e69` | 위치 속도 개선 시도 (**되돌림**) |
| `VoiceStamp_20260617_172752.apk` | `08c132a` | 위치 표시 3모드 시도 (**되돌림**) |
| `VoiceStamp_20260617_131932.apk` | `3e6a90d` | 오버레이 한 바·파스텔 10색 (뒤로가기·위치 수정 **미포함**) |
| `VoiceStamp_20260617_130651.apk` | `60a9754` | 파스텔 팔레트 |
| `VoiceStamp_20260617_113216.apk` | `35bdba6` | 10색 칩 (원색) |
| `VoiceStamp_20260617_111707.apk` | `78fd3e6` | 기관명·하단 문구 오버레이 |
| `VoiceStamp_20260617_104040.apk` | `792df0c` | 보라 VS 아이콘 + safe zone |
| `VoiceStamp_20260617_092917.apk` | `24d8fac` | /report JPEG 글자 크기 |
| `VoiceStamp_20260617_091820.apk` | `b9edc0e` | /report 클라이언트 JPEG |
| `VoiceStamp_20260617_001635.apk` | `87c7e15` | 워터마크 검은/흰만 (오버레이·팔레트 **미포함**) |
| `VoiceStamp_20260617_000721.apk` | `534c9f7` | 워터마크 스타일(빨간 세로줄, 구버전) |
| `VoiceStamp_20260616_173518.apk` | `7e453ea` | 갤러리·촬영 캡슐 (워터마크 스타일 **미포함**) |
| `VoiceStamp_20260616_170713.apk` | `72ccc32` | 갤러리 아이콘+라벨 (캡슐 **미포함**) |
| `VoiceStamp_20260616_165243.apk` | `9ceb325` | 첨부 아이콘 28px 꽉 참 |
| `VoiceStamp_20260616_163531.apk` | `109bfa3` | 하단바 31px 상향 |
| `VoiceStamp_20260616_094515.apk` | `7c127aa` | 목록 UI·첨부 아이콘·카메라 홈 |
| `VoiceStamp_20260616_082006.apk` | `f74012f` | 목록 카메라-back 아이콘 — 첨부·목록 리디자인 미포함 |
| `VoiceStamp_20260616_081011.apk` | `ce59962` | 카메라 홈 리디자인 |
| `VoiceStamp_20260616_075840.apk` | `c8221ca` | 설정 톱니 PNG |
| `releases/VoiceStamp_20260616_082006.apk` | `f74012f` | **GitHub 최신 커밋 APK** — `7e453ea` 미포함 |
| `releases/VoiceStamp_20260615_153600.apk` | `c6aff3c` | HWPX APK 템플릿 로드 수정 |
| `VoiceStamp_20260614_114256.apk` | `100e123` | 자동 제목(기본 날짜)·층 표기·전체 06-14 기능 |

### 7.4 APK 빌드별 수정 사항 (전체)

앱 **버전명**은 모두 `1.0.0` (`app.json`). 아래는 **파일명(빌드 시각)** 기준입니다. 주요 APK는 git에 포함되며, 로컬 `build-apk.bat`로 동일 이름으로 재빌드 가능합니다.

#### 2026-08-10

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260810_113846.apk` | `dda285a` | **권장** — 엑셀 800칩·글자 작음/보통/큼 · `restore-inbox-xlsx-font.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260810_105750.apk` | `8c47b5d` | **이전** — 엑셀 미리보기 가로 px · `restore-inbox-xlsx-preview-px.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260810_102144.apk` | `39cc93a` | **이전** — 조인 QR Modal · `restore` QR Modal 계열 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260810_095243.apk` | `924f710` | **이전** — QR 미리보기·배지 사업명 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260810_091329.apk` | `48f9db6` | **이전** — 저장 배지 참여 전환 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260810_085356.apk` | `0940d2e` | **이전** — 취합전송 · 사업명 배지 | **GitHub `releases/`** |

#### 2026-08-09

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260809_183720.apk` | `2ba4edf` | **이전** — 수신 「가져옴」매칭(공백·점) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260809_150428.apk` | `48dc7b5` | **이전** — 카메라 홈 취합 아이콘 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260809_143152.apk` | `3b7445a` | **이전** — 보낸 사진·전송분 숨기기 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260809_140548.apk` | `2cfcb17` | **이전** — 저장 유형 옆 취합 배지 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260809_135131.apk` | `f3a67d7` | **이전** — 만든 회사/사람(로컬) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260809_134036.apk` | `0596468` | **이전** — 선택 취소 목록 remount | **GitHub `releases/`** |
| `releases/VoiceStamp_20260809_085617.apk` | `faf4ab9` | **이전** — 목록 선택 썸네일 유지(연쇄 수정 시작) | **GitHub `releases/`** |

#### 2026-08-08 (후반·주요)

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260808_231815.apk` | `1f53a7d` | **이전** — 수신 촬영자·엑셀 선두 열 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260808_194756.apk` | `17c89d7` | **이전** — 로컬 data-URI decode 후 NCP PUT | **GitHub `releases/`** |
| `releases/VoiceStamp_20260808_173120.apk` | `8a5b58a` | **이전** — NCP presigned 직통 업로드 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260808_165940.apk` | `97a8c8f` | **이전** — 초대 저장 템플릿 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260808_155907.apk` | `934f09b` | **이전** — 참여 이력 재연결 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260808_153143.apk` | `97c86f8` | **이전** — 수신 선택 엑셀 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260808_143848.apk` | `89b643d` | **이전** — 수신함 병합·썸네일 | **GitHub `releases/`** |

#### 2026-08-03

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260803_161016.apk` | `6cd1dc4` | **이전** — 「항목 말하기」표시명 (+08-03 누적) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260803_151943.apk` | `114b3dc` | **이전** — 칸 말하기 **유형·말하기 예** (+08-03 누적) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260803_145506.apk` | `7fbd20b` | **이전** — 저장 직후 칸 말하기(제목→장소→메모) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260803_101849.apk` | `190a5e6` 계열 | **이전** — 장소 칩 · 저장 모달 유형 선택 · 웹 저장 알림 | **GitHub `releases/`** |

| 항목 | 내용 |
|------|------|
| 분류 | 목록 **장소 칩** · 저장 모달 **유형 선택**(다음 기본값) · `restore-place-chip-save-template.bat` |
| 웹 | 설정/`showAlert` · canvas JPEG persist · `restore-web-save-alert.bat` |
| 앨범 | EXIF GPS → 장소 · `restore-gallery-exif-place.bat` |
| 음성 | **F-Voice-10/11** 항목 말하기 · `restore-save-slot-speech.bat` · `restore-slot-speech-type-hint.bat` · `restore-item-speak-label.bat` |

#### 2026-08-02

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260802_214047.apk` | `acb9a43` | **이전** — 목록 저장 유형 필터 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260802_124143.apk` | `2a00578` | **이전** — 선택 취소 썸네일 · `restore-list-thumb-selection-fix.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260802_115453.apk` | `869a0bb` | **이전** — 설정 필드 표시명 UI 제거 · `restore-hide-settings-field-labels.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260802_111920.apk` | `2dcf74b` | **이전** — 행 높이 축소 · `restore-list-row-tighter.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260802_105935.apk` | `037b0af` | **이전** — 플랫 목록 행 · `restore-list-row-compact.bat` | **GitHub `releases/`** |

#### 2026-08-01

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260801_232652.apk` | `f005041` | **이전** — 음성 타깃 가드 · `restore-speech-target-guard.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260801_193317.apk` | `073c8bf` | **이전** — **성능 번들 C** · `restore-perf-bundle-c.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260801_191117.apk` | `9d8ccfa` | **이전** — **성능 번들 B** · `restore-perf-bundle-b.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260801_185512.apk` | `e45026b` | **이전** — **성능 번들 A** · `restore-perf-bundle-a.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260801_172149.apk` | `d363b00` | **이전** — QR URL **연결확인** · `restore-qr-url-check.bat` | **GitHub `releases/`** |

#### 2026-07-31

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260731_102403.apk` | `a9509b9` | **이전** — QR URL 마이크·https:// 기본 · `restore-qr-url-mic.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260731_094832.apk` | `3be0a07` | **이전** — **F-CAM-27** 왼손 홈 테마 · `restore-camera-hand-theme.bat` | **GitHub `releases/`** |

#### 2026-07-30

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260730_114713.apk` | `49e9c70` | **이전** — **F-QR-01** caption QR (`source_url`, MIT `qrcode`) · `restore-qr-caption.bat` | **GitHub `releases/`** |

#### 2026-07-28

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260728_135843.apk` | `a67c68c` | **이전** — 홈 기본=mainint(검정)·스타일2=mainint1(흰색) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260728_132816.apk` | `a9783a5` | **이전** — 홈 기본 mainint1 시도 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260728_113356.apk` | `00090a2` | **이전** — 카메라 홈 배경 설정 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260728_111800.apk` | `2124da6` | **이전** — 카메라 홈 mainint · 시작 배너 복구 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260728_105823.apk` | `7e6fa63` | **이전** — 시작 배너 mainint | **GitHub `releases/`** |

#### 2026-07-25

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260725_114802.apk` | `3ebb51f` | **이전** — **AI-ML-01** 장면 키워드 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260725_104328.apk` | `0897335` | **이전** — **AI-ML-03** OCR 제목·메모 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260725_101238.apk` | `94950ff` | **이전** — 개인정보 가리기 **탭 수동 영역** + 하단 버튼 여백 · `restore-privacy-manual-region.bat` | **GitHub `releases/`** |
| `releases/VoiceStamp_20260725_095546.apk` | `658af2b` | **이전** — 저장 템플릿 **적용 중/사용자수정** · `restore-active-template-status.bat` | **GitHub `releases/`** |

#### 2026-07-24

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260724_182721.apk` | `35f6d9b` | **이전** — 개인정보 가리기 **EXIF 정렬**(시스템 카메라) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260724_114341.apk` | `f6403fe` | **이전** — **하단 촬영 일시** 설정(PDF·캡션 하단, 제목 접두어와 분리) + 블러 누적 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260724_111410.apk` | `239883c` | **이전** — 모자이크 **해상도·영역 비례** 약·중·강 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260724_105355.apk` | `449da4d` | **이전** — **AI-ML-02** 얼굴·숫자 온디바이스 블러 MVP · 설정 opt-in | **GitHub `releases/`** |

#### 2026-07-23

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260723_185321.apk` | `8bad078` | **이전** — **별도영역 이미지 흐림 수정**(ViewShot→네이티브 불투명 JPEG) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_170552.apk` | `f4be621` | **이전** — **저장 목록 표시 모드** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_153816.apk` | `1109346` | **이전** — **별도영역 이미지 표 표시** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_151910.apk` | `d13caf8` | **이전** — **별도영역 이미지 초록 테두리 수정** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_144416.apk` | `aabf4d5` | **이전** — **내 템플릿(사용자 정의)** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_135456.apk` | `e45db50` | **이전** — **저장 템플릿 시트 스크롤·여백** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_133903.apk` | `80d69b6` | **이전** — **저장 템플릿 6종 추가** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_131102.apk` | `1eba298` | **이전** — **템플릿 표시명 깜빡임 수정** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_113840.apk` | `9a3a8a2` | **이전** — **홈 네비 아이콘**(투명 템플릿·1.3배) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_110901.apk` | `dca00c5` | **이전** — **저장 템플릿·추가3** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_102421.apk` | `550c513` | **이전** — 앱내 미리보기 크롭 롤백 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_094044.apk` | `20391a6` | **이전** — **설정 저장 빠르게**(dirty+트랜잭션·재로드 생략·짧은 알림) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260723_091612.apk` | `4d56901` | **장소명 prefetch 재조회**(빈 장소명일 때 저장 화면에서 한 번 더) | **GitHub `releases/`** |

#### 2026-07-22

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260722_182753.apk` | `3af94ec` | **이전** — **스탬프 글자 크기** 설정(입력·미리보기·내보내기) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_170650.apk` | `ca16ea2` | **이전** — **확대 자르기(적용) 비활성**(미리보기만) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_164409.apk` | `b47ca39` | **이전** — cover 크롭 롤백(contain 복구) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_162518.apk` | `7302cd4` | **이전** — 확대 크롭 cover 일치 (**롤백됨**) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_133757.apk` | `41eef0c` | **이전** — **목록 빈 메모 숨김** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_130810.apk` | `0f9abfc` | **이전** — **스탬프별 표시명 스냅샷**(목록·내보내기·저장 레이스 수정) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_111946.apk` | `9a8242a` | **이전** — **저장 화면 표시명 탭 편집**(설정에도 저장) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_110520.apk` | `2de35d6` | **이전** — **크롭 EXIF 방향 정규화**(앱 내·갤러리=화면) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_102946.apk` | `85c1577` | **이전** — **저장 화면 필드 순서**=제목→장소(+층)→추가·메모 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_101525.apk` | `b6adf01` | **이전** — **별도 영역·PDF 2열 표**(표시명\|내용) + 추가1·추가2 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_095047.apk` | `4501a7f` | **이전** — **추가1·추가2**(저장·음성·값 있을 때만 워터마크) | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_091825.apk` | `30aed21` | **이전** — **필드 표시명 커스텀 + 워터마크 「표시명: 내용」** | **GitHub `releases/`** |
| `releases/VoiceStamp_20260722_000609.apk` | `11a7d29` | **이전** — **앱 내·시스템 크롭 적용** (getSize 레이스·뷰포트 수식) + 07-20 | **GitHub `releases/`** |

#### 2026-07-21

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260721_235129.apk` | `ee75aa8` | **이전** — **크롭=`225635`/`6060a48` 복구** + 07-20 PDF 현장 폴더 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260720_225635.apk` | `6060a48` | **이전** — PDF → 현장 폴더 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260721_233651.apk` | `9734037` | **비권장** — UI flush 시도 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260721_232039.apk` | `a9f396e` | **비권장** — 라이브 크롭 시도 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260721_215051.apk` | `7e91198` | **비권장** — 뷰포트 수식 시도 | **GitHub `releases/`** |

#### 2026-07-20

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260720_225635.apk` | `6060a48` | **권장** — **PDF → 현장(`YYYYMMDD_장소`) 폴더 archive** + 07-13 전부 | **GitHub `releases/`** |

#### 2026-07-14 (문서만 · APK 없음)

| 항목 | 내용 |
|------|------|
| 신규 APK | **없음** |
| 권장 APK | 당시 `releases/VoiceStamp_20260713_231004.apk` (`afb5e88`) 유지 |
| 문서 | **GS-UPLOAD-01** 설계·초안 · PRD·PLAN·README 날짜별·APK별 동기화 (`744e460`) |

#### 2026-07-13

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260713_231004.apk` | `afb5e88` | **이전 권장** — **카메라 권한 확인 중 화면 생략**(홈 즉시) + 내보내기 OOM 수정 + ZIP PDF 미포함 + `/report` 행 삭제 + 07-11 전부 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260713_171406.apk` | `73dcb4f` | **내보내기 OOM 수정**(바이너리/청크 ZIP·XLSX·HWPX) + ZIP PDF 미포함 + `/report` 행 삭제 (권한 홈 즉시 **미포함**) | GitHub |
| `releases/VoiceStamp_20260713_163836.apk` | `66c5d5b` | 프로젝트 ZIP **PDF 미포함** + `/report` 행 삭제 (바이너리 쓰기 **미포함**) | GitHub |

#### 2026-07-11

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260711_101055.apk` | `831030e` | **저장 손잡이**(확대 아이콘·폴더 선택) + **위치 끔=GPS+학교** + `084109` 전부 | GitHub |
| `releases/VoiceStamp_20260711_092106.apk` | `c0e0a32` | **위치 끔=GPS+로컬 학교 DB만** (카카오·직전 장소 없음) | GitHub |
| `releases/VoiceStamp_20260711_084109.apk` | `b588d83` | **내보내기 파일명·제목 음성** + 목록 검색 음성 + 목록 성능 A+B | GitHub |
| `releases/VoiceStamp_20260711_082557.apk` | `46d6a41` | **목록 검색 음성** + 목록 성능 A+B + school_only 층 가드 | GitHub |
| `releases/VoiceStamp_20260711_081130.apk` | `4e0fce6` | **목록 성능 A+B**(썸네일·스탬프 우선) + school_only 층 가드 | GitHub |
| `releases/VoiceStamp_20260711_074726.apk` | `40805e9` | **층 school_only** 비학교 lastFloor/저장 가드 + 07-10 전부 | GitHub |

#### 2026-07-10

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260710_233524.apk` | `a0d05b9` | 확대 뷰어 **닫기·적용** 손잡이 하단 + 촬영음·1x·3x·5x + 07-09 전부 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260710_171301.apk` | `76aca1f` | 앱 내 **촬영음** 켜기/끄기 + 1x·3x·5x + 07-09 전부 | GitHub |
| `releases/VoiceStamp_20260710_165146.apk` | `879658d` | 앱 내 카메라 **1x·3x·5x** 배율 | GitHub |

#### 2026-07-09

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260709_170409.apk` | `ed2f7ec` | 설정 **`loadSettingsForScreen()`**·스피너 제거 + 07-09 전부 (1x·3x·5x **미포함**) | GitHub |
| `releases/VoiceStamp_20260709_164922.apk` | `9903447` | 설정 **하단 바**(뒤로·저장, `bottom: 31`) | GitHub |
| `releases/VoiceStamp_20260709_163343.apk` | `d68edeb` | 설정 칩 **· 기본**·**기본값 버튼 제거** | GitHub |
| `releases/VoiceStamp_20260709_153137.apk` | `9fb7e16` | 설정 **저장 버튼 하단 고정** | GitHub |
| `releases/VoiceStamp_20260709_151301.apk` | `3c3ee0f` | 앱 내 카메라 **핀치·더블탭 확대** | GitHub |
| `releases/VoiceStamp_20260709_145528.apk` | `fc076c8` | **일반 촬영 카메라** (시스템/앱 내) | GitHub |
| `releases/VoiceStamp_20260709_140843.apk` | `392e611` | **위치 끔** 시 **직전 장소** 자동 채움 | GitHub |

#### 2026-07-06

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260706_112756.apk` | `f6d33fd` | **권장** — **zoom.png** 재업로드·투명 배경 + 07-06 전부 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260706_111021.apk` | `4d6eeab` | **zoom.png** 투명 처리(수정본) | GitHub |
| `releases/VoiceStamp_20260706_105242.apk` | `822e830` | **zoom.png** 최초 투명 배경 | GitHub |
| `releases/VoiceStamp_20260706_103245.apk` | `91ce71f` | 목록 내보내기 **파일명·보고서 제목 모달** | GitHub |
| `releases/VoiceStamp_20260706_101457.apk` | `08cf91b` | 미리보기 배지 **`zoom.png`** | GitHub |
| `releases/VoiceStamp_20260706_095128.apk` | `fe2ee58` | 미리보기 **`zoomedit.png`** 투명 배지 | GitHub |
| (소스) | `e04ce17` | 저장·수정 미리보기 **확대/수정 배지** 추가 | 소스 |

#### 2026-07-03

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260703_162433.apk` | `baf6a30` | **권장** — PDF **페이지内 동일 photo-slot**·`object-fit: contain` (`restore-pdf-photo-slot.bat`) + 07-03 전부 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260703_154800.apk` | `af6609e` | PDF **캡션 너비=사진** (`restore-pdf-caption-fit.bat`) | GitHub |
| `releases/VoiceStamp_20260703_152212.apk` | `c3b1bef` | **위치 끔**이어도 **장소 입력** (`restore-place-field-always.bat`) | GitHub |
| `releases/VoiceStamp_20260703_143138.apk` | `61bb13a` | 갤러리 **앱만** 저장 (`restore-gallery-app-only.bat`) | GitHub |

#### 2026-07-01

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260701_230340.apk` | `376368b` | **07-01 저녁 권장** — **처리 중 오버레이**·저장 성능·학교명만 + `165406` 전부 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260701_225211.apk` | `b641d78` | **처리 중 오버레이** (`restore-post-capture-busy.bat`) | GitHub |
| `releases/VoiceStamp_20260701_221146.apk` | `d809e99` | 저장 모달 **성능** (`restore-save-modal-perf.bat`)·학교명만 (`restore-school-skip-region.bat`) | GitHub |
| `releases/VoiceStamp_20260701_165406.apk` | `61ca32a` | **촬영 후 선택/저장 바로** (`restore-capture-after-mode.bat`) + `163737` 기능 전부 | GitHub |
| `releases/VoiceStamp_20260701_163737.apk` | `5b150a3` | 3버튼 시트 **fast 위치만**·정밀 GPS 백그라운드 (`restore-location-fast-sheet.bat`) | GitHub |
| `releases/VoiceStamp_20260701_160259.apk` | `5f63f07` | 카메라 **위치 워밍업**·lastKnown 우선 (`restore-location-warmup.bat`) | GitHub |
| `releases/VoiceStamp_20260701_153110.apk` | `9e1821c` | 저장 모달 **즉시 미리보기**·APK 파일명 설정 (`restore-save-preview-fast.bat`) | GitHub |
| `releases/VoiceStamp_20260701_145618.apk` | `ff22c24` | prefetch **중복 생략**·학교 DB fast path (`restore-location-prefetch-school.bat`) | GitHub |
| (문서) | `9d0b85d` | PRD·PROJECT·PLAN·README `4b6834d` 동기화 | — |

#### 2026-06-27

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260627_092959.apk` | `547b693` | **권장** — 시스템 카메라 확인 후 **「시스템 카메라 여는 중」 깜빡임 제거** (`AppState` + `restore-camera-busy-overlay.bat`) + `233248` 기능 전부 | **GitHub `releases/`** |
| (웹만) | `800971a` | 랜딩 **QR·Web Share** — qrcodejs MIT 자체 호스팅 (`restore-landing-share.bat`) | Vercel |
| (웹만) | `4b6834d` | `restore-landing-share.bat`에 `license.html` 복원 포함 | — |

#### 2026-06-26

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260626_233248.apk` | `1940314` | **권장** — 음성 **수동 커서** (`prepareSpeechTarget`) + `231436` 기능 전부 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260626_231436.apk` | `480e01f` | **층→장소** 표기·수정 모달 입력 안정화 (`restore-floor-on-place.bat`) | GitHub |
| `releases/VoiceStamp_20260626_225833.apk` | `26e8975` | 학교·POI 반경 **200m** (`restore-school-radius-200.bat`) | GitHub |
| `releases/VoiceStamp_20260626_194421.apk` | `bdf4376` | 설정 **위치 조회 끔** (`restore-location-off.bat`) | GitHub |
| `releases/VoiceStamp_20260626_184823.apk` | `6f95aa8` | 촬영 후 3버튼 **눌림 배경·Android 리플** + `172205` 기능 전부 | GitHub |
| `releases/VoiceStamp_20260626_172205.apk` | `fb0363b` | **도로명+POI 근처**·음성 끝 공백·커서·장소 마이크·`place_label` (버튼 눌림 **미포함**) | GitHub |
| `releases/VoiceStamp_20260626_170125.apk` | `0b5c1b8` | 음성 끝 공백·커서 (`restore-speech-end-gap.bat`) | GitHub |
| `releases/VoiceStamp_20260626_163412.apk` | `b06310a` | 장소 필드 마이크 (`restore-place-speech.bat`) | GitHub |
| `releases/VoiceStamp_20260626_152305.apk` | `0869e93` | ML Kit 장면 키워드 **되돌림** | GitHub |
| `VoiceStamp_20260626_134226.apk` | `3037ffe` | `place_label` 별도 장소 필드 배포 | 로컬 |

> 웹: `467059d`·`e79a4ac`·`622398d` 랜딩 패널·링크 정리 — APK 변경 없음.

#### 2026-06-25

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260625_171805.apk` | `847ea63` | **권장** — 캡션 갤러리 **EXIF**(ISO·GPS·크기)·DISPLAY_NAME 한글·도로 위치 | **GitHub `releases/`** |
| `releases/VoiceStamp_20260625_165551.apk` | `44997be` | **MediaStore DISPLAY_NAME** 한글 (`voicestamp-gallery`) | GitHub |
| `VoiceStamp_20260625_161125.apk` | `143a140` | 갤러리 한글 파일명·`_orig` — **캐시 경로 한글로 저장 실패** | 로컬 (비권장) |
| `VoiceStamp_20260625_100743.apk` | `511a67c` | **도로·지번·근처 POI** 위치 제목 (학교 반경 300m) | 로컬 |

> 웹: `f50a2fb` 랜딩 저작권 표기 — APK 변경 없음.

#### 2026-06-24

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260624_094846.apk` | `64aa037` | **권장** — 휴지통 비우기 후 목록 복귀·`← 목록` 제거·보내기 하단바·내비 31px | **GitHub `releases/`** |
| `VoiceStamp_20260624_093448.apk` | `c5cbeec` |보내기 하단바 Android `marginBottom: 31` | 로컬 |
| `VoiceStamp_20260624_092411.apk` | `ecb3fe1` | 목록 선택 **보내기 하단바**·헤더 축소·파일명 접기 | 로컬 |
| `VoiceStamp_20260624_085417.apk` | `64d6728` | **휴지통 비우기** 설정→휴지통 화면 | 로컬 |

#### 2026-06-23

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260623_164337.apk` | `0ab0f93` | **권장 (로컬)** — GPS 프리페치·연속 인앱 카메라·스플래시 flex 확대 포함 | 로컬 |
| `VoiceStamp_20260623_132828.apk` | `a89e166` | 스플래시 flex 확대 (웹 루트·휴지통 confirm **미포함**) | 로컬 |

> 웹 전용 (`0c7e2dd`~`e6bb868`): 루트 APK 랜딩·`/app`·`post-export-web-layout.mjs`·랜딩 개인정보 안내 — APK 기능 변경 없음.

#### 2026-06-22

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260622_094203.apk` | `4f20bca` | **촬영 시트 GPS 프리페치** · **연속 촬영 인앱 카메라** | **GitHub `releases/`** |
| `VoiceStamp_20260622_000517.apk` | `b5922eb` | **연속 촬영** 루프 직전 **좌표·장소명 재사용** (프리페치·인앱 카메라 **미포함**) | 로컬 |

#### 2026-06-21

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260621_234030.apk` | `ec4930e` | 촬영 확인 후 **3버튼** (다시 촬영 / 저장 / 연속 촬영) | 로컬 |
| `VoiceStamp_20260621_235346.apk` | `ec4930e` | 위와 동일 (재빌드) | 로컬 |
| `VoiceStamp_20260621_125741.apk` | `3ecb4f4` | **좌표 표기 없음=숨김** (3버튼 **미포함**) | 로컬 |

#### 2026-06-20

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260620_234924.apk` | `eaa17e4` | 저장 목록 **제목·메모 검색** + `schools.sqlite` | **GitHub `releases/`** |
| `VoiceStamp_20260620_171910.apk` | `88671c1` | 빌드 타임 **`schools.sqlite`** (12,011교, bbox+haversine 200m) | — |
| `VoiceStamp_20260620_165718.apk` | `55c33df` | JSON seed 학교 DB — **첫 실행 12k INSERT로 부팅 멈춤** | **사용 금지** |

#### 2026-06-19

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260619_101343.apk` | `2a5b75b` | **앱 내 오픈소스 라이선스**(817건)·dual-license 검토 완료 UI·`LICENSE-NOTICE.md`(베타) | **권장 (로컬)** |

#### 2026-06-17

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260617_184121.apk` | `7b6b0c1` | **학교 200m 이내 학교명**, 그 외 건물명→도로명 (설정 모드 없음) | **권장 (로컬)** |
| `VoiceStamp_20260617_182811.apk` | `5699d9c` | 설정 뒤로가기·위치 3모드·fast snapshot **revert**·저장 모달 | 로컬 |
| `VoiceStamp_20260617_181630.apk` | `3af9203` | `StampSavePreview` `isThumbnail` 선언 순서 (흰 화면) | 로컬 (위치 불안) |
| `VoiceStamp_20260617_174312.apk` | `c612e69` | GPS 3초·`getFastLocationSnapshot`·카카오 5초 타임아웃 | **되돌림** |
| `VoiceStamp_20260617_172752.apk` | `08c132a` | 위치 표시 3모드 (교육/공공/일반) | **되돌림** |
| `VoiceStamp_20260617_131932.apk` | `3e6a90d` | 기관명·하단 문구 **워터마크 한 바** 통합 | 로컬 |
| `VoiceStamp_20260617_130651.apk` | `60a9754` | 워터마크 **파스텔** 10색 | 로컬 |
| `VoiceStamp_20260617_113216.apk` | `35bdba6` | 워터마크 **10색 칩** (원색) | 로컬 |
| `VoiceStamp_20260617_111707.apk` | `78fd3e6` | **기관명·하단 문구** 오버레이 (상단 별도 바) | 로컬 |
| `VoiceStamp_20260617_104040.apk` | `792df0c` | 보라 VS 아이콘 + Adaptive Icon safe zone | 로컬 |
| `VoiceStamp_20260617_102024.apk` | `b2d5456` | 보라 VS 마이크 앱 아이콘 | 로컬 |
| `VoiceStamp_20260617_092917.apk` | `24d8fac` | `/report` JPEG 글자 크기 75~150% | 로컬 |
| `VoiceStamp_20260617_091820.apk` | `b9edc0e` | `/report` 클라이언트 JPEG ZIP | 로컬 |
| `VoiceStamp_20260617_001635.apk` | `87c7e15` | 워터마크 **검은 반투명 / 흰색 반투명** | 로컬 |
| `VoiceStamp_20260617_000721.apk` | `534c9f7` | 워터마크 스타일(빨간 세로줄 포함, 중간) | 로컬 |

#### 2026-06-16

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `VoiceStamp_20260616_173518.apk` | `7e453ea` | 목록 하단 **촬영 캡슐** (`capture.png`) | 로컬 |
| `VoiceStamp_20260616_170713.apk` | `72ccc32` | 갤러리 아이콘+「갤러리」 (중간) | 로컬 |
| `VoiceStamp_20260616_165243.apk` | `9ceb325` | 첨부 아이콘 28px `cover` | 로컬 |
| `VoiceStamp_20260616_163531.apk` | `109bfa3` | 하단바 `bottom: 31` (내비 바 회피) | 로컬 |
| `VoiceStamp_20260616_094515.apk` | `7c127aa` | 목록 UI(헤더·⋮·하단 첨부·촬영·카드)·첨부 아이콘 | 로컬 |
| `releases/VoiceStamp_20260616_082006.apk` | `f74012f` | 목록 카메라-back 아이콘 (`3fca65b`) | **GitHub** |
| `releases/VoiceStamp_20260616_081011.apk` | `ce59962` | 카메라 홈 스플래시·촬영·하단 내비 (`7bf21fc`) | GitHub |
| `releases/VoiceStamp_20260616_075840.apk` | `c8221ca` | 설정 톱니 PNG (`ae0695f`) | GitHub |

#### 2026-06-15

| APK 파일 | 커밋 | 주요 변경 | 배포 |
|----------|------|-----------|------|
| `releases/VoiceStamp_20260615_153600.apk` | `c6aff3c` | HWPX 템플릿 `expo-asset` APK 로드 (`9ab30ee`) | GitHub |
| `releases/VoiceStamp_20260615_233456.apk` | `2fa772c` | 카메라 홈 중앙 정렬·설정 **텍스트** 버튼 (아이콘 되돌림 `027c6fa`) | GitHub |
| `releases/VoiceStamp_20260615_232645.apk` | `05392ee` | 카메라 홈 검은 배경 중앙 정렬 (`d8b5c98`) | GitHub |
| `releases/VoiceStamp_20260615_231718.apk` | `47756ce` | 카메라 홈 스플래시 이미지 (`338d919`) | GitHub |
| `releases/VoiceStamp_20260615_230611.apk` | `e5dad56` | 카메라 설정 대형 톱니 아이콘 (`8d282e6`) | GitHub |
| (소스) | `6737f13`~`503e81a` | 프로젝트 ZIP·XLSX·HWPX·웹 report 라이트박스 | 소스 (153600 APK에 HWPX 포함) |

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
| `settingsService.ts` | 앱 설정, `current_site_name`, `gallery_album_ids`, `watermark_style` |
| `watermarkStyle.ts` | 워터마크 바 테마·PDF CSS·웹 Canvas·미리보기 색상 |
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
| 워터마크 스타일 | 검은 반투명 / 흰색 반투명 | 검은 반투명 |
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

### 2026-08-10

| 항목 | 내용 |
|------|------|
| 분류 | 취합전송 사업명·참여 전환 · 조인 QR Modal · 수신 엑셀 px·800·글자 크기 |
| 커밋 | `3e18bf3`~`086377c` · APK `dda285a` (`113846`) |
| APK | **권장** `releases/VoiceStamp_20260810_113846.apk` — [CHANGELOG.md](./CHANGELOG.md) |
| 문서 | PRD·PLAN·PROJECT·README·CHANGELOG (**소스 없음**) |
| 롤백 | `restore-inbox-xlsx-font.bat` · `restore-inbox-xlsx-preview-px.bat` · QR Modal 계열 |

### 2026-08-09

| 항목 | 내용 |
|------|------|
| 분류 | 목록 선택 썸네일·취소 · 만든이 라벨 · 취합 배지 · 보낸 사진 · 홈 취합 아이콘 · 랜딩 UTF-8 · 가져옴 매칭 |
| 커밋 | `1d49485`~`2ba4edf` |
| APK | `085617`~`183720` (당일 말 `183720`) |
| 롤백 | `restore-inbox-received-match.bat` 등 SECURITY-20260809 계열 |

### 2026-08-08

| 항목 | 내용 |
|------|------|
| 분류 | NCP 취합 UX — 조인 QR·구분표시·사업 목록·딥링크 · 전송/수신 배지 · **수신함 병합** · 선택 엑셀·이력·초대 템플릿 · NCP 직통 · 엑셀·촬영자 |
| 커밋 | `85c9406`~`1f53a7d` · APK `081515`~`231815` |
| APK | 당일 주요 `143848`(병합) · `173120`(presign) · `231815`(촬영자) |
| 문서 | RELEASE-CHANNELS (`6811dc9`) 등 |
| 롤백 | `restore-inbox-merged-list.bat` · `restore-presign-direct.bat` 등 |

### 2026-08-07

| 항목 | 내용 |
|------|------|
| 분류 | **FEAT-NCP-PROJECT-01** — 설계 → **앱 연동**(QR·NCP·수신·엑셀) · SigV4·QR 그리드 |
| 문서 | [DESIGN-NCP-PROJECT-QR-UI-20260807.md](./DESIGN-NCP-PROJECT-QR-UI-20260807.md) · [PLAN-NCP-PROJECT-IMPLEMENTATION.md](./PLAN-NCP-PROJECT-IMPLEMENTATION.md) · [SECURITY-ncp-project-qr-20260807.md](./SECURITY-ncp-project-qr-20260807.md) |
| 커밋 | `143e4ac` · `934f390`~`f3a4789` |
| APK | `121056`~`233124` |

### 2026-08-03

| 항목 | 내용 |
|------|------|
| 분류 | 목록 장소 칩 · 저장 모달 유형 선택(다음 기본값) · [DESIGN-place-chip-save-template-20260803.md](./DESIGN-place-chip-save-template-20260803.md) · `restore-place-chip-save-template.bat` |
| 웹 저장 | `showAlert` · canvas persist · [DESIGN-web-save-alert-20260803.md](./DESIGN-web-save-alert-20260803.md) · `restore-web-save-alert.bat` |
| 앨범 | EXIF GPS → 장소 · `restore-gallery-exif-place.bat` |
| 음성 | **F-Voice-10** 항목 말하기 · **F-Voice-11** 유형·말하기 예 · [DESIGN-save-slot-speech.md](./DESIGN-save-slot-speech.md) · `restore-save-slot-speech.bat` · `restore-slot-speech-type-hint.bat` · `restore-item-speak-label.bat` |
| 커밋 | `5850f1c` · `190a5e6` · `6f1dcc2`~`8825a72` · `8856461` · `7fbd20b` · `09f9c87` · `114b3dc` · `6cd1dc4` |
| APK | **권장** `releases/VoiceStamp_20260803_161016.apk` (`6cd1dc4`) |
| 문서 | PRD·PLAN·PROJECT·README·CHANGELOG 날짜별·APK별 동기화 (**소스 변경 없음**) |

### 2026-08-02

| 커밋 | 내용 |
|------|------|
| `2a00578` | 선택 취소 후 목록 흰 썸네일 · APK `124143` · `restore-list-thumb-selection-fix.bat` |
| `869a0bb` | 설정 필드 표시명 UI 제거 · APK `115453` · `restore-hide-settings-field-labels.bat` |
| `2dcf74b` | 목록 행 높이 추가 축소 · APK `111920` · `restore-list-row-tighter.bat` |
| `037b0af` | 목록 플랫 행 · APK `105935` · `restore-list-row-compact.bat` |
| (본 문서) | PRD·PROJECT·PLAN·README·CHANGELOG 날짜별·APK별 동기화 (`2a00578`) — **소스 변경 없음** |

> **권장 APK:** `releases/VoiceStamp_20260802_124143.apk` `2a00578`.

### 2026-08-01

| 커밋 | 내용 |
|------|------|
| `f005041` | 내보내기/검색 음성 혼입 방지 · APK `232652` · `restore-speech-target-guard.bat` |
| `45bf293` | 헬스체크 기준 고정 문서 · **소스 변경 없음** |
| `073c8bf` | **성능 번들 C** · APK `193317` |
| `9d8ccfa` | **성능 번들 B** · APK `191117` |
| `e45026b` | **성능 번들 A** · APK `185512` |
| `d363b00` | QR URL 연결확인 · APK `172149` |

> **당시 권장 APK (08-01 말 음성 가드):** `releases/VoiceStamp_20260801_232652.apk` `f005041`.

> **당시 권장 APK (08-01 번들 C):** `releases/VoiceStamp_20260801_193317.apk` `073c8bf`.

### 2026-07-31

| 커밋 | 내용 |
|------|------|
| `626c1a4` | 웹 보안 헤더·visitor POST 제한·`/report` imageFile 화이트리스트 · `restore-web-security-harden.bat` · Vercel |
| `a9509b9` | **QR URL mic APK** — `releases/VoiceStamp_20260731_102403` · 랜딩·`/info` · 설정 힌트 |
| `4a9e287` | QR URL(별도 영역) **마이크**·기본 `https://` · `restore-qr-url-mic.bat` |
| `98aeb25` | 랜딩 APK 파일명 아래 큰 **웹테스트** · `restore-landing-web-test-link.bat` |
| `3be0a07` | **왼손 홈 테마 APK** — `releases/VoiceStamp_20260731_094832` · 랜딩·`/info` |
| `348130e` | **F-CAM-27** 왼손=`mainint1`+아이콘 덮어쓰기 · `restore-camera-hand-theme.bat` |
| (본 문서) | PRD·PROJECT·PLAN·README 날짜별·APK별 동기화 (`a9509b9`/`626c1a4`) — **소스 변경 없음** |

> **당시 권장 APK (07-31):** `releases/VoiceStamp_20260731_102403.apk` (`a9509b9`).

### 2026-07-30

| 커밋 | 내용 |
|------|------|
| `735c0d7` | PRD·PROJECT·PLAN·README 동기화 (`49e9c70`) — **소스 변경 없음** |
| `49e9c70` | **caption QR APK** — `releases/VoiceStamp_20260730_114713` · 랜딩·`/info` · Vercel |
| `9b9175c` | **F-QR-01** — `source_url` · OCR URL 추출·확인 · caption JPEG QR · MIT `qrcode` · `restore-qr-caption.bat` |

> **당시 권장 APK (07-30 말):** `releases/VoiceStamp_20260730_114713.apk` (`49e9c70`). (이후 **`102403`** — §12 2026-07-31)

### 2026-07-28

| 커밋 | 내용 |
|------|------|
| `a67c68c` | **카메라 홈** 기본=mainint(검정)·스타일2=mainint1 · APK `135843` |
| `a9783a5` | 홈 기본 mainint1 시도 · APK `132816` |
| `00090a2` | 카메라 홈 배경 설정 · APK `113356` |
| `2124da6` | 카메라 홈 mainint · 시작 배너 복구 · APK `111800` |
| `7e6fa63` | 시작 배너 mainint · APK `105823` |

> **당시 권장 APK (07-28 말):** `releases/VoiceStamp_20260728_135843.apk` (`a67c68c`). (이후 **`114713`** — §12 2026-07-30)

### 2026-07-27

| 커밋 | 내용 |
|------|------|
| `22597f6` | 웹 한도 게이트 · 저장 액션 버튼 나란히 |
| `1413de9` | OCR 긴 메모 칸·시트 스크롤 · 도움말 |

### 2026-07-25

| 커밋 | 내용 |
|------|------|
| `3ebb51f` | **AI-ML-01** 장면 키워드 APK — `releases/VoiceStamp_20260725_114802` |
| `06ae8e2` | **AI-ML-01** 온디바이스 장면 키워드 → 메모 초안 · `restore-mlkit-scene.bat` |
| `0897335` | **AI-ML-03** OCR 제목·메모 APK — `releases/VoiceStamp_20260725_104328` |
| `8b74ccf` | **AI-ML-03** 온디바이스 OCR → 제목·메모 초안 · 설정 opt-in · `restore-ocr-title-memo.bat` |
| `94950ff` | **개인정보 가리기 수동 영역 APK** — `releases/VoiceStamp_20260725_101238` · 랜딩·`/info` · Vercel |
| `29b86a1` | **가리기 푸터 여백 + 탭 수동 모자이크 영역** · 도움말·PRIVACY · `restore-privacy-manual-region.bat` |
| `658af2b` | **저장 템플릿 적용 상태 APK** — `releases/VoiceStamp_20260725_095546` |
| `a084982` | **저장 템플릿 적용 중/사용자수정** · `restore-active-template-status.bat` |
| `a5545b2` | PRD·PROJECT·PLAN·README 동기화 (`94950ff`) — **소스 변경 없음** |

> **당시 권장 APK (07-25 가리기):** `releases/VoiceStamp_20260725_101238.apk` (`94950ff`). (이후 OCR·장면·홈·QR 누적 → **`114713`**)

### 2026-07-24

| 커밋 | 내용 |
|------|------|
| `39b3447` | **앱 내 카메라 전후면 전환** · 셀피 미러 |
| `35f6d9b` | **개인정보 가리기 EXIF 정렬** — 시스템 카메라 JPEG · APK `releases/VoiceStamp_20260724_182721` · Vercel |
| `f6403fe` | **하단 촬영 일시** — 설정 `export_footer_datetime`(기본 표시) · PDF·캡션 이미지 하단만 · 제목 접두어(`pdf_show_datetime`)·워터마크와 분리 · 도움말 · APK `releases/VoiceStamp_20260724_114341` · Vercel · `restore-export-footer-datetime.bat` §188 |
| `239883c` | **모자이크 해상도·영역 비례 강도** — 약·중·강 · APK `releases/VoiceStamp_20260724_111410` · Vercel · `restore-privacy-blur-scale.bat` §187 |
| `449da4d` | **AI-ML-02 개인정보 가리기** — ML Kit Face+한글 OCR → 온디바이스 모자이크 · 설정 opt-in · `modules/voicestamp-mlkit` · 도움말·PRIVACY · APK `releases/VoiceStamp_20260724_105355` · Vercel · `restore-privacy-blur.bat` §186 |
| `b70d3a0` | PRD·PROJECT·PLAN·README 날짜별·APK별 동기화 (`f6403fe` 기준) — **소스 변경 없음** |

> **당시 권장 APK (07-24 말 EXIF):** `releases/VoiceStamp_20260724_182721.apk` (`35f6d9b`). (이후 **`101238`** — §12 2026-07-25)

### 2026-07-23

| 커밋 | 내용 |
|------|------|
| `8bad078` | **별도영역 이미지 흐림 수정** — ViewShot 오프스크린 대신 네이티브 불투명 JPEG 합성 · APK `releases/VoiceStamp_20260723_185321` · Vercel · `restore-caption-export-wash.bat` §185 · MIT `react-native-image-marker` (신규 의존성 없음) |
| `217b6d5` | PRD·PROJECT·PLAN·README 문서 동기화 (`8bad078` 기준) — 날짜별·APK별 이력 · **소스 변경 없음** |
| (본 문서) | 07-22 APK `170650`·`182753` 등 날짜별·APK별 이력 보강 · **소스 변경 없음** |
| `f4be621` | **저장 목록 표시 모드** — 설정 제목·날짜만/전체 · APK `releases/VoiceStamp_20260723_170552` · Vercel · `restore-list-display-mode.bat` §184 |
| `1109346` | **별도영역 이미지 표 표시** — PDF와 동일 2열 표(ViewShot+네이티브) · APK `releases/VoiceStamp_20260723_153816` · Vercel · `restore-caption-image-table.bat` §183 |
| `d13caf8` | **별도영역 이미지 초록 테두리 수정** — 캡션 JPEG 흰 캔버스(반투명 노랑→초록) · APK `releases/VoiceStamp_20260723_151910` · Vercel · `restore-caption-green-border.bat` §182 |
| `aabf4d5` | **내 템플릿(사용자 정의)** — 만들기·기존 복사·수정·삭제(기기 SQLite, 최대 30) · APK `releases/VoiceStamp_20260723_144416` · Vercel · `restore-custom-field-templates.bat` §181 |
| `e45db50` | **저장 템플릿 시트 스크롤·여백** — 제목 고정·목록 ScrollView·닫기 하단 여백 · APK `releases/VoiceStamp_20260723_135456` · Vercel · `restore-template-sheet-scroll.bat` §180 |
| `80d69b6` | **저장 템플릿 6종 추가** — 교육·급식·지원·자산·재난·민원 · APK `releases/VoiceStamp_20260723_133903` · Vercel · `restore-more-field-templates.bat` §179 |
| `1eba298` | **템플릿 표시명 깜빡임 수정** · APK `releases/VoiceStamp_20260723_131102` · `restore-template-label-flash.bat` §178 |
| `9a3a8a2` | **홈 네비 아이콘** — 투명 템플릿·1.3배 · APK `releases/VoiceStamp_20260723_113840` · `restore-home-nav-icons.bat` §177 |
| `dca00c5` | **저장 템플릿·추가3** — 홈 템플릿(안전/공사) · 필드 표시명+흐린 예시 · extra3 · APK `releases/VoiceStamp_20260723_110901` · Vercel · `restore-field-templates.bat` §176 |
| `550c513` | **앱내 미리보기 크롭 롤백** · APK `releases/VoiceStamp_20260723_102421` · `restore-revert-inapp-preview-crop.bat` §175 |
| `f27fcb6` | **앱내 카메라 미리보기 맞춤 저장** — FILL 프리뷰 비율 크롭 · APK `releases/VoiceStamp_20260723_100201` · `restore-inapp-preview-crop.bat` §174 |
| `20391a6` | **설정 저장 빠르게 1+2+3+4** — dirty만 쓰기 · SQLite 트랜잭션 · 저장 후 refresh 생략 · 짧은 알림 · APK `releases/VoiceStamp_20260723_094044` · Vercel · `restore-settings-save-fast.bat` §173 |
| `4d56901` | **장소명 prefetch 재조회** — 좌표만 있고 장소명이 비면 저장 모달에서 재조회 · APK `releases/VoiceStamp_20260723_091612` · Vercel · `restore-place-label-retry.bat` §172 |

### 2026-07-22

| 커밋 | 내용 |
|------|------|
| `3af94ec` | **스탬프 글자 크기** — 설정·입력·미리보기·워터마크·PDF·갤러리 합성 · APK `releases/VoiceStamp_20260722_182753` · Vercel · `restore-stamp-text-size.bat` §171 |
| `ca16ea2` | **확대 자르기(적용) 비활성** — 미리보기 확대만 유지 · APK `releases/VoiceStamp_20260722_170650` · Vercel · `restore-disable-crop-apply.bat` §170 |
| `b47ca39` | **cover 크롭 롤백** — contain 뷰어·수식 복구 · APK `releases/VoiceStamp_20260722_164409` · Vercel · §169 |
| `7302cd4` | **확대 크롭 cover 일치** — APK `162518` · **이후 롤백** · §168 |
| `41eef0c` | **목록 빈 메모 숨김** — 내용 없으면 `(표시명 없음)` 미표시 · APK `releases/VoiceStamp_20260722_133757` · Vercel · `restore-list-hide-empty-memo.bat` §167 |
| `0f9abfc` | **스탬프별 표시명 스냅샷** — DB `*_field_label` · 목록·PDF·이미지 · 저장 시 레이스 수정 · APK `releases/VoiceStamp_20260722_130810` · Vercel · `restore-stamp-field-labels.bat` §166 |
| `9a8242a` | **저장 화면 표시명 탭 편집** · APK `releases/VoiceStamp_20260722_111946` · `restore-save-label-edit.bat` §165 |
| `2de35d6` | **크롭 EXIF 방향 정규화** · APK `releases/VoiceStamp_20260722_110520` · `restore-crop-orient.bat` §164 |
| `85c1577` | **저장 화면 필드 순서**=제목→장소 · APK `releases/VoiceStamp_20260722_102946` · `restore-save-field-order.bat` §163 |
| `b6adf01` | **별도 영역·PDF 2열 표** · APK `releases/VoiceStamp_20260722_101525` · `restore-caption-table.bat` §162 |
| (이전) | **추가 필드 2개** — DB `extra1`/`extra2` · 표시명 · 음성 · 값 있을 때만 워터마크 · APK `releases/VoiceStamp_20260722_095047` · `restore-extra-fields.bat` §161 |
| `30aed21` | **필드 표시명 커스텀 + 워터마크 「표시명: 내용」** · APK `releases/VoiceStamp_20260722_091825` · `restore-field-labels.bat` §160 |
| `11a7d29` | **앱 내 카메라 크롭「적용」수정** · APK `releases/VoiceStamp_20260722_000609` · `restore-crop-inapp-fix.bat` §159 |

> **당시 권장 APK (07-23 말):** `releases/VoiceStamp_20260723_185321.apk` (`8bad078`). (이후 **`114341`** — §12 2026-07-24)

### 2026-07-21

| 커밋 | 내용 |
|------|------|
| (본 배포) | **크롭을 `6060a48`/`225635`로 롤백** · APK `releases/VoiceStamp_20260721_235129` · 랜딩·`/info` · 도움말 · Vercel · `restore-revert-crop-225635.bat` §158 |
| `9734037` | **적용=UI 스레드 flush** · APK `233651` · `restore-crop-apply-ui-flush.bat` §157 (**이후 롤백**) |
| `a9f396e` | **적용=라이브 줌** · APK `232039` · `restore-crop-apply-live.bat` §156 (**이후 롤백**) |
| `7e91198` | **확대 크롭 적용=화면 가시 영역** · APK `215051` · `restore-crop-viewport-fix.bat` §155 (**이후 롤백**) |

> **당시 권장 APK:** `releases/VoiceStamp_20260721_235129.apk` (`225635` 크롭 계열). (이후 `000609` 권장)

### 2026-07-20

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`6060a48` 기준) — 날짜별·APK별 이력 |
| `6060a48` | **PDF archive → `stamps/YYYYMMDD_장소명/`** · 도움말 · APK `releases/VoiceStamp_20260720_225635` · 랜딩·`/info` · Vercel · `restore-export-site-folder.bat` §154 · `restore-apk-download-20260720-225635.bat` |

> **권장 APK:** `releases/VoiceStamp_20260720_225635.apk` (`6060a48`). 랜딩·`/info` 다운로드 링크 동기화됨.

### 2026-07-14

| 커밋 | 내용 |
|------|------|
| `744e460` | PRD·PROJECT·PLAN·README 동기화 — **GS-UPLOAD-01** 초안·설계 · 날짜별·APK별 이력 · **소스·APK 변경 없음** |
| (파일) | [DESIGN-GOOGLE-SHEETS-UPLOAD.md](./DESIGN-GOOGLE-SHEETS-UPLOAD.md) · [drafts/google-sheets-upload/](./drafts/google-sheets-upload/) (`Code.gs`, `client-api.draft.ts`, `sample-payload.json`) |

> **당시 권장 APK:** `releases/VoiceStamp_20260713_231004.apk` (`afb5e88`).

### 2026-07-13

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`afb5e88` 기준) — 날짜별·APK별 이력 |
| `afb5e88` | APK `releases/VoiceStamp_20260713_231004` 게시 · 랜딩·`/info` · Vercel |
| `89941c6` | **카메라 권한 확인 중 화면 생략** — 홈 즉시 표시 · `restore-camera-permission-skip.bat` §153 · 도움말 |
| `e3203bc` | PRD·PROJECT·PLAN·README 문서 동기화 (`73dcb4f` 기준) |
| `73dcb4f` | APK `releases/VoiceStamp_20260713_171406` 게시 · 랜딩·`/info` · Vercel |
| `f68b363` | 프로젝트·엑셀·HWPX **바이너리/청크 저장** (OOM 완화) · `restore-export-binary-write.bat` §152 |
| `66c5d5b` | APK `releases/VoiceStamp_20260713_163836` 게시 · 랜딩·`/info` |
| `a58157f` | 프로젝트 ZIP **PDF 미포함** (속도) · `restore-project-zip-no-pdf.bat` §151 |
| `61a32ca` | `/report` **행 삭제** · `restore-report-row-delete.bat` §150 · Vercel |

> **이전 권장 APK:** `releases/VoiceStamp_20260713_231004.apk` (`afb5e88`).

### 2026-07-11

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`831030e` 기준) — 날짜별·APK별 이력 |
| `831030e` | APK `releases/VoiceStamp_20260711_101055` 게시 · 랜딩·`/info` · Vercel |
| `d0dcdf9` | 저장 화면 **확대 아이콘·폴더 선택** 손잡이 쪽 · `restore-save-hand-side.bat` §149 |
| `c0e0a32` | APK `releases/VoiceStamp_20260711_092106` 게시 · 랜딩·`/info` |
| `3914d32` | **위치 끔=GPS+로컬 학교 DB만** (카카오·직전 장소 자동 채움 제거) · `restore-location-school-only.bat` §148 |
| `bc32a8e` | APK `releases/VoiceStamp_20260711_084109` 게시 · 랜딩·`/info` |
| `b588d83` | **내보내기 파일명·제목 음성** — 손잡이 쪽 마이크 · `restore-export-name-mic.bat` §147 |
| `f745eb0` · `bf61c92` · `b64be78` | APK `082557` 게시·문서 동기화 |
| `46d6a41` | **목록 검색 음성** — 헤더 장식 마이크 제거, 제목·메모 검색창 앞 음성 마이크 · `restore-list-search-mic.bat` §146 |
| `d50534d` | APK `releases/VoiceStamp_20260711_081130` 게시 · 랜딩·`/info` |
| `4e0fce6` | **목록 성능 A+B** — 스탬프 우선 표시·FlatList 튜닝·디스크 썸네일 · `restore-list-perf-ab.bat` §145 |
| `d574ac9` | APK `releases/VoiceStamp_20260711_074726` 게시 · 랜딩·`/info` |
| `40805e9` | **층 school_only** — 비학교에 `lastFloor` 미적용·저장/빠른저장 가드 · `restore-floor-school-only.bat` §144 · 도움말·설정 힌트 |

> **이전 권장 APK:** `releases/VoiceStamp_20260711_101055.apk` (`831030e`).

### 2026-07-10

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`a0d05b9` 기준) — 날짜별·APK별 이력 |
| `a0d05b9` | 확대 뷰어 **닫기·적용** 손잡이 하단 · APK `releases/VoiceStamp_20260710_233524` · `restore-viewer-action-hand.bat` §143 · Vercel |
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`76aca1f` 기준) |
| `76aca1f` | APK `releases/VoiceStamp_20260710_171301` — 설정 **앱 내 촬영음** 켜기/끄기 · `restore-shutter-sound.bat` §142 · Vercel |
| `879658d` | APK `releases/VoiceStamp_20260710_165146` — 앱 내 카메라 **1x·3x·5x** 배율 · `restore-camera-zoom-presets.bat` §141 · Vercel |
| `5af6203` | PRD·PROJECT·PLAN·README 문서 동기화 (`ed2f7ec` 기준) |

> **권장 APK:** `releases/VoiceStamp_20260711_074726.apk` (`40805e9`). 이전: `releases/VoiceStamp_20260710_233524.apk` (`a0d05b9`).

### 2026-07-09

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`ed2f7ec` 기준) |
| `ed2f7ec` | APK `releases/VoiceStamp_20260709_170409` — 설정 **`loadSettingsForScreen()`**·스피너 제거 · `restore-settings-fast-load.bat` §140 · Vercel |
| `9903447` | APK `releases/VoiceStamp_20260709_164922` — 설정 **하단 바**(뒤로·저장) · `restore-settings-bottom-bar.bat` §139 · Vercel |
| `d68edeb` | APK `releases/VoiceStamp_20260709_163343` — 설정 칩 **· 기본**·기본값 버튼 제거 · `restore-settings-default-chips.bat` §138 · Vercel |
| `9fb7e16` | APK `releases/VoiceStamp_20260709_153137` — 설정 **저장 하단 고정** · `restore-settings-sticky-save.bat` §137 · Vercel |
| `3c3ee0f` | APK `releases/VoiceStamp_20260709_151301` — 앱 내 카메라 **핀치·더블탭 확대** · `restore-in-app-camera-zoom.bat` §136 · Vercel |
| `fc076c8` | APK `releases/VoiceStamp_20260709_145528` — **일반 촬영 카메라** 설정 · `restore-primary-capture-camera.bat` §135 · Vercel |
| `392e611` | APK `releases/VoiceStamp_20260709_140843` — **위치 끔** 시 **직전 장소** · `restore-last-place-off.bat` §134 · Vercel |
| `e1bce7a` | PRD·PROJECT·PLAN·README 문서 동기화 (`f6d33fd` 기준) |

> **권장 APK:** `releases/VoiceStamp_20260709_170409.apk` (`ed2f7ec`). 랜딩·`/info` 다운로드 링크 동기화됨.

### 2026-07-06

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`f6d33fd` 기준) |
| `f6d33fd` | APK `releases/VoiceStamp_20260706_112756` — **zoom.png** 재업로드·투명 배경 · Vercel |
| `4d6eeab` | APK `releases/VoiceStamp_20260706_111021` — **zoom.png** 투명(수정본) · Vercel |
| `822e830` | APK `releases/VoiceStamp_20260706_105242` — **zoom.png** 투명 배경 · Vercel |
| `91ce71f` | APK `releases/VoiceStamp_20260706_103245` — 목록 내보내기 **파일명·보고서 제목 모달** · `ExportNameModal` · `restore-list-export-name-modal.bat` §132 · Vercel |
| `08cf91b` | APK `releases/VoiceStamp_20260706_101457` — 미리보기 배지 **`zoom.png`** · `restore-stamp-zoom-png.bat` §131 · Vercel |
| `fe2ee58` | APK `releases/VoiceStamp_20260706_095128` — **`zoomedit.png`** 투명 배지 · Vercel |
| `e04ce17` | 저장·수정 모달 미리보기 **확대/수정 배지** · `restore-stamp-preview-zoom-badge.bat` §130 |
| `f6a685a` | PRD·PROJECT·PLAN·README 문서 동기화 (`baf6a30` 기준) |

> **권장 APK:** `releases/VoiceStamp_20260706_112756.apk` (`f6d33fd`). 랜딩·`/info` 다운로드 링크 동기화됨.

### 2026-07-03

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`baf6a30` 기준) |
| `baf6a30` | APK `releases/VoiceStamp_20260703_162433` — PDF **동일 photo-slot** 배포 · Vercel |
| `baf6a30` | PDF **페이지内 동일 photo-slot**·`object-fit: contain` · `restore-pdf-photo-slot.bat` |
| `af6609e` | APK `releases/VoiceStamp_20260703_154800` — PDF 캡션 너비 배포 · Vercel |
| `af6609e` | PDF **캡션 너비=사진** (별도 영역) · `restore-pdf-caption-fit.bat` |
| `c3b1bef` | APK `releases/VoiceStamp_20260703_152212` — 장소 필드 배포 · Vercel |
| `c3b1bef` | **위치 끔**이어도 저장 모달 **장소 입력** · `restore-place-field-always.bat` |
| `61bb13a` | APK `releases/VoiceStamp_20260703_143138` — 갤러리 **앱만** 배포 · Vercel |
| `61bb13a` | 갤러리 **앱만** 저장 모드 · `restore-gallery-app-only.bat` |

> **권장 APK:** `releases/VoiceStamp_20260703_162433.apk` (`baf6a30`). 랜딩·`/info` 다운로드 링크 동기화됨.

### 2026-07-01

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`61ca32a` 기준) — `2cef47f` |
| `376368b` | APK `releases/VoiceStamp_20260701_230340` — **저녁 권장** 배포 · `restore-apk-download-20260701_230340.bat` · Vercel |
| `52c8578` | 촬영 후 **처리 중 오버레이** (런처 깜빡임 방지) · `restore-post-capture-busy.bat` |
| `b641d78` | APK `releases/VoiceStamp_20260701_225211` 배포 · `restore-apk-download-20260701_225211.bat` · Vercel |
| `cff5cf3` | 저장 모달 **성능** (워밍·설정 캐시·미리보기 지연) · `restore-save-modal-perf.bat` |
| `d809e99` | APK `releases/VoiceStamp_20260701_221146` 배포 · `restore-apk-download-20260701_221146.bat` · Vercel |
| `85460bf` | 로컬 **학교명만** (Kakao region 생략) · `restore-school-skip-region.bat` |
| `61ca32a` | APK `releases/VoiceStamp_20260701_165406` — **촬영 후 모드** 배포 · `restore-apk-download-20260701_165406.bat` · Vercel |
| `b8c4406` | 설정 **촬영 후** (선택 화면 / 저장 화면 바로) · `restore-capture-after-mode.bat` |
| `5b150a3` | APK `releases/VoiceStamp_20260701_163737` — fast 시트 위치 배포 · `restore-apk-download-20260701_163737.bat` · Vercel |
| `a072bc4` | 3버튼 시트 **fast 위치만**·정밀 GPS 백그라운드 · `restore-location-fast-sheet.bat` |
| `5f63f07` | APK `releases/VoiceStamp_20260701_160259` — 위치 워밍업 배포 · `restore-apk-download-20260701_160259.bat` · Vercel |
| `0f53afe` | 카메라 **위치 워밍업**·lastKnown GPS 우선·촬영 시트 장소 · `restore-location-warmup.bat` |
| `9e1821c` | APK `releases/VoiceStamp_20260701_153110` — 저장 미리보기 배포 · `restore-apk-download-20260701_153110.bat` · Vercel |
| `a7e7504` | 저장 모달 **즉시 미리보기**·설정 APK 파일명 · `restore-save-preview-fast.bat` |
| `ff22c24` | APK `releases/VoiceStamp_20260701_145618` — 학교 fast path 배포 · `restore-apk-download-20260701_145618.bat` · Vercel |
| `2b830ba` | prefetch **중복 생략**·학교 DB 우선 fast path · `restore-location-prefetch-school.bat` |
| `9d0b85d` | PRD·PROJECT·PLAN·README 문서 동기화 (`4b6834d` 기준) |

> **07-01 저녁 권장 APK:** `releases/VoiceStamp_20260701_230340.apk` (`376368b`). **현재 전체 권장:** `162433` (07-03).

### 2026-06-27

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`4b6834d` 기준) |
| `4b6834d` | `restore-landing-share.bat`에 `license.html` 복원 추가 |
| `800971a` | 랜딩 **QR·Web Share** — qrcodejs MIT (`public/vendor/`) · `restore-landing-share.bat` · Vercel |
| `547b693` | APK `releases/VoiceStamp_20260627_092959` — 시스템 카메라 **busy 오버레이 깜빡임 수정** · `restore-apk-download-20260627_092959.bat` · Vercel |
| `547b693` | `CameraScreen` — `AppState` background 시 `cameraBusy` 해제 · `restore-camera-busy-overlay.bat` |
| `fa5b7ac` | PRD·PROJECT·PLAN·README 문서 동기화 (`1940314` 기준) |

> **권장 APK:** `releases/VoiceStamp_20260627_092959.apk` (`547b693`). 랜딩·`/info` 다운로드 링크·QR 공유 동기화됨.

### 2026-06-26

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`1940314` 기준) |
| `1940314` | APK `releases/VoiceStamp_20260626_233248` — 음성 **수동 커서** 배포 · `restore-apk-download-20260626-233248.bat` · Vercel |
| `250a97d` | 음성 **수동 커서** 위치 존중 (`prepareSpeechTarget`) · `restore-speech-cursor-respect.bat` |
| `480e01f` | APK `releases/VoiceStamp_20260626_231436` — **층→장소** 배포 · `restore-apk-download-20260626-231436.bat` · Vercel |
| `86a2637` | **층 칩→장소** 표기·수정 모달 입력 안정화 · `restore-floor-on-place.bat` |
| `26e8975` | APK `releases/VoiceStamp_20260626_225833` — 학교 반경 200m 배포 · `restore-apk-download-20260626-225833.bat` · Vercel |
| `a546968` | 학교·POI 반경 **300m→200m** · `restore-school-radius-200.bat` |
| `bdf4376` | APK `releases/VoiceStamp_20260626_194421` — **위치 조회 끔** 배포 · `restore-apk-download-20260626-194421.bat` · Vercel |
| `ab0a015` | 설정 **위치 조회 끔** (`location_mode`) · `restore-location-off.bat` |
| `89178c5` | PRD·PROJECT·PLAN·README 문서 동기화 (`6f95aa8` 기준) |
| `6f95aa8` | APK `releases/VoiceStamp_20260626_184823` — 촬영 후 3버튼 눌림·리플 배포 · `restore-apk-download-20260626-184823.bat` · Vercel |
| `a780b27` | **촬영 후 3버튼** 연속 촬영·저장·다시 촬영 — **눌림 배경색·Android 리플** (`CaptureActionSheet`) · `restore-capture-button-press.bat` |
| `f279e26` | PRD·PROJECT·PLAN·README 문서 동기화 (`fb0363b` 기준) |
| `fb0363b` | APK `releases/VoiceStamp_20260626_172205` — **도로명+POI 근처** (`kakaoLocal.ts`) · `restore-place-road-poi.bat` §117 · Vercel |
| `0b5c1b8` | 음성 **끝 공백·커서** (장소·제목·메모) · `restore-speech-end-gap.bat` §116 |
| `b06310a` | **장소** 필드 마이크 · `restore-place-speech.bat` §115 |
| `622398d` | 랜딩 **앱 정보** 링크 제거 · `restore-landing-no-info-link.bat` |
| `e79a4ac` | 랜딩 **사진 이용 책임** 안내 · `restore-landing-photo-notice.bat` |
| `467059d` | 랜딩 **웹 테스트** 안내 패널 제거 · `restore-landing-no-webtest-box.bat` |
| `0869e93` | **ML Kit** 장면 키워드 되돌림 · APK `152305` |
| `43d1f13` | ML Kit 장면 키워드 메모 초안 (시도) · `restore-mlkit-scene.bat` |
| `565c089` | 마이크 `aborted` 무시·`start` 안정화 |
| `62d9ab7` | 마이크 silence 옵션 제거·`end` 처리 |
| `ff6fee6` | Android 음성 silence 타임아웃 +1s |
| `3037ffe` | APK `134226` 배포 링크 갱신 |
| `e330e7e` | **`place_label`** 별도 장소 필드 · `restore-place-label.bat` |

> **권장 APK:** `releases/VoiceStamp_20260626_233248.apk` (`1940314`). (이후 **`092959`** 권장 — §2026-06-27 참고)

### 2026-06-25

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`847ea63` 기준) |
| `847ea63` | APK `releases/VoiceStamp_20260625_171805` — 캡션 **EXIF** 복사 · `restore-caption-exif.bat` · Vercel |
| `44997be` | APK `165551` — **DISPLAY_NAME** 한글 네이티브 · `voicestamp-gallery` · `restore-gallery-display-name.bat` |
| `143a140` | 갤러리 한글 파일명·`_orig` · `restore-gallery-filename.bat` (APK `161125`, 갤러리 경로 이슈) |
| `511a67c` | **도로·지번·POI** 위치 fallback · APK `100743` · `restore-road-place-fallback.bat` |
| `f50a2fb` | 랜딩 푸터 저작권 **Lee Hyung Woo** · Vercel |
| `cf4c226` | 문서 동기화 (`608357d` 기준) |
| `608357d` | CountAPI 중단 대응 · `privacy.html` |
| `4b71431` | 랜딩 **방문자 집계** · `restore-visitor-counter.bat` §112 |

> **권장 APK:** `releases/VoiceStamp_20260625_171805.apk` (`847ea63`). 랜딩·`/info` 다운로드 링크 동기화됨.

### 2026-06-24

| 커밋 | 내용 |
|------|------|
| `edda87d` | PRD·PROJECT·PLAN·README 문서 동기화 (`64aa037` 기준) |
| `64aa037` | APK `releases/VoiceStamp_20260624_094846` — 휴지통 비우기 후 **완료→목록** · `← 목록` 제거 · `restore-trash-empty-back.bat` |
| `c5cbeec` | APK `VoiceStamp_20260624_093448` —보내기 하단바 **Android 31px** · `restore-export-bottom-lift.bat` |
| `2fb6e11` | APK `releases/VoiceStamp_20260624_092411` — 랜딩 링크 갱신 |
| `ecb3fe1` | 목록 선택 **보내기 하단바**·헤더 축소 · `restore-list-export-bottom-bar.bat` |
| `e11779c` | APK `releases/VoiceStamp_20260624_085417` — 랜딩 링크 갱신 |
| `64d6728` | **휴지통 비우기** 설정→휴지통 화면 · `restore-trash-empty-in-trash.bat` |

### 2026-06-23

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`e6bb868` 기준) |
| `e6bb868` | 랜딩 **개인정보·APK 권장** 안내 패널 · Vercel 배포 · `restore-landing-privacy.bat` |
| `0ab0f93` | APK `VoiceStamp_20260623_164337` — `scripts/post-export-web-layout.mjs` (`dist/index.html`↔`dist/app/`) · `restore-web-root-layout.bat` |
| `0c7e2dd` | 웹 **`/`** `landing.html` · **`/app`** Expo 앱 · `vercel.json` rewrite · `restore-root-landing.bat` |
| `4745255` | 웹 설정 **휴지통 비우기** `confirmAlert` · `restore-web-empty-trash-confirm.bat` |
| `fcbf747` | 웹 **휴지통 이동** `confirmAlert` (`src/utils/confirmAlert.ts`) · `restore-web-trash-confirm.bat` |
| `a89e166` | APK `VoiceStamp_20260623_132828` — 카메라 홈 스플래시 **flex 확대** · `restore-camera-home-splash-size.bat` |

### 2026-06-22

| 커밋 | 내용 |
|------|------|
| `dd09b59` | PRD·PROJECT·PLAN·README 문서 동기화 (`b5922eb` 기준) |
| `4f20bca` | GitHub `releases/VoiceStamp_20260622_094203.apk` — GPS 프리페치·연속 인앱 카메라 |
| `e971934` | 연속 촬영 **인앱 CameraView** 옵션 · `restore-continuous-in-app-camera.bat` |
| `f5f1592` | 촬영 확인 시트 열림 중 **GPS 프리페치** · `restore-capture-location-prefetch.bat` |
| `b5922eb` | APK `VoiceStamp_20260622_000517` — **연속 촬영** 직전 **좌표·장소명 재사용** · `restore-quick-capture-location.bat` §111 |

### 2026-06-21

| 커밋 | 내용 |
|------|------|
| `ec4930e` | APK `VoiceStamp_20260621_234030` — 촬영 확인 후 **3버튼** (`CaptureActionSheet`) · 설정 연속 촬영 토글 **제거** · `restore-capture-action-sheet.bat` §110 |
| `b46c9d3` | *(대체됨)* 설정 **연속 촬영** 토글 — `restore-continuous-capture.bat` §109 |
| `3ecb4f4` | APK `VoiceStamp_20260621_125741` — **좌표 표기 없음=숨김** · `restore-coords-off-hide.bat` §108 |
| `89b92da` | GitHub `releases/VoiceStamp_20260620_234924.apk` 업로드 |

### 2026-06-20

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`eaa17e4` 기준) |
| `eaa17e4` | APK `VoiceStamp_20260620_234924` — 저장 목록 **제목·메모 검색** (`stampListSearch.ts`, `StampListScreen`) · `restore-list-search.bat` |
| `88671c1` | APK `VoiceStamp_20260620_171910` — **`scripts/build-schools-db.mjs`** → `assets/schools.sqlite` · JSON seed 제거(부팅 블로킹 해소) · `restore-schools-sqlite.bat` |
| `55c33df` | APK `VoiceStamp_20260620_165718` — **로컬 학교 DB** (공공데이터 CSV→JSON, `schoolLookup`+카카오 fallback) — **부팅 멈춤** |

### 2026-06-19

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`2a5b75b` 기준) |
| `2a5b75b` | APK `VoiceStamp_20260619_101343` — **앱 내 OSS 라이선스**·`open_source_licenses.json`·`LICENSE-NOTICE.md`·LEG-06 · Vercel 배포 |
| `3caf3f0` | PRD·PROJECT·PLAN·README 문서 동기화 (`7b6b0c1` 기준) |

### 2026-06-17

| 커밋 | 내용 |
|------|------|
| (본 문서) | PRD·PROJECT·PLAN·README 문서 동기화 (`7b6b0c1` 기준) |
| `7b6b0c1` | APK `VoiceStamp_20260617_184121` — **학교 200m 이내 학교명**, 그 외 **건물명→도로명** (`kakaoLocal.ts`) |
| `5699d9c` | **Revert** 위치 표시 3모드 (`08c132a`) — `placeLabelMode.ts` 삭제 |
| `24e4b5e` | **Revert** 위치 속도 개선 (`c612e69`) — GPS 6초·단일 `getCurrentLocationSnapshot` 복구 |
| `3af9203` | APK `VoiceStamp_20260617_181630` — `StampSavePreview` `isThumbnail` 선언 순서 (웹·앱 저장 모달 흰 화면) |
| `c612e69` | *(되돌림됨)* 위치 fast snapshot·GPS 3초·카카오 5초 타임아웃 — APK `174312` |
| `08c132a` | *(되돌림됨)* 위치 표시 3모드 (교육/공공/일반)·설정 UI — APK `172752` |
| `4033f68` | 설정 뒤로가기 아이콘 **1.3배 (83px)** |
| `cd4a4e8` | 설정 뒤로가기 아이콘 확대·시스템 내비 위로 배치 |
| `8c603f2` | 설정 뒤로가기 아이콘 왼쪽 정렬 |
| `8a9357b` | 설정 상단 「← 카메라」 텍스트 → **하단 뒤로가기 이미지** (`back-icon.png`) |
| `5e2f4f4` | PRD·PROJECT·PLAN·README 문서 동기화 (`3e6a90d` 기준) |
| `3e6a90d` | APK `VoiceStamp_20260617_131932` — 기관명·하단 문구 **워터마크 한 바** (`restore-overlay-watermark-layout.bat`) |
| `60a9754` | APK `VoiceStamp_20260617_130651` — 워터마크 **파스텔** 팔레트 (`restore-watermark-pastel.bat`) |
| `35bdba6` | APK `VoiceStamp_20260617_113216` — 워터마크 **10색 칩** (`restore-watermark-palette.bat`) |
| `78fd3e6` | APK `VoiceStamp_20260617_111707` — **기관명·하단 문구** 오버레이 (`restore-overlay-text.bat`) |
| `792df0c` | APK `VoiceStamp_20260617_104040` — 보라 VS 아이콘 safe zone (`restore-icon-safezone.bat`) |
| `b2d5456` | APK `VoiceStamp_20260617_102024` — 보라 VS 마이크 앱 아이콘 |
| `24d8fac` | APK `VoiceStamp_20260617_092917` — `/report` JPEG 글자 크기 (`restore-report-textscale.bat`) |
| `b9edc0e` | APK `VoiceStamp_20260617_091820` — `/report` 클라이언트 JPEG (`restore-report-watermark.bat`) |
| `6c0789a` | PRD·PROJECT·PLAN·README 문서 동기화 (`87c7e15` 기준) |
| `87c7e15` | APK `VoiceStamp_20260617_001635` — 워터마크 **흰색 반투명**·빨간 세로줄 제거 (`restore-watermark-solid-light.bat` §107) |
| `534c9f7` | APK `VoiceStamp_20260617_000721` — 워터마크 스타일(빨간 세로줄) (`restore-watermark-style.bat` §106) |

### 2026-06-16

| 커밋 | 내용 |
|------|------|
| `881e9d0` | PRD·PROJECT·PLAN·README 문서 동기화 (`7e453ea` 기준) |
| `7e453ea` | APK `VoiceStamp_20260616_173518` — 목록 **촬영 캡슐** (`capture.png`) |
| `0d7e72d` | 목록 **갤러리 캡슐** (`gallery.png`) (`restore-list-gallery-pill.bat`) |
| `72ccc32` | 갤러리 아이콘+「갤러리」 (`restore-list-gallery-button.bat`) |
| `9ceb325` | 첨부 아이콘 28px 꽉 참 (`restore-list-attach-icon-full.bat`) |
| `109bfa3` | 하단바 31px 상향 (`restore-list-bottom-lift.bat`) |
| `285f2d0` | 문서 동기화 (`7c127aa` 기준) |
| `7c127aa` | 목록 UI: 마이크+제목 헤더, ⋮ 메뉴, 전체 N개, 하단 첨부·촬영, 카드 스타일 |
| `f110256` | 목록 「앨범」→ **첨부(클립) 아이콘** (`attach-icon.png`) |
| `f74012f` | GitHub APK `VoiceStamp_20260616_082006` |
| `3fca65b` | 목록 뒤로가기 텍스트 → **camera-back 아이콘** |
| `ce59962` | GitHub APK `VoiceStamp_20260616_081011` |
| `7bf21fc` | 카메라 홈: `camera-home.png` 스플래시·중앙 촬영·하단 목록/설정 아이콘 |
| `c8221ca` | GitHub APK `VoiceStamp_20260616_075840` |
| `ae0695f` | 카메라 설정 **톱니 PNG** (`settings-icon.png`) |

### 2026-06-15

| 커밋 | 내용 |
|------|------|
| `2fa772c` | GitHub APK `VoiceStamp_20260615_233456` |
| `027c6fa` | 카메라 설정 버튼 아이콘 → **텍스트** 되돌림 |
| `05392ee` | GitHub APK `VoiceStamp_20260615_232645` |
| `d8b5c98` | 카메라 홈 검은 배경 중앙 정렬 (투명 PNG 느낌) |
| `47756ce` | GitHub APK `VoiceStamp_20260615_231718` |
| `338d919` | 카메라 런처 검은 화면 → **camera-home** 스플래시 |
| `e5dad56` | GitHub APK `VoiceStamp_20260615_230611` |
| `8d282e6` | 카메라 설정 대형 톱니 아이콘 (후속 되돌림) |
| `c6aff3c` | GitHub APK `VoiceStamp_20260615_153600` |
| `9ab30ee` | HWPX 템플릿 APK `expo-asset` 로드 |
| `d5cdd26` | HWPX 한컴 호환 템플릿 렌더링 |
| `c112cb0` | HWPX BinData 이미지 확장자 jpeg→jpg |
| `503e81a` | **HWPX** 내보내기 추가 |
| `946360e` | XLSX 썸네일 **A열** 배치 |
| `84d13a7` | 웹 `/report` 썸네일 라이트박스 확대 |
| `6737f13` | **프로젝트 ZIP**·**XLSX** 선택 내보내기 |
| `23a8391` | GitHub APK `VoiceStamp_20260614_114256` |

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
49e9c70 Publish VoiceStamp_20260730_114713.apk with caption QR MVP.
9b9175c Add caption QR from confirmed http(s) URL (MVP).
a67c68c Map camera home default to mainint (black) and style2 to mainint1 (white); publish VoiceStamp_20260728_135843.apk.
3ebb51f Publish VoiceStamp_20260725_114802.apk with ML Kit scene keywords (AI-ML-01).
0897335 Publish VoiceStamp_20260725_104328.apk with OCR title/memo draft.
94950ff Publish VoiceStamp_20260725_101238.apk with privacy manual regions.
8bad078 Fix washed-out caption image export via opaque native JPEG; publish VoiceStamp_20260723_185321.apk.
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
| [../RESTORE.md](../RESTORE.md) | 되돌리기 절차 (§1~140) |
| [../BUILD-APK.md](../BUILD-APK.md) | APK 빌드 |
| [../README.md](../README.md) | 프로젝트 루트 소개 |
| [../LICENSE](../LICENSE) | MIT 라이선스 |
| [../AGENTS.md](../AGENTS.md) | Expo SDK 56 문서 참조 규칙 |
