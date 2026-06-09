# VoiceStamp 정보·정책·도움말 웹페이지 설계 (LEG-04)

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2026-06-09 |
| 상태 | 📋 설계 (미구현) |
| 관련 ID | LEG-04, LEG-05 |
| 기준 커밋 | `59c7007` (main) |
| 관련 문서 | [PLAN.md](./PLAN.md) §3, [PRD.md](./PRD.md) §10.1, [PRIVACY.md](./PRIVACY.md), [../LICENSE](../LICENSE) |

> **범위:** 본 문서는 **설계만** 정의합니다. 구현 시 `src/` 최소 수정 + `public/` 정적 페이지 + `vercel.json` 라우팅 조정을 따릅니다.

---

## 1. 배경·목표

### 1.1 문제

- 버전·라이선스·개인정보·도움말을 **앱 번들에 전부 넣으면** 문구 수정마다 APK·웹 재배포가 필요함.
- `docs/PRIVACY.md`, `LICENSE`는 저장소에 있으나 **사용자가 앱·웹에서 바로 볼 URL**이 없음.
- Google Play 등록 시 **공개 HTTPS 정책 URL**이 필요할 수 있음 (LEG-05).

### 1.2 목표

| 목표 | 설명 |
|------|------|
| G1 | 정책·라이선스·도움말을 **별도 웹페이지**로 제공 |
| G2 | 앱 설정에는 **링크 + 버전 한 줄**만 (전문은 웹) |
| G3 | APK·웹·Play Console이 **동일 base URL** 사용 |
| G4 | **최소 수정** — Expo SPA 구조 유지, 정적 HTML 추가 |
| G5 | 되돌리기 가능 (`public/` 삭제 + `vercel.json` 복구) |

### 1.3 비목표 (Out of Scope)

- Expo Router 도입
- 앱 내 WebView로 전문 표시 (1차)
- Markdown 실시간 렌더링 파이프라인
- 다국어(i18n)
- 사용자 계정·문의 티켓 시스템

---

## 2. 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  Vercel  https://voicestamp-gilt.vercel.app                 │
├─────────────────────────────────────────────────────────────┤
│  /              → dist/index.html        (Expo SPA 앱)      │
│  /privacy       → dist/privacy.html      (정적)             │
│  /license       → dist/license.html      (정적)             │
│  /help          → dist/help.html         (정적)             │
│  /info          → dist/info.html         (정적, 요약·버전)  │
└─────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │ Linking.openURL (APK)        │ window.open / <a> (웹)
         │                              │
┌────────┴──────────────────────────────┴─────────────────────┐
│  SettingsScreen  「앱 정보」 섹션 (구현 Phase B)               │
│  · VoiceStamp 1.0.0 (표시만)                                  │
│  · 개인정보 처리 안내 → /privacy                              │
│  · 라이선스 → /license                                        │
│  · 도움말 → /help                                             │
└───────────────────────────────────────────────────────────────┘
```

**원칙:** 정책 **원본(Single Source of Truth)** 은 저장소 Markdown 유지 → HTML은 **수동 또는 빌드 스크립트**로 동기화 (1차는 수동 복사 acceptable).

---

## 3. URL·페이지 정의

| 경로 | 파일 | Play Console·외부 공유 | 내용 |
|------|------|------------------------|------|
| `/info` | `public/info.html` | 선택 | 앱명·버전·저작권 한 줄·다른 페이지 링크 |
| `/privacy` | `public/privacy.html` | **필수 URL 후보** | [PRIVACY.md](./PRIVACY.md) HTML 변환 |
| `/license` | `public/license.html` | 선택 | [LICENSE](../LICENSE) + OSS 안내 |
| `/help` | `public/help.html` | 선택 | 사용법·플랫폼별 제한 |

**Base URL (고정):** `https://voicestamp-gilt.vercel.app`

**Play 스토어 개인정보 처리방침 URL (등록 시):**  
`https://voicestamp-gilt.vercel.app/privacy`

---

## 4. 페이지별 콘텐츠 설계

### 4.1 `/info` — 앱 정보 (요약)

| 블록 | 내용 |
|------|------|
| 헤더 | VoiceStamp |
| 버전 | `1.0.0` (`app.json` `expo.version`과 동기) |
| 저작권 | © 2026 이형우 |
| 한 줄 설명 | 사진 + 제목·메모 스탬프, PDF 공유 |
| 링크 | [개인정보](/privacy) · [라이선스](/license) · [도움말](/help) · [앱 열기](/) |
| 문의 | GitHub Issues URL 또는 이메일 (운영자 결정) |

### 4.2 `/privacy` — 개인정보 처리 안내

**원본:** `docs/PRIVACY.md` (문서 버전 1.0, 2026-06-07)

포함 섹션 (MD § 그대로):

1. 개요 — 기기 로컬 저장, 서버 미수집
2. 수집·이용 정보 — 사진·제목·메모·PDF
3. 기기 권한 — 카메라·마이크·위치·갤러리
4. 제3자 — 카카오 로컬 API, OS 음성 인식
5. 보관·파기 — APK / Web
6. 보안 — 기기 잠금, API 키 클라이언트 포함
7. 이용자 권리
8. 아동
9. 변경·문의 — **최종 수정일** 표기

> 스토어 등록 전 법무 검토 권장 (PRIVACY.md § 상단 안내와 동일).

### 4.3 `/license` — 라이선스·저작권

**원본:** `LICENSE`

| 블록 | 내용 |
|------|------|
| VoiceStamp | MIT License, Copyright (c) 2026 이형우 (전문) |
| 오픈소스 | Expo SDK 56, React Native, React 등 사용 — 각 패키지 LICENSE는 npm 저장소 참조 |
| 고지 | 「본 앱은 MIT 라이선스이며, 포함된 OSS는 각 라이선스를 따릅니다」 |

Play 등록 시 **OSS 고지** 요구 대비: 2차에서 `license.html` 하단에 주요 dependency 목록(Expo, RN) 링크만 추가 가능.

### 4.4 `/help` — 도움말

PRD §2.3 주요 플로우 기반 **짧은 사용법** (앱 UI와 무관한 정적 텍스트).

| 섹션 | 내용 |
|------|------|
| 시작하기 | APK: 카메라 촬영 → 저장 모달. Web: 목록·앨범에서 사진 가져오기 |
| 스탬프 저장 | 제목(날짜·시간·위치 자동), 메모, 저장 폴더 `YYYYMMDD_장소`, [선택]으로 기존 폴더 |
| 목록 | 카드 조회·수정, 길게 눌러 선택, PDF·이미지 저장 |
| PDF | 설정에서 페이지당 장수·화질·일시·정렬 |
| 설정 | 폴더명, 손잡이, 휴지통 비우기 |
| Android | 뒤로가기 — 목록→카메라, 카메라→종료 확인 |
| Web 제한 | 갤러리 앨범 백업 없음, 카메라·음성 제한, 브라우저 저장소 |
| 문제 해결 | 위치 안 나옴 → GPS·카카오 키. APK 키 변경 → clean 빌드 |

---

## 5. UI·스타일 (정적 HTML 공통)

모바일·데스크톱 모두 읽기 쉬운 **단일 컬럼** 정적 페이지.

| 항목 | 값 |
|------|-----|
| 언어 | `lang="ko"` |
| 최대 너비 | `max-width: 42rem`, 가운데 정렬 |
| 배경 | `#fff`, 본문 `#111`, 보조 `#6b7280` |
| 링크 | `#2563eb` (앱 primary와 유사) |
| 상단 | VoiceStamp 로고 텍스트 + 「← 앱으로」→ `/` |
| 하단 | © 2026 이형우 · [info](/info) |

**공통 파일 (권장):**

```
public/
  info.html
  privacy.html
  license.html
  help.html
  info-pages.css      ← 공통 스타일 (선택)
```

1차 구현에서는 **각 HTML `<style>` 인라인**도 허용 (파일 수 최소화).

---

## 6. 빌드·배포

### 6.1 Expo `public/` 동작

- Expo SDK 56: `public/` 루트 파일은 `expo export -p web` 시 **`dist/` 루트**로 복사됨.
- `npm run build:web` → Vercel `outputDirectory: dist` 와 호환.

### 6.2 `vercel.json` 라우팅 (필수 변경)

**현재:** 모든 경로 `/(.*)` → `/index.html` (SPA fallback).

**변경 후:** 정적 페이지를 **catch-all보다 위**에 배치.

```json
{
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist",
  "headers": [ "... 기존 COEP/COOP 유지 ..." ],
  "rewrites": [
    { "source": "/info", "destination": "/info.html" },
    { "source": "/privacy", "destination": "/privacy.html" },
    { "source": "/license", "destination": "/license.html" },
    { "source": "/help", "destination": "/help.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> `/privacy.html` 직접 접근도 가능. Play URL은 **슬래시 없는 경로** `/privacy` 권장.

### 6.3 배포 흐름

```
1. public/*.html 작성·수정
2. (선택) docs/PRIVACY.md 변경 → privacy.html 수동 반영
3. git commit → push main
4. Vercel 자동 배포 (또는 npx vercel --prod)
5. /privacy, /help 브라우저 확인
6. (Phase B) APK 설정 링크 확인
```

정책만 바꿀 때: **HTML + Vercel 재배포**면 되고 APK 재빌드는 **불필요** (Phase A).

---

## 7. 앱 연동 설계 (Phase B — `SettingsScreen`)

> 구현 시에만 `src/components/SettingsScreen.tsx` 수정. 본 설계 단계에서는 **변경 없음**.

### 7.1 UI 배치

`ScrollView` **맨 아래**, 「휴지통」 섹션 **아래**에 「앱 정보」 섹션 추가.

```
┌──────────────────────────────┐
│  … 기존 설정 항목 …           │
│  [휴지통]                     │
├──────────────────────────────┤
│  앱 정보                      │
│  VoiceStamp 1.0.0             │  ← Text만, 링크 아님
│  [개인정보 처리 안내]         │  → openInfoUrl('/privacy')
│  [라이선스]                   │  → /license
│  [도움말]                     │  → /help
│  © 2026 이형우                │  ← 작은 회색 텍스트
└──────────────────────────────┘
```

### 7.2 URL 상수

새 파일 **`src/constants/infoUrls.ts`** (권장, 5~10줄):

```typescript
export const INFO_BASE_URL = 'https://voicestamp-gilt.vercel.app';

export function infoPageUrl(path: '/info' | '/privacy' | '/license' | '/help'): string {
  return `${INFO_BASE_URL}${path}`;
}
```

- 웹 빌드에서 same-origin: `Platform.OS === 'web'` 이면 `window.location.origin + path` 사용 가능 (로컬 dev 대응).
- APK: `Linking.openURL(infoPageUrl('/privacy'))`.

### 7.3 버전 표시

```typescript
import Constants from 'expo-constants';
// 또는 app.json import — expo-constants 권장
const version = Constants.expoConfig?.version ?? '1.0.0';
```

`expo-constants` 이미 Expo에 포함. **별도 패키지 추가 불필요.**

### 7.4 수정 파일 (Phase B 예상)

| 파일 | 변경 |
|------|------|
| `src/constants/infoUrls.ts` | 신규 |
| `src/components/SettingsScreen.tsx` | 「앱 정보」 섹션 + Linking |
| `app.json` | 변경 없음 (version만 유지) |

**되돌리기:** `src.pre-info-pages/` 백업 + `restore-info-pages.bat`

---

## 8. 구현 단계 (PDCA)

| Phase | 작업 | 산출물 | APK 재빌드 |
|-------|------|--------|------------|
| **A** | `public/*.html` 4종 + `vercel.json` rewrites | 웹 URL 즉시 사용 | 불필요 |
| **B** | Settings 「앱 정보」 링크 + `infoUrls.ts` | LEG-04 완료 | 필요 |
| **C** | Play Console URL 등록, 문의처 확정 | LEG-05 | — |
| **D** (선택) | PRIVACY.md → HTML 변환 스크립트 | `scripts/sync-privacy-html.mjs` | — |

**권장 순서:** A → Vercel 확인 → B → APK.

---

## 9. 검증 체크리스트

### Phase A (웹만)

- [ ] `https://voicestamp-gilt.vercel.app/privacy` — 200, PRIVACY 내용 표시
- [ ] `/license`, `/help`, `/info` — 200
- [ ] `/` — 기존 Expo 앱 정상 (회귀 없음)
- [ ] 모바일 Chrome에서 가독성
- [ ] 정적 페이지가 SPA 번들에 `ExpoMediaLibrary` 등 끌어오지 **않음**

### Phase B (앱)

- [ ] APK 설정 → 개인정보 링크 → 브라우저 열림
- [ ] Web 설정 → 같은 탭/새 탭 정책 (권장: `Linking` / `window.open`)
- [ ] 버전 `1.0.0` 표시
- [ ] 오프라인 APK — 링크 탭 시 네트워크 오류 (허용, 도움말 문구 optional)

---

## 10. 되돌리기

| 항목 | 방법 |
|------|------|
| 정적 페이지 | `Remove-Item public\*.html` |
| Vercel 라우팅 | `vercel.json` rewrites 4줄 제거, catch-all만 유지 |
| 앱 링크 (Phase B) | `restore-info-pages.bat` |
| 문서 | 본 파일 삭제 또는 「폐기」 표시 |

백업 디렉터리 (구현 시 생성):

```
src.pre-info-pages/
  components/SettingsScreen.tsx
vercel.json.pre-info-pages
public.pre-info-pages/   ← HTML 스냅샷 (선택)
restore-info-pages.bat
RESTORE.md §67 (구현 시 추가)
```

---

## 11. 문서·저장소 동기화 규칙

| HTML 페이지 | 원본 | 갱신 시점 |
|-------------|------|-----------|
| privacy.html | docs/PRIVACY.md | PRIVACY.md 수정 시 |
| license.html | LICENSE | LICENSE 변경 시 |
| help.html | PRD §2.3, 본 설계 §4.4 | UX 변경 시 |
| info.html | app.json version | 버전 bump 시 |

**버전 bump 절차:**

1. `app.json` `expo.version` 수정
2. `info.html` 버전 문자열 수정
3. Phase B 이후 APK 재빌드

---

## 12. PLAN·PRD 반영 (구현 완료 시)

| 문서 | 갱신 |
|------|------|
| PLAN.md §3 | LEG-04 → ✅, LEG-05 진행 |
| PRD.md §10.1 | LEG-04 후보 → ✅ |
| docs/README.md | 본 설계 + 공개 URL 추가 |
| PROJECT.md §4 | 기능 이력 1행 |

---

## 13. 리스크·결정 사항

| ID | 리스크 | 대응 |
|----|--------|------|
| R1 | `vercel.json` rewrite 순서 오류 → SPA가 정적 페이지 가로챔 | catch-all **항상 마지막** |
| R2 | PRIVACY.md와 HTML 불일치 | 수정 시 두 파일 동시 PR, 또는 Phase D 스크립트 |
| R3 | Vercel alias 변경 | `infoUrls.ts` 상수 1곳만 수정 |
| R4 | 오프라인에서 정책 미열람 | Play·웹 URL로 충분; 필요 시 2차 WebView |
| R5 | COEP/COOP 헤더가 정적 HTML에 영향 | 현재와 동일 헤더 적용, 문제 시 정적만 exclude 검토 |

**운영자 결정 필요 (구현 전):**

- [ ] 문의 채널: GitHub Issues URL vs 이메일
- [ ] Web 설정에서 링크: 같은 탭 vs 새 탭

---

## 14. 관련 문서

| 문서 | 경로 |
|------|------|
| 개발 계획 | [PLAN.md](./PLAN.md) |
| PRD | [PRD.md](./PRD.md) |
| 개인정보 (원본) | [PRIVACY.md](./PRIVACY.md) |
| 라이선스 (원본) | [../LICENSE](../LICENSE) |
| Vercel 배포 | [../vercel.json](../vercel.json) |
| 되돌리기 | [../RESTORE.md](../RESTORE.md) |

---

## 부록 A — `privacy.html` 섹션 매핑

| PRIVACY.md | HTML `<h2>` |
|------------|-------------|
| §1 개요 | 1. 개요 |
| §2 | 2. 수집·이용하는 정보 |
| §3 | 3. 보관·파기 |
| §4 | 4. 보안 |
| §5 | 5. 이용자 권리 |
| §6 | 6. 아동 |
| §7 | 7. 변경·문의 |

## 부록 B — Phase A 최소 파일 트리 (구현 참고)

```
VoiceStamp/
  public/
    info.html
    privacy.html
    license.html
    help.html
  vercel.json          ← rewrites 4줄 추가
  docs/
    DESIGN-INFO-PAGES.md   ← 본 문서
```

**소스(`src/`) 변경 없이 Phase A만으로 Play용 `/privacy` URL을 먼저 열 수 있음.**
