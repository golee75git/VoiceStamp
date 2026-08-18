# VoiceStamp 라이선스·저작권·OSS 고지

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2026-06-19 |
| 앱 | VoiceStamp (Copyright © 2026 이형우) |
| 앱 라이선스 | [MIT](../LICENSE) |
| OSS 목록 데이터 | [../assets/open_source_licenses.json](../assets/open_source_licenses.json) |
| 앱 내 열람 | 설정 → **오픈소스 라이선스** |
| 웹 | https://voicestamp-gilt.vercel.app/license |
| **배포 단계** | **베타·내부 테스트** (Play Internal 준비 · Production 전) |

> **안내:** 내부·테스터 배포용 컴플라이언스 정리입니다. Google Play **Production** 당일에 아래 §9를 적용해 배포 단계를 「Play」로 바꾸고, 콘솔 OSS·Data safety와 문구를 맞춘 뒤 별도 법무 검토를 권장합니다.  
> Play QA·리스팅: [PLAY-STORE-QA.md](./PLAY-STORE-QA.md) · [LEG-05-STORE-LISTING.md](./LEG-05-STORE-LISTING.md) · [PLAY-DATA-SAFETY.md](./PLAY-DATA-SAFETY.md)

---

## 1. VoiceStamp 소프트웨어

- **저작권:** Copyright © 2026 이형우
- **라이선스:** MIT License ([LICENSE](../LICENSE) 전문)
- **고지:** MIT 조건(저작권·허가 문구 포함)을 사본에 유지

---

## 2. 오픈소스 구성요소 개요

| 출처 | 수량 | 생성 기준 |
|------|------|-----------|
| npm (`package-lock.json`) | 666 | 직·간접 JavaScript 의존성 |
| Android Gradle (`releaseRuntimeClasspath`) | 202 | APK 네이티브·Maven 의존성 |
| **합계** | **868** | `assets/open_source_licenses.json` (재생성: 2026-08-18) |

재생성:

```powershell
cd C:\VoiceStamp\android
.\gradlew.bat app:dependencies --configuration releaseRuntimeClasspath --no-daemon `
  | Out-File ..\tmp-gradle-deps.txt -Encoding utf8
cd ..
node scripts/generate-open-source-licenses.mjs tmp-gradle-deps.txt
```

---

## 3. Dual-license 검토 결과 (법무 결론)

SPDX 표현에 GPL 계열이 **포함**된 dual-license 패키지는 자동으로 `reviewRequired`에 올라갑니다.  
아래는 VoiceStamp 프로젝트 **내부 검토 결론**입니다.

| 패키지 | SPDX | **선택 라이선스** | VoiceStamp 사용 | 결론 |
|--------|------|-------------------|-----------------|------|
| **jszip** 3.10.1 | (MIT OR GPL-3.0-or-later) | **MIT** | 직접 의존 — 프로젝트 ZIP·HWPX (`exportProject.ts`, `hwpxTemplate.ts`) | **MIT 조건으로 사용·배포 확정.** GPL-3.0-or-later 경로는 선택하지 않음. |
| **node-forge** 1.4.0 | (BSD-3-Clause OR GPL-2.0) | **BSD-3-Clause** | 간접 의존 — `@expo/code-signing-certificates` 등 Expo 빌드·서명 도구 | **BSD-3-Clause 조건으로 사용·배포 확정.** GPL-2.0 경로는 선택하지 않음. |

### 3.1 검토 근거

1. **선택권 행사:** 두 패키지 모두 upstream이 허용적 라이선스(MIT/BSD) 사용을 명시·권장함.
2. **GPL 미선택:** VoiceStamp는 GPL 조건으로 해당 코드를 수정·재배포하지 않으며, copyleft(GPL) 경로를 채택하지 않음.
3. **배포 형태:** 상업·폐쇄소스 APK/Web 배포는 **허용적 라이선스 조건**에 따름.
4. **고지:** 앱 **오픈소스 라이선스** 화면 및 본 문서·`open_source_licenses.json`에 라이브러리명·버전·라이선스·전문(또는 POM/URL)을 제공.

### 3.2 Dual-license를 검토 대상으로 표시한 이유 (요약)

| 이유 | 설명 |
|------|------|
| SPDX에 GPL 포함 | `(MIT OR GPL-…)` 표현은 **배포자가 라이선스를 선택**해야 함을 의미 |
| copyleft 경로 존재 | GPL을 선택할 경우 소스 공개 등 의무가 달라질 수 있어, 순수 MIT만 있는 패키지보다 확인 필요 |
| 자동 분류 한계 | 스크립트는 SPDX 문자열만 보고 flag — **「위반」이 아니라 「확인 권장」** |

### 3.3 잔여 권고

- jszip: 앱 번들에 **포함** — MIT 고지 유지.
- node-forge: Expo 간접 의존 — Release APK 번들 포함 여부는 빌드마다 다를 수 있음. 포함 시 BSD 고지 유지.
- 스토어 등록(LEG-05) 전: Play Console OSS 고지와 본 결론 문구 일치 여부 최종 확인.

**검토일:** 2026-06-19  
**상태:** dual-license 2건 — **허용적 라이선스 조건 사용·배포 확정**

---

## 4. copyleft·제한 라이선스 자동 flag 기준

`scripts/generate-open-source-licenses.mjs`의 `reviewRequired` 규칙:

- AGPL, GPL, LGPL, SSPL, Commons Clause, EUPL, OSL, CPAL (SPDX **이름** 필드 기준)

현재 VoiceStamp lockfile·Gradle 분석 결과 **위 카테고리 중 dual-license 2건만** 해당하며, §3 결론 적용.

---

## 5. 제3자 서비스 (라이선스 ≠ 개인정보)

| 서비스 | 용도 | 참고 |
|--------|------|------|
| 카카오 로컬 API | GPS → 주소 | [KAKAO-KEY-SECURITY.md](./KAKAO-KEY-SECURITY.md), 카카오 개발자 약관 |
| 전국초중등학교위치표준데이터 | GPS → 학교명 (로컬 DB, 200m) | [공공데이터포털](https://www.data.go.kr/data/15021148/standard.do) — 한국교육시설안전원 제공, **출처 표시** (공공데이터). 빌드 시 `assets/schools.sqlite` 생성 (`npm run build:schools-db`, 기준일 2026-03-20). |
| OS 음성 인식 | STT | 기기/OS 정책 — [PRIVACY.md](./PRIVACY.md) §2.3 |
| Google ML Kit (Face Detection, Korean Text Recognition, Image Labeling) | 선택: 온디바이스 모자이크 · OCR 제목·메모 · **장면 키워드** | [ML Kit Terms](https://developers.google.com/ml-kit/terms) · 사진은 서버 미전송 · [DESIGN-PRIVACY-BLUR.md](./DESIGN-PRIVACY-BLUR.md) · [DESIGN-ML-KIT-OCR-TITLE.md](./DESIGN-ML-KIT-OCR-TITLE.md) · [DESIGN-ML-KIT-SCENE-LABEL.md](./DESIGN-ML-KIT-SCENE-LABEL.md) |

---

## 6. UI·에셋 (별도 확인 권장)

문서화되지 않은 항목 — 상업 배포 전 출처·AI 생성 이미지 이용약관 확인:

- 앱 아이콘 (`assets/icon.png` 등)
- 온보딩·UI PNG (`img/`, `assets/`)
- 스탬프 미리보기 확대/수정 배지 (`assets/zoom.png`) — VoiceStamp UI용, Copyright © 2026 이형우
- HWPX 서식 (`assets/templates/vs-form.hwpx`, 웹 `public/templates/report.hwpx`) — VoiceStamp가 `scripts/build-report-template.mjs`로 생성. 제3자 한글 양식·외부 저장소 파일을 쓰지 않음. 글꼴 파일은 넣지 않으며 한글이 설치한 화면 글자 이름만 가리킴. Copyright © 2026 이형우

---

## 7. 관련 문서

| 문서 | 내용 |
|------|------|
| [PLAN.md](./PLAN.md) §3 | LEG-01~05 법무 로드맵 |
| [PLAY-STORE-QA.md](./PLAY-STORE-QA.md) | Play 테스트·AAB·Internal |
| [PLAY-DATA-SAFETY.md](./PLAY-DATA-SAFETY.md) | Data safety 초안 |
| [LEG-05-STORE-LISTING.md](./LEG-05-STORE-LISTING.md) | 스크린샷·스토어 문구 |
| [DESIGN-INFO-PAGES.md](./DESIGN-INFO-PAGES.md) | `/license` 웹 페이지 |
| [PRIVACY.md](./PRIVACY.md) | 개인정보 (라이선스와 별도) |
| [../LICENSE](../LICENSE) | VoiceStamp MIT |
| [../assets/open_source_licenses.json](../assets/open_source_licenses.json) | OSS 목록·전문 |

---

## 8. 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-06-19 | 최초 작성 — OSS JSON·dual-license 검토 결론(MIT/BSD 확정) |
| 2026-07-06 | `assets/zoomedit.png` UI 배지 에셋 고지 추가 |
| 2026-07-06 | 미리보기 배지 에셋 `zoomedit.png` → `zoom.png` 로 교체 |
| 2026-07-23 | 별도영역 이미지 내보내기: ViewShot→`react-native-image-marker`(MIT) 불투명 JPEG. 신규 의존성·권한 없음 |
| 2026-07-24 | AI-ML-02 개인정보 가리기: voicestamp-mlkit (ML Kit Face + Korean OCR) + 자체 모자이크. GPL 없음. 생성형 인페인팅 없음 |
| 2026-07-25 | 저장 템플릿 적용 중/사용자수정 표시: 기기 내 app_settings만 사용. 신규 의존성·권한·네트워크 없음. GPL 없음 |
| 2026-07-25 | 개인정보 가리기: 하단 버튼 여백 + 탭 수동 영역(기존 모자이크만). 신규 의존성·생성형 AI 없음. GPL 없음 |
| 2026-07-25 | **AI-ML-03** OCR→제목·메모: 기존 Korean Text Recognition 재사용. 신규 의존성·생성형 AI·GPL 없음. 설정 opt-in |
| 2026-07-25 | **AI-ML-01** 장면 키워드: `com.google.mlkit:image-labeling` 온디바이스. GPL·생성형 AI 없음. 설정 opt-in |
| 2026-08-11 | Play Internal 준비 문서 연계. 배포 단계는 베타 유지. Production 당일 §9 적용 |
| 2026-08-18 | HWPX 서식을 앱 자체 생성 파일로 교체. 외부 예제 `report-source.hwpx` 제거 |

---

## 9. Production 전환 시 (LEG-05)

Production 트랙 공개 **당일**에만 수행:

1. 본 문서 표의 **배포 단계**를 **`Play 스토어`** 로 변경.
2. 상단 안내 문구에서 「출시 전」표현을 Production 기준으로 갱신.
3. Play Console OSS/라이선스 고지와 §3 dual-license 결론(MIT/BSD) 일치 확인.
4. [RELEASE-CHANNELS.md](./RELEASE-CHANNELS.md) §5 · [PLAY-STORE-QA.md](./PLAY-STORE-QA.md) Phase 3 체크리스트 완료.
