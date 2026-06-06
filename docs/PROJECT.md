# VoiceStamp 프로젝트 현황

문서 작성일: **2026-06-07**  
최신 커밋 기준: `9f4a525` (main)

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
│   │                       # SettingsScreen, TrashScreen, VoiceInputField
│   ├── screens/            # MainScreen
│   ├── services/           # saveStamp, fileService, exportPdf, settingsService,
│   │                       # kakaoLocal, locationService, pdfImageForExport,
│   │                       # galleryService, stampTrash, stampRepository
│   ├── hooks/              # useSpeechInput
│   ├── db/                 # database, schema
│   ├── types/              # stamp
│   └── utils/              # id, cameraPictureSize
├── android/                # 네이티브 Android (로컬 빌드용)
├── docs/                   # PRD, 본 문서, 문서 목록
├── build-apk.bat           # Release APK 빌드
├── RESTORE.md              # 기능별 되돌리기 (§8~36)
├── BUILD-APK.md            # APK 빌드 가이드
├── vercel.json             # Vercel 웹 설정
└── .env                    # EXPO_PUBLIC_KAKAO_REST_KEY (git 제외)
```

---

## 3. 화면 구성

| 화면 | 파일 | 설명 |
|------|------|------|
| 카메라 | `CameraScreen.tsx` | 촬영, 설정·목록 버튼 |
| 저장 모달 | `StampSaveModal.tsx` | 제목·메모·음성·저장, 위치 로딩, 키보드 스크롤 |
| 목록 | `StampListScreen.tsx` | 목록·선택·PDF·수정·휴지통·⚙ 설정 |
| 휴지통 | `TrashScreen.tsx` | 터치 복원 |
| 설정 | `SettingsScreen.tsx` | 폴더·PDF 옵션·휴지통 비우기 |
| 메인 | `MainScreen.tsx` | camera / list / settings / trash 전환 |

### 3.1 목록 화면 UI (현재)

| 영역 | 요소 |
|------|------|
| 상단 | 「← 카메라」(큰 버튼) |
| 헤더 | 저장 목록 · 휴지통 · 선택/취소 |
| 본문 | 스탬프 카드 (600px+ 2열) |
| 하단 | 중앙 ⚙ → 설정 |

---

## 4. 기능별 구현 이력

개발 원칙: **최소 수정**, **기능별 백업(`src.pre-*`)**, **`restore-*.bat`**

| # | 기능 | 커밋 (요약) | 되돌리기 |
|---|------|-------------|----------|
| 1 | 초기 앱 (카메라·음성·스탬프·APK) | `e4fe0d3` | RESTORE §1~6 |
| 2 | 커스텀 앱 아이콘 | (세션 내) | `restore-icon.bat` §8 |
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
| expo-image-manipulator | PDF 이미지 압축 |
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
| `VoiceStamp_20260607_004429.apk` | 목록 ⚙ 설정 푸터 |
| `VoiceStamp_20260607_003539.apk` | ← 카메라 버튼 확대 |
| `VoiceStamp_20260607_003030.apk` | PDF 원본 HTML 상한 |

---

## 8. 서비스 모듈

| 모듈 | 역할 |
|------|------|
| `saveStamp.ts` | 저장·수정 오케스트레이션, 갤러리 저장 호출 |
| `fileService.ts` | 이미지 persist, 제목 포맷, URI resolve, 삭제 |
| `stampRepository.ts` | SQLite CRUD, soft delete 필터 |
| `stampTrash.ts` | 휴지통 이동·복원·비우기 |
| `galleryService.ts` | 갤러리 VoiceStamp 앨범 저장 |
| `settingsService.ts` | 앱 설정 get/set |
| `exportPdf.ts` | PDF HTML·생성·저장·공유 |
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

**원본** PDF 프리셋: HTML 임베드 최대 2400px, JPEG 92% (디스크 원본 파일은 미변경).

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
9f4a525 Show centered gear icon for settings on the stamp list footer.
a49a374 Enlarge the stamp list back-to-camera button for easier tapping.
b77c296 Cap PDF original preset size to avoid String is too long on large photos.
4e8675d Save stamp photos to the device gallery in a VoiceStamp album.
50cd4bf Add trash bin with soft delete, restore screen, and empty trash in settings.
c52a22e Use cached GPS with timeout fallback for faster stamp location titles.
b96658e Keep stamp save modal fields visible when the keyboard opens.
02b0cb1 Show location loading hint while fetching place for stamp title.
8a9c7ce Show stamp title date-time immediately when save modal opens.
4e8d3f2 Add PDF image quality setting with original, standard, and compressed presets.
2309d62 Use the device largest picture size and max JPEG quality for captures.
9f8ffc4 Add building name to stamp title when Kakao address API provides it.
200d49b Ignore .env in git to keep Kakao API keys out of the repository.
2ec2768 Add Kakao reverse geocoding for auto location in stamp titles.
292b61f Fix PDF save failing when copyAsync targets the same file path.
b18babc Add settings button on camera screen for easier access.
82df9cd Save stamp photos with title-based filenames and date-time default.
57c6fb0 Add PDF photos-per-page setting and dated APK output.
3213851 Add responsive stamp list, speech append, and fix build-apk.bat.
8d8e41c Add long-press to enter stamp selection mode in list.
b5faa2f Add configurable internal photo save folder in settings.
1224df8 Add editable PDF filename defaulting to first stamp title.
88da589 Fix web photo save when documentDirectory is unavailable.
a78d347 Add PDF export and Vercel web deploy for browser testing.
e4fe0d3 Add VoiceStamp app with camera capture, voice memo stamps, and APK tooling.
0b446a2 Initial commit
```

---

## 13. 관련 문서

| 문서 | 설명 |
|------|------|
| [README.md](./README.md) | docs 폴더 문서 목록 |
| [PRD.md](./PRD.md) | 제품 요구사항 정의서 |
| [../RESTORE.md](../RESTORE.md) | 되돌리기 절차 (§8~36) |
| [../BUILD-APK.md](../BUILD-APK.md) | APK 빌드 |
| [../README.md](../README.md) | 프로젝트 루트 소개 |
| [../AGENTS.md](../AGENTS.md) | Expo SDK 56 문서 참조 규칙 |
