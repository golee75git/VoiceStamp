# VoiceStamp ML Kit 장면 라벨링 설계 (AI-ML-01)

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2026-06-25 |
| 상태 | ✅ **구현됨** (재도입) |
| 기능 ID | **AI-ML-01** |
| 관련 문서 | [PRD.md](./PRD.md) §1.4, [PLAN.md](./PLAN.md) §4, [PRIVACY.md](./PRIVACY.md), [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) |
| 기준 커밋 | `847ea63` (main, 설계 시점) |

> **범위:** 촬영 직후 **기기 내(on-device)** Google ML Kit으로 사진을 분석해 **대략적인 장면 설명(키워드)** 을 메모 초안으로 제안.  
> **소스 코드 변경 없음** — 본 문서는 구현 가이드만 정의한다.

---

## 1. 배경·목표

### 1.1 문제

- 현장·점검·여행 등에서 사진만 찍고 **메모를 비워 둔 채** 저장하는 경우가 많다.
- 제목은 날짜·위치(`formatDefaultStampTitle`)로 자동 채워지지만, **「무엇이 찍혔는지」** 는 사용자가 직접 입력·음성인식해야 한다.
- 갤러리·삼성/구글 사진 앱의 “AI 설명”은 **타사 앱 API로 호출 불가**.

### 1.2 목표

| 목표 | 설명 |
|------|------|
| G1 | **오프라인·온디바이스** 분석 — 사진을 서버로 보내지 않음 (VoiceStamp 개인정보 정책과 일치) |
| G2 | 저장 모달에서 **메모 필드 초안** 자동 제안 (사용자가 수정·음성으로 덮어쓰기 가능) |
| G3 | 설정에서 **켜기/끄기** — 기본값 **끔** (기존 동작 보존) |
| G4 | **최소 수정** — `voicestamp-gallery`와 동일한 로컬 Expo 모듈 패턴 |
| G5 | 되돌리기 — `src.pre-mlkit-scene/` + `restore-mlkit-scene.bat` + `RESTORE.md` § |

### 1.3 비목표 (Out of Scope)

| 항목 | 이유 |
|------|------|
| 자연어 문장 생성 (“이 사진은 교실 앞 풍경입니다”) | ML Kit Image Labeling은 **태그·신뢰도** 수준; 문장형은 클라우드 LLM 영역 |
| iOS Vision / Core ML | PRD 비목표에 가까움; 1차는 **Android APK** 만 |
| 웹 브라우저 | ML Kit 미지원; **no-op 스텁** |
| 연속 촬영 `saveQuickCapture` 자동 메모 (1차) | 모달 없이 저장 → 2차에서 설정 연동 검토 |
| 갤러리·앨범 사진 역분석 | DB 메타 복구 Out of Scope와 동일 선 |
| 클라우드 Vision / Gemini API | 서버 전송·정책 문구 변경 필요 |

---

## 2. 사용자 시나리오

### 2.1 일반 촬영 (저장 모달 있음)

```
촬영 완료 → StampSaveModal 표시
  ├─ (기존) 제목: 날짜·위치 비동기 채움
  ├─ (기존) GPS·장소 라벨
  └─ (신규) 설정 ON 시 백그라운드 ML Kit 분석
        → 완료 시 메모에 초안 삽입 (예: 「건물, 하늘, 야외」)
        → 사용자가 memo 수정·음성 입력 시 덮어쓰기 (titleTouched와 유사하게 memoTouchedRef)
```

### 2.2 분석 중 UI

- 메모 필드 위 또는 아래 **짧은 상태**: `장면 분석 중…` (1~3초 내외 목표)
- 실패·타임아웃: **무음 실패** (토스트 없음) — 저장 흐름 방해 금지
- 결과 없음(빈 라벨): 메모 변경 없음

### 2.3 설정

| 설정 키 (안) | `mlkit_scene_label_enabled` |
|--------------|----------------------------|
| UI 위치 | `SettingsScreen` — 「촬영·저장」 섹션, 갤러리 저장 모드 근처 |
| 라벨 | 「촬영 후 장면 키워드 자동 입력」 |
| 부가 설명 | 「사진을 폰 안에서만 분석해 메모에 키워드를 넣습니다. 서버로 보내지 않습니다.」 |
| 기본값 | `false` |

---

## 3. 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  StampSaveModal (visible + imageUri, 신규 저장만)                 │
│    useEffect: analyzeSceneLabels(imageUri)  [설정 ON일 때만]    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/services/sceneLabelService.ts                               │
│    analyzeSceneLabels(uri) → string | null                       │
│    formatSceneMemo(labels[]) → 한국어 키워드 문자열               │
└────────────────────────────┬────────────────────────────────────┘
                             │ Platform.OS === 'android'
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  modules/voicestamp-mlkit/  (로컬 Expo 모듈, 신규)               │
│    labelImage(localUri, maxLabels, minConfidence)               │
│    → [{ text, confidence }]                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Android: com.google.mlkit:image-labeling (on-device)             │
│  ImageLabeler.process(InputImage.fromFilePath)                   │
└─────────────────────────────────────────────────────────────────┘
```

**원칙**

- JS 레이어는 **플랫폼 분기 + 포맷팅**만; ML 추론은 **네이티브 한 곳**.
- `expo-camera` / `takePictureAsync` URI를 **그대로** 분석 입력으로 사용 (추가 리사이즈는 선택·2차).
- 분석과 GPS 조회는 **병렬** — 서로 블로킹하지 않음.

---

## 4. ML Kit 선택 근거

| API | 용도 | 채택 |
|-----|------|------|
| **Image Labeling** | 장면·사물 키워드 (Sky, Building, …) | ✅ 1차 |
| Object Detection | 바운딩 박스·객체 | △ 2차 (메모 품질↑, APK↑)) |
| Text Recognition (OCR) | 간판·문서 글자 | △ 별도 기능 ID |
| Face Detection | 얼굴 | ❌ 개인정보·용도 부적합 |

**의존성 (Android Gradle, 구현 시)**

```gradle
implementation "com.google.mlkit:image-labeling:17.0.9"
// 또는 bundling된 image-labeling-custom 등 — 구현 시 Google Maven 최신 호환 버전 고정
```

- 모델은 **첫 사용 시 기기에 다운로드**될 수 있음 (Google Play services 경유). 완전 오프라인 최초 실행 시 지연 가능 → 설계상 타임아웃·무음 실패 처리.

---

## 5. API 설계

### 5.1 네이티브 모듈 `VoicestampMlkit`

**expo-module.config.json**

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.voicestampmlkit.VoicestampMlkitModule"]
  }
}
```

**Kotlin `AsyncFunction`**

| 함수 | 인자 | 반환 |
|------|------|------|
| `labelImage` | `localUri: string`, `maxLabels: number`, `minConfidence: number` | `{ labels: { text: string, confidence: number }[] }` |

- `localUri`: `file://` 허용, 내부에서 path 정규화 (`voicestamp-gallery`와 동일).
- `maxLabels`: 기본 **5**
- `minConfidence`: 기본 **0.6** (튜닝 가능)

### 5.2 JS `sceneLabelService.ts` (신규)

```typescript
export type SceneLabel = { text: string; confidence: number };

export async function analyzeSceneLabels(imageUri: string): Promise<SceneLabel[]>;

export function formatSceneMemo(labels: SceneLabel[]): string;
// 예: 상위 3~5개, 한국어 매핑, 「, 」구분
// "건물, 하늘, 야외" 또는 매핑 없을 시 원문 "Building, Sky"
```

### 5.3 한국어 라벨 매핑

- ML Kit 기본 라벨은 **영문**이 많음.
- `src/services/sceneLabelKo.ts` (또는 JSON `assets/scene-label-ko.json`)에 **상위 80~120개** 수동 매핑.
- 매핑 없는 라벨: **영문 유지** 또는 제외 (설정 가능, 기본: 영문 유지).
- 중복·동의어 병합: `Outdoor` / `Sky` → 표시 정리 규칙 문서화.

---

## 6. UI·상태 통합 (`StampSaveModal`)

### 6.1 삽입 조건

| 조건 | 동작 |
|------|------|
| `isEdit === true` | 분석 **안 함** |
| `mlkit_scene_label_enabled === false` | 분석 **안 함** |
| `memoTouchedRef.current === true` | 분석 결과 **적용 안 함** |
| `visible && imageUri` | 분석 **시작** |

### 6.2 `memoTouchedRef` (신규)

- `titleTouchedRef`와 동일 패턴.
- 사용자가 메모를 수정·음성 입력 시작 시 `true` → AI 초안으로 덮어쓰지 않음.

### 6.3 초안 삽입 규칙

| 상황 | 메모 |
|------|------|
| 메모 비어 있음 | `formatSceneMemo(labels)` 로 **대체** |
| 메모에 사용자 입력 있음 (touched) | **변경 없음** |
| 메모 비어 있지 않으나 untouched (드묾) | **앞에追加** `키워드 — ` 또는 **뒤에追加** ` · 키워드` (구현 시 하나로 고정, 권장: **비어 있을 때만**) |

### 6.4 성능

| 항목 | 목표 |
|------|------|
| 분석 타임아웃 | **8초** (JS `Promise.race`) |
| 동시 실행 | 모달 1회 열림당 1회; `cancelled` 플래그로 unmount 시 결과 무시 |
| 이미지 크기 | 1차는 **원본 URI**; 느리면 `prepareExportPhoto` 720px 썸네일로 2차 최적화 |

---

## 7. 연속 촬영·퀵 저장 (2차)

| 경로 | 1차 | 2차 |
|------|-----|-----|
| `StampSaveModal` | ✅ | — |
| `quickCaptureSave` → `saveStamp(memo: '')` | ❌ | 설정 ON 시 `analyzeSceneLabels` 후 memo 채워 저장 |
| 시스템 카메라 → 액션 시트 → 모달 | ✅ (모달 경로) | — |

2차 시 메모 자동 입력은 **목록에서 메모 열어 확인**하는 UX이므로, 기본값 OFF 유지 권장.

---

## 8. 패키지·모듈 구조 (구현 시 추가 파일)

```
modules/voicestamp-mlkit/
  package.json              # MIT, peer expo
  expo-module.config.json
  android/build.gradle      # + mlkit image-labeling
  android/src/.../VoicestampMlkitModule.kt
  src/index.ts

src/services/
  sceneLabelService.ts      # 플랫폼 분기·타임아웃
  sceneLabelKo.ts           # en → ko 매핑 (또는 JSON)

src/services/sceneLabelService.web.ts   # 항상 []

src/components/
  SettingsScreen.tsx        # 토글 1곳

src/components/StampSaveModal.tsx       # useEffect + memoTouchedRef + 상태 문구

package.json                # "voicestamp-mlkit": "file:./modules/voicestamp-mlkit"
```

**기존 모듈과의 관계:** `voicestamp-gallery`(갤러리 DISPLAY_NAME·EXIF)와 **독립** — 같은 autolinking 패턴만 공유.

---

## 9. 라이선스·저작권·개인정보

### 9.1 라이선스

| 구성 | 라이선스 | 고지 |
|------|----------|------|
| `com.google.mlkit:image-labeling` | [Google ML Kit Terms](https://developers.google.com/ml-kit/terms) + 구성요소별 (Apache 2.0 등) | `open_source_licenses.json` 재생성 시 Gradle deps 반영 |
| 로컬 모듈 `voicestamp-mlkit` | MIT (앱과 동일) | 자체 코드 |
| npm 추가 | **1차 없음** (`file:` 로컬 모듈만) | — |

- **GPL 계열 신규 도입 없음** — [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) 정책 유지.
- 구현 후: `tmp-gradle-deps.txt` → `generate-open-source-licenses.mjs` 재실행.

### 9.2 개인정보 ([PRIVACY.md](./PRIVACY.md) 정합)

| 항목 | 처리 |
|------|------|
| 사진 전송 | **없음** — 분석은 기기 내 |
| 분석 결과 | 메모 필드에만 저장, SQLite·로컬 파일 |
| 얼굴·번호판 특화 모델 | **사용 안 함** (Image Labeling 일반 태그) |

구현 시 `PRIVACY.md`에 한 단락 추가 권장: 「선택 기능: 촬영 사진을 기기 안에서만 분석해 메모 키워드를 제안」.

### 9.3 권한

- **신규 Android 권한 불필요** (이미 촬영·저장 권한으로 URI 접근).
- ML Kit 모델 다운로드는 Google Play services — 일부 중국·무GMS 기기에서 **기능 비활성** 가능 → 무음 실패.

---

## 10. 되돌리기 (RESTORE)

| 항목 | 내용 |
|------|------|
| 스냅샷 | `src.pre-mlkit-scene/` — `StampSaveModal.tsx`, `SettingsScreen.tsx`, `settingsService.ts`, `sceneLabelService.ts`, `package.json`, `modules/voicestamp-mlkit/` (구현 전 복사) |
| 배치 | `restore-mlkit-scene.bat` |
| 문서 | `RESTORE.md` §113 (다음 빈 번호) |
| DB | `app_settings` 키 `mlkit_scene_label_enabled` — 롤백 후에도 무해 (미사용) |

---

## 11. 구현 단계 (PDCA)

| 단계 | 내용 | 산출 |
|------|------|------|
| **Plan** | 본 문서 | `DESIGN-ML-KIT-SCENE-LABEL.md` |
| **Do-1** | `voicestamp-mlkit` 모듈 + `labelImage` | Android 빌드 통과 |
| **Do-2** | `sceneLabelService` + KO 매핑 80개 | 단위 수동 테스트 |
| **Do-3** | 설정 토글 + `StampSaveModal` 연동 | 메모 초안 UX |
| **Do-4** | 스냅샷·restore·RESTORE·OSS 목록 | 되돌리기 |
| **Check** | 실기기: 실내·실외·문서·야간 | 라벨 품질·지연 |
| **Act** | `minConfidence`·매핑·썸네일 크기 조정 | — |

**검증 체크리스트 (L1)**

- [ ] 설정 OFF → 기존과 동일 (메모 빈 값)
- [ ] 설정 ON → 촬영 후 메모에 키워드 1줄 이상 (장면에 따라)
- [ ] 메모 직접 입력 후 분석 완료돼도 **덮어쓰지 않음**
- [ ] 수정 모달(`isEdit`)에서 분석 **안 함**
- [ ] 비행기 모드에서도 동작 (모델 이미 캐시된 경우) / 최초 실패 무음
- [ ] APK 빌드·갤러리·음성인식 **회귀 없음**

---

## 12. 리스크·완화

| 리스크 | 완화 |
|--------|------|
| 라벨이 부정확·웃김 | “키워드 초안” 문구, 기본 OFF, 사용자 수정 전제 |
| 첫 실행 모델 다운로드 지연 | 타임아웃·무음 실패; 설정 설명에 안내 |
| APK 용량 증가 | Image Labeling만 사용; Object Detection은 2차 |
| 영문 라벨만 나옴 | KO 매핑 테이블; 점진적 확장 |
| `imageUri` 만료·삭제 | 모달 열린 직후 즉시 분석; 캐시 URI 사용 금지 |
| Expo SDK 업그레이드 | 로컬 모듈 격리, `voicestamp-gallery`와 동일 패턴 |

---

## 13. 문서·기능 ID 갱신 (구현 완료 시)

| 문서 | 추가 내용 |
|------|-----------|
| [PRD.md](./PRD.md) | `F-AI-01` 촬영 후 장면 키워드 (ML Kit, Android) |
| [PLAN.md](./PLAN.md) §4 | AI-ML-01 → §2 완료로 이동 |
| [PROJECT.md](./PROJECT.md) §4·§7.4 | 커밋·APK·restore bat |
| [docs/README.md](./README.md) | 본 설계 문서 링크 |

---

## 14. 요약

| 질문 | 답 |
|------|-----|
| 폰 내부 AI로 설명 가능? | **대략적 키워드** 수준은 ML Kit Image Labeling으로 **가능** |
| 서버 필요? | **아니오** (1차) |
| 어디에 넣나? | **메모 초안**, 설정 ON 시만 |
| 어떻게 붙이나? | `modules/voicestamp-mlkit` + `StampSaveModal` useEffect |
| iOS·웹? | 1차 **Android만**, 웹 no-op |

**다음 액션:** Agent 모드에서 본 설계 §8·§11 기준 구현 (사용자 `최소수정.txt` 워크플로: restore·커밋·APK·Vercel).
