# 보안·라이선스·특허 점검 — 목록 하단 갤러리·촬영 버튼 맞춤 (2026-08-03)

## 범위
- 저장 목록 하단 갤러리·촬영 이미지: `resizeMode` cover→contain, 높이 52→56
- 목록 하단 패딩 +4 (버튼 높이에 맞춤)
- 동작·권한·네트워크 변경 없음

## 파일 구분
| 구분 | 경로 |
|------|------|
| **수정(기존)** | `src/components/StampListScreen.tsx`, `public/help.html` |
| **신규** | `restore-list-bottom-btn-fit.bat`, 본 문서 |
| **스냅샷** | `src.pre-list-bottom-btn-fit/`, `public.pre-list-bottom-btn-fit/` |

## 보안
| 항목 | 결과 |
|------|------|
| 네트워크·저장 | 변경 없음 |
| Play | UI 레이아웃만. 권한·데이터 수집 변경 없음 |

## 라이선스·글꼴
- 새 의존성 없음. 시스템 글꼴만 사용(OFL 폰트 파일 추가 없음).
- GPL 신규 도입 없음.

## 저작권·특허
- 기존 자체 UI 스타일 수치·Image resizeMode 조정만.
- **특허 비침해 보장 표현 없음.** 레이아웃 여백은 일반 UI 관행.

## 되돌리기
`restore-list-bottom-btn-fit.bat`
