# 보안·라이선스 점검 — QR URL 연결확인 (2026-08-01)

## 변경 범위
- `src/services/qrUrlConnectCheckService.ts`: 사용자 입력 http(s) 접속 프로브 (타임아웃·credentials omit·사설망 차단)
- `StampSaveModal`: QR URL 칸 아래 「연결확인」 버튼 (저장 강제와 분리)
- `SettingsScreen` 힌트·`public/help.html` 안내

## 취약점·보안
| 항목 | 결과 |
|------|------|
| 신규 권한 | 없음 (기존 INTERNET) |
| URL 검증 | 기존 `normalizeHttpUrl` — http(s)만, credentials 거부 |
| SSRF형 프로브 | localhost·RFC1918·링크로컬·CGNAT·ULA·리다이렉트 최종 호스트 차단 |
| 응답 본문 | 저장·표시하지 않음 (`credentials: 'omit'`) |
| 타임아웃 | 8초 AbortController |
| 저장 영향 | 연결 실패해도 저장은 막지 않음 (안내만) |
| XSS | Alert 문자열만 표시, HTML 삽입 없음 |

## 저작권·독자성
- VoiceStamp 자체 `normalizeHttpUrl` + 표준 `fetch` 조합. 제3자 URL 검사 SDK·특허 클레임 코드 없음.

## 라이선스·의존성
- 신규 npm / Gradle 의존성 없음.

## Play Store
- Data safety: 사용자가 「연결확인」을 눌렀을 때만 입력한 URL로 짧은 GET. 앱 서버로 URL을 중계하지 않음.
- 권한·광고 ID·백그라운드 스캔 없음.

## 롤백
`restore-qr-url-check.bat`
