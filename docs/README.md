# VoiceStamp 문서

프로젝트 문서 모음입니다. **소스 코드는 `src/`**, 되돌리기·빌드는 루트의 MD·BAT를 참고하세요.

---

## 문서 목록

| 문서 | 대상 | 설명 |
|------|------|------|
| [PRD.md](./PRD.md) | 기획·QA | 제품 요구사항, 기능 ID, 데이터 모델, 미구현 후보 |
| [PROJECT.md](./PROJECT.md) | 개발 | 구현 이력, 커밋, 모듈, 빌드·APK, UX 로드맵 |
| [PLAN.md](./PLAN.md) | 기획·개발 | 단계별 계획, 완료 기능, 후보·우선순위 |
| [PRIVACY.md](./PRIVACY.md) | 배포·법무 | 개인정보·권한·제3자(카카오·음성) 처리 안내 |
| [KAKAO-KEY-SECURITY.md](./KAKAO-KEY-SECURITY.md) | 운영 | 카카오 REST API 키 노출·콘솔 제한 체크리스트 |

## 루트 문서

| 문서 | 설명 |
|------|------|
| [../README.md](../README.md) | 실행 방법 요약 |
| [../LICENSE](../LICENSE) | MIT (Copyright 2026 이형우) |
| [../RESTORE.md](../RESTORE.md) | 기능별 되돌리기 (§1~66, `restore-*.bat`) |
| [../BUILD-APK.md](../BUILD-APK.md) | Android APK 빌드 가이드 |
| [../AGENTS.md](../AGENTS.md) | Expo SDK 56 문서 참조 규칙 |

---

## 현재 상태 스냅샷 (2026-06-08)

- **최신 커밋:** `6baa947` (main)
- **웹:** https://voicestamp-golee75git-golee75gits-projects.vercel.app
- **구현 완료:** 카메라·음성·스탬프·목록·PDF·합성 JPEG·워터마크·손잡이·카카오 위치·휴지통·**장소명·날짜_장소 폴더·갤러리 앨범**·**수정 화면 폴더·앨범 이동·폴더 선택**·**사진 전체 보기·버리기**·Android 뒤로가기·3D 액자 아이콘·APK 마이크 권한·웹 배포
- **문서:** LICENSE, PRIVACY, PLAN, PRD, PROJECT (기준 `6baa947`)
- **미구현 후보:** 앱 내 정책 화면(LEG-04), 목적별 필드 라벨, DB 백업/복원, 보고서 서식 — [PLAN.md](./PLAN.md) §4·§6

### 개선 시 참고 순서

1. [PLAN.md](./PLAN.md) §6 — 다음 권장 작업
2. [PRD.md](./PRD.md) §10.1 — 미구현 후보 ID
3. [PROJECT.md](./PROJECT.md) §4 — 기능별 커밋·RESTORE §

자세한 내용은 [PRD.md](./PRD.md), [PROJECT.md](./PROJECT.md), [PLAN.md](./PLAN.md)를 참고하세요.
