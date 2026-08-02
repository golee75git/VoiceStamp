# VoiceStamp 성능·헬스체크 기준 (고정)

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 고정일 | 2026-08-01 |
| 기준 APK (성능 번들) | `VoiceStamp_20260801_193317.apk` (`073c8bf`) |
| 제품 권장 APK | `VoiceStamp_20260802_214047.apk` — A/B/C **누적** · 상세 [CHANGELOG.md](./CHANGELOG.md) |
| 관련 | [SECURITY-perf-bundle-a-20260801.md](./SECURITY-perf-bundle-a-20260801.md) · [SECURITY-perf-bundle-b-20260801.md](./SECURITY-perf-bundle-b-20260801.md) · [SECURITY-perf-bundle-c-20260801.md](./SECURITY-perf-bundle-c-20260801.md) |
| 롤백 | `restore-perf-bundle-a.bat` · `restore-perf-bundle-b.bat` · `restore-perf-bundle-c.bat` |

**용도:** 「헬스체크」「성능 점검」「느림」요청 시 **이 문서를 먼저 읽고** 적용한다.  
번들 A·B·C는 **이미 적용됨** — 동일 패치를 다시 넣지 말고 **회귀만** 확인한다.

---

## 1. 이미 적용됨 (재패치 금지 · 회귀 확인만)

### 번들 A — 촬영·갤러리 크리티컬 패스
| 항목 | 상태 | 핵심 |
|------|------|------|
| 촬영 JPEG 품질 | ✅ | `STAMP_CAPTURE_JPEG_QUALITY` ≈ 0.85 |
| 긴 변 상한 | ✅ | `STAMP_PICTURE_LONG_EDGE_MAX` = 2560, `pickPreferredStampPictureSize` |
| 갤러리 백업 | ✅ | `gallerySaveIdleQueue` — UI 유휴 후 **직렬** |
| 기본 갤러리 모드 | ✅ | 신규 설치 `app_only` (저장된 사용자 설정은 유지) |

### 번들 B — 장소·장면 ML
| 항목 | 상태 | 핵심 |
|------|------|------|
| Kakao POI | ✅ | 카테고리 **12 → 3** (`CS2`·`CE7`·`FD6`) |
| 장면 키워드 | ✅ | 저장 화면 **자동 분석 없음** → 「장면 키워드」**버튼** |

### 번들 C — 기동·번들
| 항목 | 상태 | 핵심 |
|------|------|------|
| 내보내기 코드 스플릿 | ✅ | `exportOnDemand.ts` — PDF/ZIP/XLSX/HWPX **버튼 시** `import()` |

### 유지 중인 양호 패턴 (깨지 말 것)
- 위치 fast → refine 프리페치·취소
- 목록 FlatList `windowSize` / `initialNumToRender` / 디스크 썸네일·동시성 2
- 저장 모달 미리보기 `InteractionManager`
- QR 연결확인(사설망 차단)·시스템 글꼴만·신규 의존성 없이 최소수정+restore

---

## 2. 다음 헬스체크 시 우선 후보 (아직 미적용)

순서대로 제안한다. **최소수정** + `src.pre-*` + `restore-*.bat` + SECURITY 노트.

| 순위 | ID | 항목 | 예상 체감 |
|:---:|:--:|------|-----------|
| 1 | P2-8 | 목록 `listStamps` 페이지네이션·가벼운 SELECT | 스탬프 많을 때 |
| 2 | P2-9 | 폴더 선택 전량 스캔 제거 (`listKnownStampGroupFolders`) | 저장 모달 |
| 3 | P1-6 | 카메라 keep-alive (list 전환 시 remount 축소) | 재진입 |
| 4 | P1-7 | 저장 모달 open 오케스트레이션 (설정·위치·ML 우선순위) | 모달 오픈 |
| 5 | P2-10 | 목록 행 `memo` + 썸네일 이중 ensure 정리 | 스크롤 |
| 6 | P3-12 | PDF/XLSX/HWPX 이미지 다운스케일·동시성 제한 | 대량 내보내기 |
| 7 | P3-14 | QR 연결확인 HEAD / 본문 미수신 | 연결확인만 |
| 8 | P3-15 | Kakao fetch 타임아웃·Abort | 장소 조회 |

---

## 3. 헬스체크 절차 (매번)

1. 이 문서 §1 회귀 확인 (A/B/C 동작·restore bat 존재).
2. 체감 병목 구간 특정: **촬영 → 저장 → 모달 → 목록 → 내보내기 → 기동**.
3. §2에서 **1~2개만** 골라 최소수정 (다른 것 그대로).
4. 글꼴: 시스템/OFL 상용 허용만. **폰트 파일·신규 npm 추가 금지**(필요 시 먼저 보고).
5. SECURITY 노트 + 도움말 동기화 + APK 날짜시각 파일명 + 랜딩/GitHub/Vercel (사용자가 최소수정 절차를 요청한 경우).

---

## 4. 핫패스 파일 지도

| 구간 | 주요 경로 |
|------|-----------|
| 기동 | `App.tsx` → `MainScreen.tsx` |
| 촬영 | `CameraScreen.tsx`, `captureImageBudget.ts`, `cameraPictureSize.ts` |
| 저장 | `saveStamp.ts`, `gallerySaveIdleQueue.ts`, `quickCaptureSave.ts` |
| 모달 | `StampSaveModal.tsx`, `sceneLabelService.ts` |
| 장소 | `locationService.ts`, `kakaoLocal.ts`, `schoolLookup.ts` |
| 목록 | `StampListScreen.tsx`, `stampRepository.ts`, `stampThumb.ts` |
| 내보내기 | `exportOnDemand.ts` → `exportPdf` / `exportXlsx` / `exportHwpx` / `exportProject` |

---

## 5. APK 타임라인 (성능 번들)

| APK | 커밋 | 내용 |
|-----|------|------|
| `VoiceStamp_20260801_185512.apk` | `e45026b` | 번들 A |
| `VoiceStamp_20260801_191117.apk` | `9d8ccfa` | 번들 B (+A) |
| `VoiceStamp_20260801_193317.apk` | `073c8bf` | **성능 기준선** 번들 C (+B/A) |
| `VoiceStamp_20260802_214047.apk` | (본 커밋) | **제품 권장** (번들 C 누적 + 목록 유형 필터) |
| `VoiceStamp_20260802_124143.apk` | `2a00578` | 선택 취소 썸네일 (+08-02 UX) |

상세 날짜·APK 이력: [CHANGELOG.md](./CHANGELOG.md) · [PRD.md](./PRD.md) §12–13 · [PLAN.md](./PLAN.md) §10–11 · [PROJECT.md](./PROJECT.md) §4·§7.4·§12
