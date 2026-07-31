# 보안·라이선스 점검 — 왼손 카메라 홈 테마 (2026-07-31)

## 변경 범위
- UI only: `CameraScreen` 렌더 분기, `SettingsScreen` 힌트/비활성, `public/help.html` 문구
- 신규 네트워크·권한·네이티브 모듈·npm 의존성 **없음**
- 기존 번들 에셋만 사용 (`mainint1.png`, `settings-icon-black.png`, `list-icon-white-left.png`)

## 취약점·보안
| 항목 | 결과 |
|------|------|
| 외부 URL/스크립트 추가 | 없음 |
| 사용자 입력 반영 | 없음 (설정 enum `left`/`right`만) |
| 파일·DB 쓰기 경로 변경 | 없음 (`camera_hand`·`camera_home_bg` 키 유지) |
| 권한(카메라/마이크/위치) | 변경 없음 |
| 민감정보 로그 | 추가 없음 |

## 저작권·독자성
- 손잡이 설정값으로 홈 키비주얼·내비 아이콘을 분기하는 **앱 전용 UI 테마** 구현
- 제3자 SDK/특허 클레임 API 미사용; VoiceStamp 자체 에셋·레이아웃

## 라이선스·의존성
- 신규 패키지 없음 → `docs/LICENSE-NOTICE.md` / OSS 목록 재생성 **불필요**
- 기존 MIT 앱 라이선스·허용적 OSS 조건 유지

## Play Store 고려
- 권한 선언·Data safety 변경 없음
- 기능 설명: 접근성·왼손 사용자를 위한 UI 배치/대비 (광고·추적 없음)
- 스토어 등록 시 스크린샷에 왼손/오른손 홈 화면 차이를 반영하면 충분

## 롤백
`restore-camera-hand-theme.bat`
