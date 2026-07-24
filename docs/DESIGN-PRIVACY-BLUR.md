# VoiceStamp 개인정보 가리기 설계 (AI-ML-02)

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2026-07-24 |
| 상태 | ✅ **MVP 구현** (2026-07-24) |
| 기능 ID | **AI-ML-02** |
| 관련 문서 | [PRD.md](./PRD.md) §10.1, [PLAN.md](./PLAN.md) §4, [PRIVACY.md](./PRIVACY.md), [LICENSE-NOTICE.md](./LICENSE-NOTICE.md), [DESIGN-ML-KIT-SCENE-LABEL.md](./DESIGN-ML-KIT-SCENE-LABEL.md) |
| 기준 커밋 | `8254bfd` (main, 설계 시점) |

> **범위:** 촬영·저장 화면에서 **기기 내(on-device)** Google ML Kit으로 얼굴·숫자(텍스트) 영역을 찾아 **블러/모자이크**로 가린 뒤 저장.  
> **저작권 안전 원칙:** ML Kit Terms 준수 + 자체 Bitmap 블러만 사용. **생성형 인페인팅(지우기) 없음.** GPL 계열 미도입.  
> **소스 코드 변경 없음** — 본 문서는 MVP 구현 가이드만 정의한다. 구현은 별도 Agent 작업에서 §8·§11을 따른다.

---

## 1. 배경·목표

### 1.1 문제

- 현장·점검 사진에 **사람 얼굴**, **전화번호·호수·날짜 등 숫자**가 포함되는 경우가 많다.
- 공유·PDF·갤러리 백업 전에 가리고 싶지만, 클라우드 Vision은 VoiceStamp 개인정보 정책(서버 미전송)과 충돌한다.
- 일반 갤러리 앱의 AI 가리기는 **타사 API로 호출 불가**.

### 1.2 목표

| 목표 | 설명 |
|------|------|
| G1 | **오프라인·온디바이스** 감지·블러 — 사진을 서버로 보내지 않음 |
| G2 | **얼굴 + 숫자 포함 텍스트** 영역을 찾아 블러/모자이크 |
| G3 | 사용자가 **확인 후 적용** (자동 덮어쓰기 금지) |
| G4 | 설정에서 **켜기/끄기** — 기본값 **끔** |
| G5 | `voicestamp-gallery`와 동일한 **로컬 Expo 모듈** 패턴 |
| G6 | 되돌리기 — `src.pre-privacy-blur/` + `restore-privacy-blur.bat` + `RESTORE.md` §186 |
| G7 | 저작권·라이선스 — ML Kit + 자체 블러만, OSS 고지 갱신 |

### 1.3 비목표 (Out of Scope · MVP)

| 항목 | 이유 |
|------|------|
| 생성형 인페인팅(“티 없이 지우기”) | 별도 모델·약관·용량; 저작권·정책 리스크↑ |
| 전신 Person Segmentation | APK·복잡도↑ → 2차 |
| 수동 브러시 블러 | UX 보완 → 2차 |
| iOS Vision / Core ML | 1차는 **Android APK** 만 |
| 웹 브라우저 | ML Kit 미지원 → **버튼 숨김 / no-op** |
| 연속 촬영 `quickCaptureSave` 자동 가리기 | 확인 UI 없음 → 보류 |
| 신원 식별·얼굴 매칭 DB | 마스킹만; 생체 식별 목적 아님 |
| AI-ML-01 장면 라벨과 동시 재도입 필수 | 모듈은 **공유 가능**하나 본 기능 ID는 독립 |

### 1.4 AI-ML-01과의 관계

| | AI-ML-01 장면 라벨 | AI-ML-02 개인정보 가리기 |
|--|-------------------|-------------------------|
| ML Kit API | Image Labeling | Face Detection + Text Recognition |
| 결과 | 메모 키워드 문자열 | 블러된 이미지 URI |
| Face Detection | 설계상 제외(라벨 용도) | **채택**(마스킹 용도) |
| 모듈 | `voicestamp-mlkit` (설계·되돌림 이력) | **동일 모듈에 API 추가** 권장 |

구현 시 `modules/voicestamp-mlkit`를 신설하거나, 기존 설계 골격에 `detectPrivacyRegions` / `applyBlurRegions`를 추가한다. Image Labeling은 본 MVP에 **필수가 아님**.

---

## 2. 사용자 시나리오

### 2.1 일반 촬영 (저장 모달)

```
촬영 완료 → StampSaveModal
  ├─ (기존) 제목·장소·GPS·메모
  ├─ (기존) 미리보기
  └─ (신규) 설정 ON + Android 이면 [개인정보 가리기] 버튼
        → PrivacyBlurModal
             1) 자동 감지 (얼굴·숫자 텍스트)
             2) 박스 오버레이 + 개별 on/off
             3) 강도 선택 → [적용]
        → photoUri를 블러 결과로 교체 → StampSaveModal 복귀
  → 저장 (기존 saveStamp)
```

### 2.2 수정 모달 (`isEdit`)

- MVP: **동일 버튼 허용** (이미 저장된 사진도 가리기 가능).
- 적용 후 `photoUri`만 바꾸고 저장 시 기존 `updateStamp` / crop 경로 재사용.

### 2.3 설정 OFF / 비 Android

- 버튼 **미표시**. 기존 UX와 100% 동일.

### 2.4 실패

- 감지 실패·타임아웃·무GMS: 모달 내 짧은 문구 「감지할 수 없습니다」 + [닫기].
- 저장 흐름은 **막지 않음** (가리기 없이도 저장 가능).

---

## 3. 화면 구성 (MVP)

### 3.1 설정 — `SettingsScreen`

위치: 「저장 시 갤러리」 근처 (촬영·저장 관련 섹션).

```
개인정보 가리기
[ 사용 안 함 | 사용 ]          ← 기본: 사용 안 함

사진을 폰 안에서만 분석해
얼굴·숫자가 있는 곳을 흐리게 합니다.
서버로 보내지 않습니다. (Android)
```

| 설정 키 | `privacy_blur_enabled` |
|---------|------------------------|
| 타입 | boolean (SQLite `app_settings`) |
| 기본값 | `false` |
| getter/setter | `settingsService.ts` |

**중요:** 설정 ON ≠ 자동 블러. 저장 화면에서 **명시적 탭** 후에만 처리.

### 3.2 저장 모달 — `StampSaveModal` 진입점

미리보기 바로 아래:

```
┌─────────────────────────────┐
│  [사진 미리보기]     🔍      │
└─────────────────────────────┘
  [ 개인정보 가리기 ]     ← privacy_blur_enabled && Android
  (busy) 가리는 중…

제목 / 장소 / 메모 …
```

| 상태 | UI |
|------|-----|
| 설정 OFF / 웹·iOS | 버튼 없음 |
| idle | 「개인정보 가리기」 |
| PrivacyBlurModal 열림 | 하위 모달 |
| 적용 직후 | 미리보기 URI 갱신 |

### 3.3 가리기 모달 — `PrivacyBlurModal` (신규)

전체 화면 `Modal` (저장 모달 위).

```
┌──────────────────────────────────────┐
│ ← 취소              개인정보 가리기   │
├──────────────────────────────────────┤
│                                      │
│   [이미지 + 반투명 박스 오버레이]      │
│    얼굴=파란 테두리 / 숫자=주황        │
│    탭 → 선택 해제(회색·취소선)         │
│                                      │
├──────────────────────────────────────┤
│ 감지: 얼굴 N · 숫자 M                 │
│ ☑ 얼굴 가리기   ☑ 숫자 가리기         │
│ 강도  (약) (중●) (강)                 │
│                                      │
│ [다시 감지]              [적용]       │
└──────────────────────────────────────┘
```

| 컨트롤 | 동작 |
|--------|------|
| 취소 | 원본 유지, 모달 닫기 |
| 다시 감지 | `detectPrivacyRegions` 재실행 |
| 얼굴/숫자 체크 | 해당 타입 전체 on/off |
| 박스 탭 | 개별 region `enabled` 토글 |
| 강도 | `light` / `medium` / `strong` → 네이티브 blur radius·모자이크 블록 |
| 적용 | `applyBlurRegions` → 새 URI `onApplied(uri)` → 닫기 |

### 3.4 MVP에서 제외하는 UI

- 원본 복원 버튼 (2차: `originalPhotoUri` ref)
- 브러시 / 올가미
- 연속 촬영 중 배너

---

## 4. 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  StampSaveModal                                                   │
│    [개인정보 가리기] → setPrivacyModalOpen(true)                 │
│    onApplied(uri) → setPhotoUri(uri) (+ previewThumb 재생성)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  PrivacyBlurModal                                                 │
│    mount → detectPrivacyRegions(uri)                              │
│    적용 → applyBlurToImage(uri, regions, strength)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/services/privacyBlurService.ts                               │
│    Platform.OS !== 'android' → null / []                          │
│    설정 게이트는 UI에서 (서비스는 순수 API)                        │
│    Promise.race 타임아웃 15s (detect) / 20s (blur)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  modules/voicestamp-mlkit/                                        │
│    detectPrivacyRegions(localUri)                                 │
│    applyBlurRegions(localUri, regionsJson, strength)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Android ML Kit                                                   │
│    FaceDetection.getClient(...)                                   │
│    TextRecognition.getClient(한국어)                              │
│  + 자체 Canvas/Bitmap 블러·모자이크 → cache JPEG                  │
└─────────────────────────────────────────────────────────────────┘
```

**원칙**

- JS: 플랫폼 분기·타임아웃·region 필터(숫자 정규식)·UI 상태.
- Native: ML 추론 + 픽셀 블러 **한 곳**.
- DB 스키마 변경 **없음** (설정 키만 `app_settings`).
- `saveStamp` / `persistImage` **시그니처 변경 없음** — 최종 `photoUri`만 바뀜.

---

## 5. ML Kit·블러 선택 (저작권·라이선스)

### 5.1 API

| API | Maven (구현 시 버전 고정) | 용도 |
|-----|---------------------------|------|
| Face Detection | `com.google.mlkit:face-detection` (bundled) 또는 play-services-mlkit-face-detection | 얼굴 박스 |
| Text Recognition | `com.google.mlkit:text-recognition-korean` 또는 `text-recognition` | 텍스트 박스+문자열 |
| (블러) | **자체 코드** (Android `Bitmap` + 스택 블러/모자이크) | 영역 가리기 |

권장: **bundled** 아티팩트(APK에 모델 포함)로 무GMS 일부 환경 완화. 용량 증가를 감수.  
대안: Play services 다운로드형 — APK 작음, 첫 실행·중국 ROM 리스크.

### 5.2 숫자 필터 (JS 또는 Native)

OCR 결과 `text`에 대해:

```typescript
function isNumericSensitive(text: string): boolean {
  return /\d/.test(text);
}
```

- 숫자가 **하나라도** 있으면 후보 (전화번호, 호수, 날짜, 금액).
- 「숫자만」 픽셀 단위 분리는 MVP 비목표 — **텍스트 블록 전체** 블러.

### 5.3 블러 강도

| strength | 권장 구현 |
|----------|-----------|
| `light` | 모자이크 블록 ~12px 또는 blur radius 소 |
| `medium` (기본) | ~24px / 중 |
| `strong` | ~40px / 강 + 약간 확장된 박스(패딩 8~12%) |

얼굴 박스는 감지 박스를 **10~15% inflate** 후 블러 (턱·머리 가장자리 누수 완화).

### 5.4 라이선스·고지

| 구성 | 라이선스 | 고지 |
|------|----------|------|
| ML Kit Face / Text | [ML Kit Terms](https://developers.google.com/ml-kit/terms) + OSS 구성요소 | `open_source_licenses.json` 재생성 |
| `voicestamp-mlkit` 자체 코드 | MIT | 앱과 동일 |
| 생성형 모델 | **사용 안 함** | — |

- **GPL 신규 도입 없음** — [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) 유지.
- 구현 후: `gradlew app:dependencies` → `generate-open-source-licenses.mjs`.
- `LICENSE-NOTICE.md` §5 제3자 표에 「ML Kit (온디바이스 얼굴·텍스트)」 한 줄 추가.

### 5.5 개인정보 ([PRIVACY.md](./PRIVACY.md) — 구현 시 추가 문구)

> **선택 기능(Android):** 「개인정보 가리기」를 켜면 촬영 사진을 **기기 안에서만** 분석해 얼굴·숫자가 포함된 글자 영역을 흐리게 처리합니다. 사진은 VoiceStamp 서버로 전송되지 않습니다. Google ML Kit 온디바이스 API를 사용하며, 모델은 기기/Play 서비스 정책에 따릅니다.

신원 식별·클라우드 업로드 **하지 않음**을 명시.

---

## 6. API 설계

### 6.1 네이티브 `VoicestampMlkitModule`

**expo-module.config.json**

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.voicestampmlkit.VoicestampMlkitModule"]
  }
}
```

**Kotlin AsyncFunction**

| 함수 | 인자 | 반환 |
|------|------|------|
| `detectPrivacyRegions` | `localUri: string` | `{ width, height, regions: Region[] }` |
| `applyBlurRegions` | `localUri`, `regionsJson: string`, `strength: string` | `outputUri: string` |

**Region (JSON)**

```typescript
type PrivacyRegion = {
  id: string;           // "face-0" | "text-1"
  type: 'face' | 'text';
  left: number;         // 원본 이미지 픽셀 좌표
  top: number;
  width: number;
  height: number;
  text?: string;        // OCR일 때만
  enabled?: boolean;    // JS UI 전용; native apply 시 enabled만 전달
};
```

- `localUri`: `file://` 허용, `voicestamp-gallery`와 동일 path 정규화.
- `applyBlurRegions`: `enabled !== false` 인 영역만 처리.
- 출력: `context.cacheDir` / `documentDirectory` 하위 `voicestamp-blur-{ts}.jpg` (JPEG 92~95).
- EXIF Orientation: 가능하면 `bakeExifOrientation`과 같이 **픽셀에 bake** 후 감지·블러 (좌표 불일치 방지). 구현 옵션:
  - A) blur 모듈 내부에서 orientation bake
  - B) JS에서 기존 `bakeExifOrientation` 호출 후 detect (권장: 갤러리 모듈 재사용)

### 6.2 JS `privacyBlurService.ts`

```typescript
export type BlurStrength = 'light' | 'medium' | 'strong';

export async function detectPrivacyRegions(
  imageUri: string,
): Promise<{ width: number; height: number; regions: PrivacyRegion[] } | null>;

export async function applyBlurToImage(
  imageUri: string,
  regions: PrivacyRegion[],
  strength: BlurStrength,
): Promise<string | null>;

/** OCR 영역 중 숫자 포함만 남김 (native가 전부 반환할 경우) */
export function filterNumericTextRegions(regions: PrivacyRegion[]): PrivacyRegion[];
```

- 비 Android: 즉시 `null` / `{ regions: [] }`.
- 타임아웃: detect **15s**, blur **20s** → `null`.
- `filterNumericTextRegions`: native가 모든 텍스트를 줄 때 JS에서 `\d` 필터.

### 6.3 설정 API

```typescript
// settingsService.ts
export async function getPrivacyBlurEnabled(): Promise<boolean>;
export async function setPrivacyBlurEnabled(enabled: boolean): Promise<boolean>;
// KEY: 'privacy_blur_enabled', default false
```

---

## 7. UI·상태 통합

### 7.1 `StampSaveModal` 상태 (추가)

| state | 용도 |
|-------|------|
| `privacyBlurEnabled` | 설정 로드 |
| `privacyModalOpen` | PrivacyBlurModal visible |
| `photoUri` | 기존 — 적용 후 교체 |
| (2차) `originalCaptureUri` | 원본 복원 |

미리보기 썸네일(`previewThumbUri`)은 `photoUri` 변경 시 **기존 썸네일 생성 로직 재사용**.

### 7.2 표시 조건

```
showPrivacyButton =
  Platform.OS === 'android'
  && privacyBlurEnabled
  && !!photoUri
  && !saving
```

### 7.3 `CameraScreen`

- **변경 없음** (모달이 `StampSaveModal`만 사용).
- `CaptureActionSheet` / 연속 촬영 경로 비연동.

### 7.4 좌표 ↔ 화면 오버레이

- 감지 좌표는 **이미지 픽셀** 기준.
- `Image` `onLayout` + `resizeMode: 'contain'` 기준으로 scale/offset 계산해 박스 그리기.
- 기존 크롭/줌 뷰어 좌표 변환 패턴이 있으면 재사용; 없으면 `PrivacyBlurModal` 내 유틸 `mapImageBoxToView`.

---

## 8. 패키지·모듈 구조 (구현 시 추가 파일)

```
modules/voicestamp-mlkit/
  package.json
  expo-module.config.json
  android/build.gradle          # face-detection + text-recognition(-korean)
  android/src/main/java/expo/modules/voicestampmlkit/
    VoicestampMlkitModule.kt
  src/index.ts                  # requireNativeModule + Platform 가드

src/services/
  privacyBlurTypes.ts
  privacyBlurService.ts

src/components/
  PrivacyBlurModal.tsx          # 신규
  StampSaveModal.tsx            # 버튼 + 모달 연결
  SettingsScreen.tsx            # 토글

src/services/settingsService.ts # privacy_blur_enabled

package.json                    # "voicestamp-mlkit": "file:./modules/voicestamp-mlkit"

docs/PRIVACY.md                 # § 선택 기능 단락
docs/LICENSE-NOTICE.md          # ML Kit 한 줄
assets/open_source_licenses.json # 재생성

src.pre-privacy-blur/           # 스냅샷 (구현 직전)
restore-privacy-blur.bat
RESTORE.md                      # §186
```

**건드리지 않는 것 (MVP):** `saveStamp.ts` 시그니처, `schema.ts`, `CameraScreen` 촬영 파이프라인, 웹 전용 분기(버튼 숨김만).

---

## 9. 네이티브 구현 스케치 (가이드 — 아직 코드 없음)

### 9.1 detect (의사코드)

```
fun detectPrivacyRegions(localUri):
  file = materializeLocalFile(localUri)
  image = InputImage.fromFilePath(context, file)
  faces = FaceDetection.getClient(ACCURATE).process(image).await()
  texts = TextRecognition.getClient().process(image).await()
  regions = []
  for (i, face) in faces:
    box = face.boundingBox → region(type=face, id=face-i)
  for (i, block) in texts.textBlocks:
    if block.text matches /\d/:
      box = block.boundingBox → region(type=text, text=block.text, id=text-i)
  return { width: image.width, height: image.height, regions }
```

### 9.2 blur (의사코드)

```
fun applyBlurRegions(localUri, regions, strength):
  bitmap = decode(file)  // mutable copy
  canvas = Canvas(bitmap)
  for region in regions where enabled:
    rect = inflate(region, padding)
    // option A: mosaic
    drawMosaic(canvas, bitmap, rect, blockSize(strength))
    // option B: stack blur on cropped region then draw back
  out = File(cacheDir, "voicestamp-blur-${ts}.jpg")
  compress JPEG 95 → out
  return fileUri(out)
```

성능: 원본이 4000px+이면 detect 전 **긴 변 1280~1600으로 축소본**으로 감지하고, 좌표를 원본 스케일로 환산한 뒤 **원본에 블러** (품질 유지). MVP에서 축소 감지는 **권장**, 필수 아님.

---

## 10. 되돌리기 (RESTORE) — 구현 시

| 항목 | 내용 |
|------|------|
| 스냅샷 | `src.pre-privacy-blur/` — `StampSaveModal.tsx`, `SettingsScreen.tsx`, `settingsService.ts`, `PrivacyBlurModal.tsx`, `privacyBlurService.ts`, `privacyBlurTypes.ts`, `package.json`, `modules/voicestamp-mlkit/` |
| 배치 | `restore-privacy-blur.bat` |
| 문서 | `RESTORE.md` **§186** (현재 마지막 §185 다음) |
| DB | `privacy_blur_enabled` — 롤백 후 미사용 키로 무해 |

---

## 11. MVP 구현 단계 (PDCA) — 코드 작업은 별도 세션

| 단계 | 내용 | 산출 | 본 문서 작업 |
|------|------|------|--------------|
| **Plan** | 본 설계 | `DESIGN-PRIVACY-BLUR.md` | ✅ (2026-07-24) |
| **Do-1** | `voicestamp-mlkit`: detect + applyBlur | Android 빌드 통과 | ❌ 소스 금지 |
| **Do-2** | `privacyBlurService` + types | 수동 호출 테스트 | ❌ |
| **Do-3** | `PrivacyBlurModal` UI | 오버레이·적용 | ❌ |
| **Do-4** | Settings 토글 + StampSaveModal 연결 | E2E 촬영→가리기→저장 | ❌ |
| **Do-5** | PRIVACY·LICENSE·OSS·restore·RESTORE §186 | 컴플라이언스·되돌리기 | ❌ |
| **Check** | 실기기: 인물·간판·문서·야간 | 누락·과도 블러 점검 | — |
| **Act** | 패딩·강도·한글 OCR·리사이즈 | 튜닝 | — |

### 검증 체크리스트 (L1)

- [ ] 설정 OFF → 버튼 없음, 기존과 동일
- [ ] 설정 ON → 저장 모달에 「개인정보 가리기」
- [ ] 얼굴 있는 사진 → 박스 표시 → 적용 후 얼굴 흐림
- [ ] 숫자(전화·호수) 있는 사진 → 해당 텍스트만 후보
- [ ] 숫자 없는 순수 한글 간판 → 숫자 영역 0 (또는 미블러)
- [ ] 개별 박스 탭으로 제외 후 적용
- [ ] 취소 시 원본 유지
- [ ] 웹 빌드 회귀 없음 (버튼 숨김)
- [ ] 갤러리·음성·PDF·워터마크 **회귀 없음**
- [ ] OSS 화면에 ML Kit 관련 항목 표시
- [ ] `restore-privacy-blur.bat`으로 기능 제거 가능

### 수동 테스트 시나리오

| # | 입력 | 기대 |
|---|------|------|
| T1 | 셀카·근거리 얼굴 | face ≥ 1, 적용 후 식별 어려움 |
| T2 | 칠판/문서에 전화번호 | text 영역 블러 |
| T3 | 풍경만 (사람·숫자 없음) | regions 0, 「감지된 항목 없음」 |
| T4 | 비행기 모드 (모델 캐시됨) | 동작 |
| T5 | 수정 모달에서 가리기 후 저장 | 목록·내보내기에 블러본 반영 |

---

## 12. 리스크·완화

| 리스크 | 완화 |
|--------|------|
| 얼굴/OCR 누락 | 확인 UI + 2차 수동 브러시; 과장 광고 금지 |
| 과도한 텍스트 블러 (연도 등) | 개별 박스 off; 숫자 포함만 |
| APK 용량↑ | bundled vs play-services 선택 문서화; Face+OCR만 |
| EXIF 회전 좌표 어긋남 | bakeExifOrientation 선행 |
| 첫 실행 모델 다운로드 | 타임아웃·안내 문구 |
| 저작권 오해 | 생성형 미사용·OSS 고지·PRIVACY 명시 |
| AI-ML-01과 모듈 충돌 | 동일 모듈에 함수 병치; Name `"VoicestampMlkit"` 유지 |

---

## 13. 문서·기능 ID 갱신

### 13.1 본 설계 작성 시 (소스 없음) — 이번 작업

| 문서 | 내용 |
|------|------|
| [DESIGN-PRIVACY-BLUR.md](./DESIGN-PRIVACY-BLUR.md) | 본문 |
| [docs/README.md](./README.md) | 설계 문서 링크 |
| [PRD.md](./PRD.md) §10.1 · 관련 문서 | `AI-ML-02` 후보 |
| [PLAN.md](./PLAN.md) §4 | `AI-ML-02` 대기 |

### 13.2 구현 완료 시

| 문서 | 추가 |
|------|------|
| PRD §3 기능표 | `F-AI-02` ✅ |
| PROJECT.md §4·§7.4 | 커밋·APK·restore |
| PRIVACY.md | §5.5 문구 |
| LICENSE-NOTICE.md | ML Kit 행 |
| RESTORE.md | §186 |
| PLAN §2 | 완료로 이동 |

---

## 14. 요약

| 질문 | 답 |
|------|-----|
| 저작권 문제 없이? | **가능** — ML Kit Terms + 자체 블러, 생성형·GPL 없음 |
| 서버? | **불필요** |
| UX? | 설정 OFF 기본 → 저장 화면에서 **확인 후** 블러 |
| 모듈? | `voicestamp-mlkit` Face + OCR + blur |
| 웹·iOS? | MVP **Android만** |
| 이번 작업 범위? | **설계 문서 + MVP 구현 가이드만** (소스 수정 금지) |

**다음 액션:** 사용자 승인 후 Agent 모드에서 §8·§11 Do-1~Do-5 구현 (`최소수정` 워크플로: 스냅샷·restore·커밋·APK).
