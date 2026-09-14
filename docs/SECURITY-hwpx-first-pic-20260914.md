# 보안·라이선스·특허 점검 — HWPX 첫 사진 누락 보정 (2026-09-14)

## 변경 요약
한글이 넣은 사진 표 서식을 채울 때, 첫 스탬프 사진이 빠지거나 표 밖으로 넘치는 문제를 기존 `hwpxTemplate.ts`만 고친다.

1. 서식의 `content.hpf` 그림 항목을 파일 이름·형식에 맞게 고친 뒤, 쓰지 않는 BinData를 지운다. 기존 `image1.PNG`가 있으면 같은 바이트를 그 이름에도 남겨, 한글이 PNG 경로를 보더라도 파일이 있게 한다.
2. 표가 있으면 표 너비를 칸에 맞춘 다음, 그림은 표 안쪽 여백을 뺀 크기에 맞춘다.
3. 첫 스탬프는 제목 다음 페이지에서 시작한다(`pageBreak`). 2장째부터는 기존 「페이지당 사진 수」 배치를 유지한다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-hwpx-first-pic.bat`, 본 문서 |
| **재사용·수정** | `src/services/hwpxTemplate.ts`, `public/help.html` |
| **재사용(무수정)** | `src/services/exportHwpx.ts`, `src/services/exportOnDemand.ts`, `jszip` MIT |
| **스냅샷** | `src.pre-hwpx-first-pic/`, `public.pre-hwpx-first-pic/` |

## 글꼴 (OFL)
- 패키지에 `.ttf`/`.otf` 등 글꼴 파일 없음. OFL 글꼴 파일도 추가하지 않음.
- 앱 화면은 기존처럼 시스템 글꼴만 사용한다.
- 서식이 가리키는 화면 글자 이름(함초롬 계열)은 한글이 저장한 이름만 쓰며, 앱이 해당 파일을 배포하지 않음.

## 의존성·GPL
- npm 추가 없음. `package.json` 의존성 그대로.
- jszip 3.10.1은 **MIT** 경로로 사용·배포. GPL-3.0-or-later 경로는 선택하지 않음.
- 새 네이티브 모듈 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 보내기 채우기에 바깥 URL 없음 |
| 보내기 | 목록에서 고른 사진만 BinData에 넣음. 자리 글은 XML 이스케이프 |
| 파일 | 쓰는 경로는 `BinData/imageN.(jpg\|png)` 및 서식에 있던 같은 id 이름뿐. 경로 순회 없음 |
| Play | 새 권한·새 SDK 없음. 도움말은 기존 `/help` |

## 저작권·독자성
- 표 XML은 한글이 저장한 서식을 복제한다. 이번 수정은 패키지 항목 순서, 그림 크기, 첫 페이지 나눔만 맞춘다.
- 식별자 `tableInnerSlot`, `hwpx-first-pic`은 이 프로젝트 전용.
- 공개 HWPX 라이브러리(python-hwpx 등)의 함수명·처리 순서를 베끼지 않음. OWPML의 `opf:item`·`BinData`는 형식 이름이다.

## 특허 검토 메모 (보장 아님)
- 문서 보내기에서 사진을 표 칸에 넣고, 첫 장을 제목 다음 쪽으로 넘기는 구성은 배치·문서 생성 계열 특허와 겹칠 수 있어 **별도 검토가 필요**하다.
- 페이지당 장수(1·2·3·4)에 맞춘 쪽/단 나눔도 같은 범주다.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-hwpx-first-pic.bat`

## 배포
- APK: `VoiceStamp_20260914_131007.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260914_131007.apk
- 한글 앱에서 첫 사진이 보이는지는 이 환경에서 최종 확인하지 못함. 기기 확인 필요.
