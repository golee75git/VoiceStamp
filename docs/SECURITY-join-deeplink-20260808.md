# 보안·라이선스·특허 점검 — 사업 참여 딥링크 (2026-08-08)

## 변경 요약
- `https://…/join?p&c` / `voicestamp://join?p&c` 로 앱을 열면 **코드로 참여** 화면으로 이동(코드 자동 채움).
- **구분 표시 필수 + 참여 확인** 유지. 자동 촬영·자동 연결 없음.
- 참여 확인 시 사업 취합 설정을 「사용」으로 켬.
- `join.html`에 「앱에서 참여」(Android intent + scheme) + APK 안내.
- `app.json`: scheme `voicestamp`, `/join` intentFilter (`autoVerify: false`).
- **신규 npm 없음** (`react-native` `Linking` 재사용).

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `src/services/projectJoinLink.ts`, `restore-join-deeplink.bat`, 본 문서 |
| **수정** | `App.tsx`, `MainScreen.tsx`, `ProjectCollectScreen.tsx`, `app.json`, `public/join.html`, `public/help.html`, `RESTORE.md` |
| **재사용** | 기존 참여·구분표시·카메라 이동 |
| **스냅샷** | `src.pre-join-deeplink/`, `public.pre-join-deeplink/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 링크 비밀 | 기존과 동일: URL에 참여코드 포함. 업로드만 가능(PIN 없음) |
| 원탭 남용 | 구분 표시·Alert 확인 없이는 연결·촬영 루트 진입만 |
| intentFilter | `autoVerify: false` — 검증된 App Links 아님. 선택 창/명시 버튼으로 앱 오픈 |
| Data safety | 신규 수집 필드 없음. 참여 시 기존 mark·업로드 경로 |

## 특허
- 특허 비침해 보장하지 않음. 커스텀 스킴·참여 딥링크는 일반 패턴일 수 있음.

## 롤백
`restore-join-deeplink.bat` 후 **APK 재빌드**(app.json 네이티브 변경).
