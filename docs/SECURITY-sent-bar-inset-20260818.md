# 보안·라이선스·특허 점검 — 보낸 사진 하단 바 여백 (2026-08-18)

## 변경 요약
- 보낸 사진 목록 하단 **실패 재전송**·**휴지통**을 수신 목록과 같이 시스템 단추 위에 둔다.
- 알약 배경·글자·동작은 그대로. 위치만 목록 아래 흐름으로 바꾸고 Android 아래 여백 56(iOS 28)을 넣는다.
- npm 없음. 권한·네트워크·저장 경로 변경 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-sent-bar-inset.bat`, 본 문서 |
| **재사용·수정** | `src/components/ProjectSentList.tsx`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `ProjectCollectScreen` 수신함 `bar`의 `paddingBottom` 값 |
| **스냅샷** | `src.pre-sent-bar-inset/`, `public.pre-sent-bar-inset/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 기존 시스템 UI.

## 의존성·GPL
- npm/Gradle 추가 없음. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 레이아웃 | 여백·배치만. 업로드·삭제 로직 변경 없음 |
| 수집 | 신규 없음 |
| Play | 데이터 유형·권한 변경 없음 |

## 저작권·독자성
- 같은 앱 수신함 하단 여백을 보낸 사진 바에 이어서 쓴 것. 외부 UI 키트 복사 없음.
- 식별자 `sent-bar-inset`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 하단 단추를 시스템 내비 위에 두는 구성은 일반 UX 수준일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-sent-bar-inset.bat`

## 배포
- APK: `VoiceStamp_20260818_094501.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260818_094501.apk
