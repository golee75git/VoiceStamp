# 보안·라이선스·특허 점검 — 공유 링크 참여→촬영 준비 UX (2026-08-11)

## 변경 요약
- 딥링크/공유 링크로 앱을 열면 참여 코드 자동 채움 + 안내 배너.
- 「구분 표시」입력 후 「연결 후 촬영」→ 확인 Alert 생략(다른 사업 전환 시만 확인) → 촬영 화면.
- 콜드스타트: `MainScreen`에서 `Linking.getInitialURL`도 처리(기존 stash 레이스 보완).
- `join.html`: Android에서 intent 앱 열기 1회 시도 + 문구 갱신.
- 도움말: 딥링크·구분 표시·촬영 이동 설명 갱신.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `ProjectCollectScreen.tsx`, `MainScreen.tsx`, `public/join.html`, `public/help.html` |
| **신규** | 본 문서, `restore-join-deeplink-ready.bat`, `*.pre-join-deeplink-ready/` |
| **재사용** | 기존 `parseProjectJoinLink`·intentFilters·`onJoinedGoCamera` (신규 npm 없음) |

## 글꼴 (OFL)
- 폰트 추가 없음.

## 의존성·GPL
- **신규 npm 없음.** GPL 미채택.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 딥링크 | 기존 `/join`·`voicestamp://`만. 신규 권한 없음 |
| 구분 표시 | 여전히 필수 — 수신 촬영자 구분 유지 |
| 자동 촬영 | **하지 않음** — 촬영 화면 준비만 |
| Data safety | 수집 항목 변경 없음 |
| 헬스체크 | 참여 UI·딥링크만 — A/B/C 미변경 |

## 특허
- 특허 비침해를 보장하지 않음. 딥링크 참여는 일반 관용 패턴일 수 있음.

## 롤백
```bat
restore-join-deeplink-ready.bat
```
