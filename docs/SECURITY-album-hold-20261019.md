# 보안·라이선스·특허 점검 — 앨범 사진 앱 폴더 보관 (2026-10-19)

## 변경 요약
갤러리에서 고른 사진을 저장 화면을 열기 전에 앱 문서 폴더 `album-hold/`의 JPEG로 옮긴다. 저장은 그 파일을 복사한다. 담지 못하면 저장 화면을 열지 않고 안내한다. 창을 닫으면 그 임시 파일만 지운다.

헬스체크 번들 A·B·C는 다시 넣지 않았다. 촬영 품질·긴 변 상한·갤러리 백업 큐·내보내기 지연 로드는 그대로다. 복사에 성공하면 이미지를 다시 디코드하지 않는다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-album-hold.bat`, 본 문서 |
| **재사용·수정** | `src/services/fileService.ts`, `src/components/StampListScreen.tsx`, `public/help.html`, `RESTORE.md`, `수정기록.txt` |
| **재사용(무수정)** | `src/services/saveStamp.ts`, `src/services/pickStampImage.ts`, `src/services/gallerySaveIdleQueue.ts` |
| **스냅샷** | `src.pre-album-hold/`, `public.pre-album-hold/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 앱 글자는 기기 기본 글꼴. 코드의 `monospace`는 시스템 고정폭이다.

## 의존성·GPL
- npm 추가 없음.
- 이번 경로가 쓰는 기존 패키지: `expo-file-system` 56.0.7 MIT, `expo-image-manipulator` 56.0.17 MIT (복사 실패 시에만 동적 import).
- GPL 단독 신규 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 없음. 기기 안 파일만 복사 |
| 경로 | 대상 파일 이름은 앱이 만든다. 원본 경로를 파일 이름으로 쓰지 않음 |
| 삭제 | `documentDirectory/album-hold/` 아래 `[영숫자-].jpg`만 삭제. `..` 거부 |
| 입력 | `file://`, `content://`, `ph://`, 절대 경로만 받는다 |
| 권한 | 새 권한 없음. 기존 앨범 읽기만 사용 |
| Play | 수집 데이터·서명·패키지 변경 없음. 사용자가 고른 사진을 앱 저장소에 두는 기존 동작의 시점만 앞당김 |

## 저작권·독자성
- 식별자 `stageIncomingAlbumImage`, `discardIncomingAlbumImage`, `album-hold`는 이 저장 흐름용으로 새로 지었다.
- 외부 구현을 복사하지 않았다. 파일 복사와 JPEG 다시 쓰기는 이미 이 저장소의 `copyAsync`·`manipulateAsync` 사용과 같다.

## 특허 검토 메모 (보장 아님)
- 구성: 사용자가 고른 사진을 폼을 열기 전에 앱 개인 저장소의 JPEG로 두고, 저장 시 그 파일을 스탬프 폴더로 복사한다.
- 이건 로컬 파일 보관이다. 청구항과 1:1로 맞출 특수 인코딩·전송·워터마크 단계는 없다.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-album-hold.bat`

## 배포
- APK: `VoiceStamp_20261019_224203.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20261019_224203.apk
- 설정 앱 정보 버전 옆에 같은 파일명이 표시된다.
