# VoiceStamp 문서

프로젝트 문서 모음입니다. **소스 코드는 `src/`**, 되돌리기·빌드는 루트의 MD·BAT를 참고하세요.

---

## 문서 목록

| 문서 | 대상 | 설명 |
|------|------|------|
| [PRD.md](./PRD.md) | 기획·QA | 제품 요구사항, 기능 ID, 데이터 모델, **날짜별 수정 요약** |
| [PROJECT.md](./PROJECT.md) | 개발 | 구현 이력, 커밋, 모듈, 빌드·APK, **날짜별 수정 상세** |
| [PLAN.md](./PLAN.md) | 기획·개발 | 단계별 계획, 완료 기능, 후보·우선순위, **날짜별 개발 요약** |
| [DESIGN-INFO-PAGES.md](./DESIGN-INFO-PAGES.md) | 기획·UI | 버전·라이선스·개인정보·도움말 페이지 설계 (코드 미반영) |
| [PRIVACY.md](./PRIVACY.md) | 배포·법무 | 개인정보·권한·제3자(카카오·음성) 처리 안내 |
| [KAKAO-KEY-SECURITY.md](./KAKAO-KEY-SECURITY.md) | 운영 | 카카오 REST API 키 노출·콘솔 제한 체크리스트 |

## 루트 문서

| 문서 | 설명 |
|------|------|
| [../README.md](../README.md) | 실행 방법 요약 |
| [../LICENSE](../LICENSE) | MIT (Copyright 2026 이형우) |
| [../RESTORE.md](../RESTORE.md) | 기능별 되돌리기 (§1~68, `restore-*.bat`) |
| [../BUILD-APK.md](../BUILD-APK.md) | Android APK 빌드 가이드 |
| [../AGENTS.md](../AGENTS.md) | Expo SDK 56 문서 참조 규칙 |

---

## 현재 상태 스냅샷 (2026-06-09)

- **최신 커밋:** `b44c469` (main)
- **웹:** https://voicestamp-gilt.vercel.app
- **최신 APK:** `VoiceStamp_20260609_181249.apk`
- **구현 완료:** 카메라·음성·스탬프·목록·PDF·JPEG·장소·폴더·갤러리 앨범·수정 UX·휴지통·**목록 스크롤 유지(선택·수정)**·**웹 갤러리 스텁**·**저장 폴더 자동 채움**
- **미구현:** LEG-04 정보 페이지 (설계: [DESIGN-INFO-PAGES.md](./DESIGN-INFO-PAGES.md)), 목적별 필드 라벨, DB 백업/복원

### 날짜별 요약 (빠른 참조)

| 날짜 | 핵심 |
|------|------|
| 06-05 | 저장소 생성 |
| 06-06 | MVP·PDF·웹·위치·휴지통·갤러리 |
| 06-07 | PDF/JPEG보내기·UI·Android 뒤로·아이콘 |
| 06-08 | 장소·폴더·갤러리 앨범·수정·폴더 선택 |
| 06-09 | 폴더 자동 채움·웹 안정화·목록 스크롤 UX |

자세한 커밋·되돌리기는 [PROJECT.md](./PROJECT.md) §4·§12, [PRD.md](./PRD.md) §12, [PLAN.md](./PLAN.md) §10을 참고하세요.

### 개선 시 참고 순서

1. [PLAN.md](./PLAN.md) §6 — 다음 권장 작업
2. [PRD.md](./PRD.md) §10.1 — 미구현 후보 ID
3. [PROJECT.md](./PROJECT.md) §4 — 기능별 커밋·RESTORE §
