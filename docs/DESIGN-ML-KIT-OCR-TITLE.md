# VoiceStamp ML Kit OCR → 제목·메모 초안 설계 (AI-ML-03)

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2026-07-25 |
| 상태 | ✅ **MVP 구현** (2026-07-25) |
| 기능 ID | **AI-ML-03** |
| 관련 문서 | [PRD.md](./PRD.md), [PLAN.md](./PLAN.md), [DESIGN-PRIVACY-BLUR.md](./DESIGN-PRIVACY-BLUR.md), [DESIGN-ML-KIT-SCENE-LABEL.md](./DESIGN-ML-KIT-SCENE-LABEL.md), [PRIVACY.md](./PRIVACY.md), [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) |
| 기준 커밋 | `94950ff` (main, 설계 시점) |

> **범위:** 촬영·저장 화면에서 **기기 내(on-device)** Google ML Kit **Korean Text Recognition**으로 사진 속 글자를 읽어 **제목·메모 초안**을 제안.  
> **저작권 안전:** ML Kit Terms · 공식 SDK만 · **생성형 LLM/클라우드 Vision 없음** · GPL 미도입.  
> **본 문서는 구현 가이드만** — 앱 소스·네이티브 모듈 수정은 별도 Agent 작업에서 수행.

---

## 1. 배경·목표

### 1.1 문제

- 간판·문서·점검표 등 **글자가 찍힌 사진**에서 제목·메모를 다시 타이핑하는 부담이 큼.
- 클라우드 OCR/LLM은 VoiceStamp **서버 미전송** 정책과 충돌.

### 1.2 목표

| 목표 | 설명 |
|------|------|
| G1 | **온디바이스 OCR** — 기존 `voicestamp-mlkit`의 Korean TextRecognition **재사용** |
| G2 | 제목·메모에 **초안만** 제안 (사용자가 수정·음성으로 덮어쓰기) |
| G3 | 설정 **opt-in**, 기본값 **끔** |
| G4 | 문장 **창작 없음** — OCR 원문 + 앱 규칙(첫 줄→제목, 나머지→메모) |
| G5 | PRIVACY·도움말·LICENSE-NOTICE 고지 |

### 1.3 비목표

| 항목 | 이유 |
|------|------|
| ChatGPT/Gemini 등 **자연어 재작성** | 서버 전송·정책 변경 필요 |
| 장면 키워드(Image Labeling) | **AI-ML-01** 별도 ([DESIGN-ML-KIT-SCENE-LABEL.md](./DESIGN-ML-KIT-SCENE-LABEL.md)) |
| 얼굴·숫자 **블러** | **AI-ML-02** 이미 MVP |
| 웹 | ML Kit 미지원 → no-op |

---

## 2. 현재 모듈 상태 (2026-07-25)

`modules/voicestamp-mlkit` **현재** 의존성:

- `face-detection` + `text-recognition-korean` (개인정보 가리기용)
- **Image Labeling 미포함** — 장면 분별·문장 설명 **불가**
- OCR 문자열을 제목·메모에 넣는 API는 **아직 없음** (블러용 영역 감지만)

---

## 3. 권장 구현 경로 (저작권·보안)

1. 네이티브에 `recognizeText(localUri) → { text, blocks[] }` 추가 (기존 Korean client 재사용).
2. JS `ocrTitleMemoService.ts`: 규칙으로 `title` / `memo` 초안 생성.
3. `StampSaveModal`에 「글자 읽어 채우기」 또는 설정 ON 시 빈 칸만 제안.
4. 타임아웃·실패 시 무음 또는 짧은 안내 — 저장 흐름 방해 금지.
5. 신규 GPL/불명 라이선스 금지 · 클라우드 API 금지.

---

## 4. AI-ML-01과의 관계

| ID | API | 결과물 |
|----|-----|--------|
| **AI-ML-01** | Image Labeling | 장면 태그 (예: Building, Sky) → 메모 키워드 |
| **AI-ML-03** | Text Recognition | 사진 속 **문자** → 제목·메모 초안 |

둘 다 온디바이스·공식 ML Kit면 저작권 정책과 맞음. **문장형 AI 설명은 어느 쪽도 제공하지 않음.**

---

## 5. 구현 상태

| 단계 | 상태 |
|------|------|
| 설계 문서 | ✅ 본 문서 (2026-07-25) |
| 소스·APK | ✅ MVP — `recognizeText` · 설정 opt-in · 「글자 읽어 채우기」 · `restore-ocr-title-memo.bat` |
