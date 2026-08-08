# VoiceStamp 배포 채널 · 서명 · 버전 정책

| 항목 | 내용 |
|------|------|
| 문서 작성 | 2026-08-08 |
| 배포 단계 | **베타·내부 테스트** (Play 정식 출시 전) — [LICENSE-NOTICE.md](./LICENSE-NOTICE.md) |
| 관련 | [BUILD-APK.md](../BUILD-APK.md) · [PLAN.md](./PLAN.md) LEG-05 · `eas.json` |

`app.json` 앱 버전명은 **1.0.0** 유지. 테스터 빌드 구분은 **APK 파일명(빌드 시각)** 과 설정 화면 `apkBuildLabel.ts` 표시.

---

## 1. 채널 요약

| | **테스터 APK (현재 주 채널)** | **스토어 릴리스 (목표)** |
|--|-------------------------------|---------------------------|
| 빌드 | `build-apk.bat` → Release APK | EAS `production` → **AAB** |
| 배포 | GitHub `releases/` + 랜딩 다운로드 | Play Console (Internal → Closed → Production) |
| 서명 | 로컬 Gradle 서명 (테스터용) | **Play App Signing** + 업로드 keystore |
| 버전 표기 | `VoiceStamp_YYYYMMDD_HHmmss.apk` | `versionName` + 단조 증가 `versionCode` |
| `eas.json` | 기존 `preview` = internal APK | `production` AAB 프로필 추가 예정 |

---

## 2. 테스터 채널 규칙 (유지)

1. 산출물은 dated APK만. 목적: 현장 파일럿·빠른 검증.
2. 설정 「앱 정보」의 APK 파일명 = **테스터 빌드 ID** (스토어 `versionName`과 혼동하지 않음).
3. 랜딩·`/info` 다운로드는 테스터 APK. 「베타」 성격 유지.
4. 서명 키가 바뀌면 기존 앱 삭제 후 재설치.
5. 정식 출시본으로 홍보하지 않음.

---

## 3. 스토어 채널 규칙 (전환 시)

1. Play에는 **AAB만** 업로드. 사이드로드 APK는 테스터 채널로 분리.
2. 업로드 keystore는 Git에 넣지 않고 금고에 백업.
3. 테스터 APK와 **동일 업로드 키**면 사이드로드→Play 업그레이드 가능.  
   키가 다르면 `applicationId` suffix(예: `.beta`)로 패키지 분리 권장.
4. 트랙: Internal testing → Closed → Production. Production 전 **LEG-05** 완료.
5. `versionCode`는 매번 +1, 절대 감소 금지. `eas.json`의 `appVersionSource: "remote"`와 로컬 `build-apk.bat` **이중 진실**을 피하려면 스토어 갈 때 remote(또는 단일 문서화 스크립트)로 통일.

---

## 4. 병행 운영

| 상황 | 규칙 |
|------|------|
| 같은 날 테스터 + Play | 기능 커밋/태그 동일, 산출물만 구분 |
| 핫픽스 | 테스터 APK 검증 → 같은 커밋으로 AAB |
| 사이트 | 출시 전·후 모두 dated APK는 베타 채널. Play 링크는 출시 후 별도 CTA |
| 진실 원천 | Play `versionCode` (스토어) / APK 파일명 (테스터) |

---

## 5. 전환 체크리스트 (LEG-05 연계)

- [ ] 업로드 keystore 생성·백업
- [ ] Play App Signing 등록
- [ ] 테스터 서명 = 업로드 키 여부 결정 (또는 `.beta` 패키지)
- [ ] `eas.json`에 `production` AAB 프로필
- [ ] Internal testing AAB 1회 + 테스터 APK 기능 동등성 확인
- [ ] Data safety ↔ `/privacy` · OSS 고지 · 스토어 문구·스크린샷
- [ ] `LICENSE-NOTICE` 배포 단계「베타」→「Play」갱신
- [ ] Production + 랜딩 Play CTA; dated APK는 베타로 격하

---

## 6. 최소 전환 순서

1. keystore·패키지 ID 정책 결정  
2. `production` AAB 프로필  
3. Internal testing  
4. `versionCode` 표·CHANGELOG에 스토어 빌드 행 시작  
5. Production 및 사이트 링크 정리  

특허 비침해를 보장하지 않음. 본 문서는 배포·버전 운영 정리이며 법무 확정이 아님.
