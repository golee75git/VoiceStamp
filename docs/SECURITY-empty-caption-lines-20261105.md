# 보안·라이선스·특허 점검 — 빈 칸은 별도 영역·워터마크에서 빼기 (2026-11-05)

## 변경 요약
저장·수정 미리보기와 같은 글이 들어가는 PDF·이미지·한글에서, 제목·장소·메모·추가 칸이 비어 있으면 그 줄을 그리지 않는다. 빈 제목에 「(제목 없음)」을 넣지 않는다. 장소 칸이 비어 있으면 층만 있는 줄도 넣지 않는다. 좌표 표기가 GPS 또는 좌표이고 좌표가 있으면 좌표 줄은 남긴다. 하단 촬영 일시가 표시이면 별도 영역 맨 아래 일시는 남긴다. 목록·휴지통의 「(제목 없음)」은 그대로다.

헬스체크 번들 A·B·C는 다시 넣지 않았다. 촬영 품질, 갤러리 백업 큐, 내보내기 지연 로드는 그대로다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-empty-caption-lines.bat`, 본 문서 |
| **재사용·수정** | `src/services/pdfTitleFormat.ts`, `src/services/captionTable.ts`, `src/services/stampPlace.ts`, `src/services/exportStampImage.ts`, `src/services/exportPdf.ts`, `src/services/renderStampWatermarkNative.ts`, `src/components/StampSavePreview.tsx`, `src/components/StampExportCard.tsx`, `src/components/SettingsScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/LICENSE-NOTICE.md`, `수정기록.txt` |
| **재사용(무수정)** | `src/services/stampCoords.ts`, `src/services/pdfTitleFormat.ts`의 `pdfDisplayTitle`(목록용 자리 문구), `src/services/saveStamp.ts` |
| **스냅샷** | `src.pre-empty-caption-lines/`, `public.pre-empty-caption-lines/` |

## 글꼴 (OFL)
- 글꼴 파일을 추가하지 않았다. 저장소에 번들된 `.ttf`·`.otf`도 없다.
- 화면·도움말·랜딩은 기기·브라우저 기본 글꼴(`system-ui`)만 쓴다. OFL 글꼴을 새로 넣지 않았다.

## 의존성·GPL
- npm·Gradle 패키지를 추가하지 않았다.
- GPL을 새로 고르지 않았다. 기존 `jszip` 3.10.1은 MIT OR GPL-3.0-or-later이며, 이 프로젝트는 MIT만 사용한다. `node-forge`는 BSD-3-Clause만 사용한다.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 없음. 이미 있는 글자만 그릴지 말지 고른다 |
| 저장 | 제목·장소·층·메모를 DB에 넣는 방식은 그대로다. 빈 칸을 지우거나 기본 제목으로 바꾸는 저장 경로는 건드리지 않음 |
| 입력 | 표시 직전에 앞뒤 공백만 본다. HTML 내보내기는 기존 `escapeHtml`을 그대로 탄다 |
| 권한 | 새 권한 없음 |
| Play | 수집 데이터·서명·패키지 이름 변경 없음. 사용자에게 보이는 글만 줄어든다 |

## 저작권·독자성
- `captionFieldTitle`는 이 앱의 캡션 줄용으로 새로 두었다. 목록용 `pdfDisplayTitle`과 역할을 나눴다.
- 외부 저장소의 구현을 복사·번역하지 않았다. 빈 문자열이면 줄을 생략하는 분기다.

## 특허 검토 메모 (보장 아님)
- 구성: 입력 칸이 비어 있으면 사진 아래 표와 사진 위 글 막대에서 그 줄을 빼고, 장소 글자가 없으면 층 글자도 뺀다. 좌표와 촬영 일시는 기존 설정이 켜져 있을 때만 남긴다.
- 촬영, 위치 산출, 워터마크 합성 방식은 바꾸지 않았다. 청구항과 맞춰 볼 새로운 인코딩·전송 단계는 없다.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-empty-caption-lines.bat`
