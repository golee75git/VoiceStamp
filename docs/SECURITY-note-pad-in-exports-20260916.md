# 보안·라이선스·특허 점검 — PDF·HWPX 글 칸 (2026-09-16)

## 변경 요약
이 커밋은 **문서·도움말만** 맞춘다. `src/`는 바꾸지 않는다.
Android에서 목록 **PDF**·**한글(HWPX)** 저장 시, 미리보기에 둔 글 칸이 그 파일 속 사진에 들어간다. 앱에 두는 원본 사진은 그대로다. 웹 내보내기는 글 칸을 넣지 않는다. 권장 APK는 이미 배포된 `VoiceStamp_20260916_002642.apk`이다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | 본 문서 |
| **재사용·수정** | `public/help.html`, `docs/CHANGELOG.md`, `docs/PRD.md`, `docs/PLAN.md`, `docs/PROJECT.md`, `docs/README.md`, `수정기록.txt` |
| **재사용(무수정)** | `src/` 전체, `exportOnDemand.ts`(버튼 시 로드 유지), 랜딩 APK 주소(`002642`) |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 시스템 글꼴만 사용. 프로젝트에 넣은 OFL 폰트 파일도 없음.

## 의존성·GPL
- npm 추가 없음. 번들 A/B/C 재패치 없음.
- GPL 단독 신규 없음. 기존 트리의 dual-license 패키지는 유지.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음. 글 칸은 기기 안에서만 합성 |
| 입력 | 글 칸 상한·제어문자 제거 유지. 원본 파일을 덮어쓰지 않음 |
| Play | 새 권한 없음. 내보내기 사본에만 글을 넣음 |

## 저작권·독자성
- 식별자 `NOTE_PAD_IN_EXPORTS_HOST`, `restore-note-pad-in-exports`는 이 프로젝트 전용.
- 공개 검색에서 동일 식별자 구현을 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 사진 위 글을 내보내기 이미지에 합성하는 구성은 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
기능 코드 되돌리기: `restore-note-pad-in-exports.bat` (이 커밋에는 넣지 않음. 소스 수정 금지)

## 배포
- APK: `VoiceStamp_20260916_002642.apk` (재빌드 없음)
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260916_002642.apk
