# 카카오 REST API 키 보안 체크리스트

VoiceStamp는 위치 기반 제목(구·동·건물명)에 [카카오 로컬 API](https://developers.kakao.com/docs/latest/ko/local/dev-guide)를 사용합니다.  
환경 변수: `EXPO_PUBLIC_KAKAO_REST_KEY`

---

## 1. 왜 git 제외만으로는 부족한가

| 구분 | 설명 |
|------|------|
| `EXPO_PUBLIC_*` | Expo가 **클라이언트 번들(APK·웹 JS)** 에 포함 |
| `.gitignore` | **저장소 유출**만 방지, APK/웹 추출은 방지 못함 |
| 위험 | 키 탈취 → API 호출 남용 → **할당량·과금·키 정지** |

키가 없으면 위치 제목 기능만 비활성화되고, 날짜·시간 제목은 그대로 동작합니다.

---

## 2. 카카오 Developers 설정 체크리스트

[Kakao Developers](https://developers.kakao.com) → 내 애플리케이션 → 해당 앱

### 2.1 제품 활성화

- [ ] **제품 설정 → 카카오맵 → 사용 설정 ON** (로컬 API 포함)

### 2.2 키 종류·용도

- [ ] **REST API 키**를 VoiceStamp에 사용 (JavaScript 키와 혼동 금지)
- [ ] 테스트용·운영용 앱을 분리할 경우 **키도 분리**

### 2.3 플랫폼 등록 (가능한 범위에서 제한)

| 플랫폼 | 등록 값 | VoiceStamp 기준 |
|--------|---------|-----------------|
| Android | 패키지명 + 키 해시 | `com.voicestamp.app` (`app.json`) |
| Web | 사이트 도메인 | `voicestamp-gilt.vercel.app` (배포 URL 확인) |

- [ ] Android 플랫폼에 패키지명 등록
- [ ] Web 플랫폼에 **프로덕션 도메인만** 등록 (와일드카드·불필요 도메인 제외)
- [ ] 카카오 콘솔에서 **허용되지 않은 출처 호출 차단** 옵션이 있으면 활성화

> 카카오 정책·콘솔 UI는 변경될 수 있습니다. [공식 문서](https://developers.kakao.com/docs/latest/ko/getting-started/app-key)를 최종 기준으로 확인하세요.

### 2.4 키 관리

- [ ] REST API 키를 채팅·스크린샷·공개 이슈에 **올리지 않음**
- [ ] `.env`는 로컬·Vercel Environment Variables에만 보관
- [ ] APK를 외부에 배포했다면 **키 유출을 전제**하고 주기적 점검
- [ ] 유출 의심 시 **키 재발급** → `.env`·Vercel·**APK 재빌드** 순서로 반영

---

## 3. 로컬·배포 환경

### 3.1 로컬 `.env`

```env
EXPO_PUBLIC_KAKAO_REST_KEY=your_rest_api_key_here
```

- [ ] 프로젝트 루트 `.env` 존재 (git 미추적 확인)
- [ ] `.env.example`은 **키 없이** 변수명만 공유 (선택)

### 3.2 Vercel

- [ ] Project → Settings → Environment Variables  
  `EXPO_PUBLIC_KAKAO_REST_KEY` = (Production / Preview 필요 시)
- [ ] 배포 후 웹에서 위치 제목 동작 확인

### 3.3 APK 빌드

- [ ] `.env` 변경 후 **`build-apk.bat` 재실행**
- [ ] 반영 안 될 때: `cd android && gradlew.bat clean assembleRelease` (PROJECT.md §7.2)
- [ ] `VoiceStamp_*.apk`를 공개 저장소·메신저에 **키 포함 전제로** 올리지 않도록 주의

---

## 4. git·저장소 점검

- [ ] `git log --all -- .env` — 과거 커밋에 `.env` 없음
- [ ] `git grep -i kakaoak` — 소스에 하드코딩된 키 없음
- [ ] 공개 repo: Issues·PR에 키 붙여넣기 금지

---

## 5. 장기 개선 (선택)

클라이언트에 REST 키를 두는 구조의 근본적 한계를 줄이려면:

| 방안 | 설명 |
|------|------|
| **서버 프록시** | Vercel Serverless / Cloudflare Worker에서 좌표→주소 변환, 키는 서버만 보유 |
| **기능 끄기** | 키 미설정 시 현재처럼 위치 제목만 생략 |
| **호출 제한** | 앱 내부에서 위치 조회 빈도·캐시 강화 (소스 변경 필요) |

현재 VoiceStamp는 **키 없이도 핵심 기능 사용 가능**합니다.

---

## 6. 관련 코드·문서 (참고만, 수정 없음)

| 위치 | 내용 |
|------|------|
| `src/services/kakaoLocal.ts` | 카카오 API 호출 |
| `src/services/locationService.ts` | GPS → 카카오 연동 |
| `docs/PRD.md` §6.1 | API·환경 변수 |
| `docs/PRIVACY.md` | 위치·제3자 제공 안내 |

---

## 7. 점검 기록 (수기)

| 날짜 | 점검자 | Android 등록 | Web 도메인 | 키 재발급 | 비고 |
|------|--------|--------------|------------|-----------|------|
| | | ☐ | ☐ | ☐ | |
