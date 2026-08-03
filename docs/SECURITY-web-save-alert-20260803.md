# 보안·라이선스 메모 — 웹 저장 알림·사진 persist (2026-08-03)

## 범위

웹(`/app`)에서만 체감되는 저장 UX·사진 로컬 persist. 네이티브 APK 갤러리·ML 경로는 변경하지 않음.

## 보안

| 항목 | 판단 |
|------|------|
| 사진 전송 | 서버 업로드 없음. 브라우저 메모리·SQLite(로컬)만 사용 |
| `showAlert` | 기존 `confirmAlert.ts`의 `window.alert` 분기 재사용. 외부 스크립트 없음 |
| canvas 인코딩 | 사용자 선택/촬영 URI만 `Image`/`canvas`에 넣음. 임의 원격 URL을 새로 열지 않음 |
| 입력 | QR URL 검증·기존 `normalizeHttpUrl` 유지 |
| Play 스토어 | 웹 전용 수정. APK 권한·데이터 수집 문구 변경 없음 |

## 글꼴

앱·도움말은 기존과 같이 **시스템 UI 글꼴**만 사용. 이번 변경에서 폰트 파일을 추가하지 않음. OFL 글꼴 번들 없음(해당 없음).

## 의존성·GPL

- 신규 npm 패키지 **없음**
- 기존 `expo-file-system` / `react-native` / `expo-sqlite` 사용 방식 유지
- GPL 라이선스 패키지를 새로 끌어오지 않음
- `license-checker --production --summary`(2026-08-03): 대부분 MIT/ISC/Apache-2.0/BSD. 트리에 `(MIT OR GPL-3.0-or-later)`·`(BSD-3-Clause OR GPL-2.0)` 이중 허가 항목이 있으나 **선택적 비GPL 쪽으로 사용 가능한 기존 의존성**이며 이번 변경으로 추가되지 않음

## 특허 검토 메모 (비보장)

특허 비침해를 보장하지 않음. 이번 구성은 브라우저 `canvas`로 JPEG data URL을 만들고 로컬 DB에 넣는 일반적 클라이언트 저장이며, 별도 청구항 대조가 필요하면 제품 측에서 검토할 항목으로만 표시함.

## 취약점 점검 (요약)

- XSS: 신규 HTML 삽입 없음. 도움말은 정적 문구만 추가
- 경로 조작: 웹 persist는 파일 경로 대신 data URL 문자열만 반환
- 민감정보 로그: 신규 로그 출력 없음
