# 보안·라이선스 점검 — QR URL 마이크·https:// 기본값 (2026-07-31)

## 변경 범위
- `StampSaveModal`: QR URL 칸을 `VoiceInputField`로 전환(기존 음성 파이프라인 재사용)
- 빈 칸 기본값 `https://`; 접두어만 있으면 저장 시 QR 없음(`null`)
- `public/help.html` 안내 문구

## 취약점·보안
| 항목 | 결과 |
|------|------|
| 신규 네트워크/권한 | 없음 (기존 마이크·저장 검증 재사용) |
| URL 검증 | 기존 `normalizeHttpUrl` — http(s)만, credentials 거부 |
| bare `https://` | QR 미저장(오류 대신 null) |
| XSS/원격 로드 | QR은 로컬 PNG 생성만 (기존과 동일) |

## 저작권·독자성
- 기존 VoiceStamp 음성 삽입·QR 캡션 UX 확장. 신규 SDK 없음.

## 라이선스·의존성
- 신규 npm/Gradle 없음.

## Play Store
- 권한·Data safety 변경 없음. 마이크는 기존 음성 입력과 동일 opt-in 사용.

## 롤백
`restore-qr-url-mic.bat`
