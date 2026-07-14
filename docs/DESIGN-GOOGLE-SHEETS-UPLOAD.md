# VoiceStamp → Google Sheets 원클릭 업로드 설계 (GS-UPLOAD-01)

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2026-07-14 |
| 상태 | 📋 **초안만** (구현·소스 변경 없음) |
| 기능 ID | **GS-UPLOAD-01** |
| 연동 모드 | **개발자 공용 시트 1개** (모든 업로드 → 동일 Drive/시트) |
| 관련 초안 | [drafts/google-sheets-upload/](./drafts/google-sheets-upload/) |
| 관련 코드(참고만) | `src/services/pdfImageForExport.ts` (압축 프로필), `StampListScreen` 내보내기 바 |

> **범위:** 목록에서 선택한 스탬프를 **JPEG 압축 후** Google Apps Script 웹앱으로 **건별** 전송하고, 개발자 Drive에 저장·스프레드시트에 1행 추가.  
> **이 문서와 drafts 폴더만 추가.** 앱 `src/` 수정·연동은 별도 구현 단계에서 수행.

---

## 1. 배경·목표

### 1.1 목표

| 목표 | 설명 |
|------|------|
| G1 | 목록 **원클릭** 업로드 (사용자 Apps Script 설정 없음) |
| G2 | 사진 **압축** 후 업로드 (기존 PDF `compressed`: 긴 변 1024 / JPEG 0.55) |
| G3 | 메타(제목·메모·층·좌표·장소) + Drive **이미지 URL**을 공용 시트에 기록 |
| G4 | Apps Script 한도 회피 — **스탬프 1건 = HTTP 1회** |
| G5 | 구현 시 되돌리기 — `src.pre-gs-upload/` + `restore-gs-upload.bat` (구현 단계에서 추가) |

### 1.2 비목표 (Out of Scope · 초안 기준)

| 항목 | 이유 |
|------|------|
| 사용자별 시트 / OAuth 로그인 | 「공용 시트」 결정 |
| 여러 장을 한 POST에 묶기 | Apps Script 용량·시간 불안정 |
| ZIP 일괄 업로드 1차 | 2차로 검토 가능 |
| Play 스토어 공개용 보안 강화(프록시 서버) | 내부·제한 배포 전제; 공개 시 재설계 |

---

## 2. 아키텍처

```
[VoiceStamp 앱]
  선택 스탬프 N개
       │
       ├─ 각 사진: expo-image-manipulator (1024 / 0.55 JPEG)
       ├─ base64 + 메타 JSON
       └─ POST × N  (순차, 동시 1)
              │
              ▼
[Google Apps Script 웹앱]  doPost
       │
       ├─ token 검증
       ├─ DriveApp → 폴더 VoiceStamp/ 에 JPEG 생성
       └─ Spreadsheet 「Stamps」시트 appendRow (+ imageUrl)
```

대상 계정: **개발자 Google 계정 1개** (웹앱 실행 주체 = 나).

---

## 3. API 계약 (초안)

### 3.1 요청

- **Method:** `POST`
- **URL:** 웹앱 배포 URL (`…/macros/s/…/exec`)
- **Header:** `Content-Type: text/plain;charset=utf-8`  
  (JSON이어도 plain이면 프리플라이트·리다이렉트 이슈가 적음)
- **Body:** JSON 문자열

```json
{
  "token": "<SHARED_SECRET>",
  "id": "stamp-uuid",
  "title": "제목",
  "memo": "메모",
  "createdAt": 1710000000000,
  "latitude": 37.5,
  "longitude": 127.0,
  "floor": "2",
  "placeLabel": "○○초등학교",
  "imageBase64": "<JPEG base64, data: 접두사 없음>",
  "mimeType": "image/jpeg"
}
```

| 필드 | 필수 | 비고 |
|------|------|------|
| `token` | Y | Apps Script `SECRET`과 동일 |
| `id` | Y | 스탬프 id (파일명에도 사용) |
| `imageBase64` | Y | 압축 JPEG만 |
| `title` / `memo` | N | 없으면 빈 문자열 |
| `createdAt` | N | ms epoch; 없으면 서버 시각 |
| `latitude` / `longitude` / `floor` / `placeLabel` | N | null 허용 |

### 3.2 성공 응답

```json
{ "ok": true, "id": "stamp-uuid", "url": "https://drive.google.com/…", "fileId": "…" }
```

### 3.3 실패 응답

```json
{ "ok": false, "error": "unauthorized" | "missing_image" | "too_large" | "…" }
```

HTTP 상태코드는 Apps Script 웹앱 특성상 항상 200인 경우가 많음 → **본문 `ok` 필드로 판별**.

### 3.4 제한 (앱·스크립트 공통)

| 제한 | 권장 값 |
|------|---------|
| 이미지 | JPEG, 긴 변 ≤ 1024, 목표 파일 ≈ 100~400KB |
| base64 대략 상한 | **4MB** (초과 시 스크립트가 `too_large`) |
| 동시 요청 | **1** (순차) |
| 재시도 | 네트워크 실패 시 건당 최대 **2회** |
| 1회 UX 선택 상한 | **20장** (초과 시 안내 후 truncate 또는 거부) |

---

## 4. 시트·Drive 스키마

### 4.1 Drive

- 폴더명: `VoiceStamp` (없으 면 생성)
- 파일명: `{id}.jpg` (동일 id 재업로드 시 **새 파일** 추가; 덮어쓰기 아님 — 초안. 구현 시 `fileId` 열로 중복 정책을 정할 수 있음)

### 4.2 시트 `Stamps` 열 (1행 헤더)

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| uploadedAt | id | title | memo | createdAt | latitude | longitude | floor | placeLabel | imageUrl | driveFileId |

---

## 5. 앱 구현 가이드 (구현 시 · 지금은 적용하지 않음)

### 5.1 신규 파일 (예정)

| 파일 | 역할 |
|------|------|
| `src/services/exportGoogleSheet.ts` | 압축 + `fetch` 루프 + 진행 콜백 |
| (선택) `.env` | `EXPO_PUBLIC_GS_UPLOAD_URL`, `EXPO_PUBLIC_GS_UPLOAD_TOKEN` |

초안 TypeScript 계약: [`drafts/google-sheets-upload/client-api.draft.ts`](./drafts/google-sheets-upload/client-api.draft.ts)

### 5.2 UI (예정)

- `StampListScreen`: PDF/엑셀 바와 동일 패턴으로 **「시트」** 버튼
- `exportBusy`에 `gsBusy` 포함
- 진행: `Alert` 또는 인라인 `{done}/{total}`

### 5.3 압축

- `pdfImageForExport`의 `compressed` 프로필과 **동일 수치** 재사용 (또는 해당 함수 export)
- `data:image/jpeg;base64,` 접두사 제거 후 `imageBase64`로 전송

### 5.4 환경 변수 (예정)

```
EXPO_PUBLIC_GS_UPLOAD_URL=https://script.google.com/macros/s/XXXX/exec
EXPO_PUBLIC_GS_UPLOAD_TOKEN=<긴 랜덤 문자열>
```

> `EXPO_PUBLIC_*`는 APK에 포함됨 → [§7 보안](#7-보안·개인정보) 참고.

---

## 6. Apps Script 배포 체크리스트

초안 스크립트: [`drafts/google-sheets-upload/Code.gs`](./drafts/google-sheets-upload/Code.gs)

1. [ ] Google 시트 생성 → 시트 탭 이름 `Stamps` (없어도 스크립트가 생성)
2. [ ] 확장 프로그램 → Apps Script → `Code.gs` 붙여넣기
3. [ ] `SECRET`을 긴 랜덤 값으로 교체
4. [ ] 배포 → 새 배포 → 유형 **웹 앱**
   - 실행: **나**
   - 액세스: **모든 사용자**
5. [ ] 배포 URL 복사
6. [ ] PC에서 `curl`/Postman으로 JPEG 1장 테스트
7. [ ] Drive `VoiceStamp` 폴더·시트 행 확인

### 6.1 로컬 스모크 (예시)

```bash
# image.b64 = JPEG의 base64 한 줄
curl -L -X POST "https://script.google.com/macros/s/XXXX/exec" ^
  -H "Content-Type: text/plain;charset=utf-8" ^
  --data-binary "@payload.json"
```

---

## 7. 보안·개인정보

| 위험 | 내용 | 완화(초안) |
|------|------|------------|
| 토큰 노출 | APK/웹에서 URL·토큰 추출 가능 | 긴 SECRET, 주기적 교체·재배포; **불특정 다수 스토어면 공용 시트 비권장** |
| 스팸 업로드 | URL 알면 Drive 용량 소모 | `too_large` 검사, 일일 건수 제한(스크립트 PropertiesService — 2차) |
| 개인정보 | 사진·위치·메모가 개발자 Drive로 이동 | PRIVACY/도움말에 “개발자 수집 시트” 명시, 동의 UX(구현 시) |
| 링크 공개 | `ANYONE_WITH_LINK` 시 링크 아는 자 열람 | 초안은 VIEW 링크; 내부만이 면 **비공개**로 바꿔 시트에 fileId만 남겨도 됨 |

카카오 키와 동일하게: git에 실토큰 커밋 금지. 초안의 `Code.gs`는 플레이스홀더만 둠.

---

## 8. 라이선스·의존성

| 의존성 | 용도 | 비고 |
|--------|------|------|
| `expo-image-manipulator` (기존) | 압축 | 추가 npm 불필요 |
| Google Apps Script / Drive / Sheets | 수신·저장 | Google 서비스 약관; 앱에 Google SDK 추가 없음 |
| `fetch` | HTTP | RN/Expo 기본 |

신규 유료 SDK·저작권 이슈 있는 라이브러리 없음.

---

## 9. 구현 단계 (향후)

1. Apps Script 배포·수동 1건 검증  
2. `exportGoogleSheet.ts` + env  
3. 목록 UI 버튼·진행률  
4. 도움말·PRIVACY 문구  
5. `restore-gs-upload.bat` / RESTORE 인덱스  
6. (선택) 일일 쿼터·중복 id 정책  

**현재 단계에서는 1~6을 코드로 적용하지 않는다.**

---

## 10. 초안 파일 목록

| 경로 | 설명 |
|------|------|
| `docs/DESIGN-GOOGLE-SHEETS-UPLOAD.md` | 본 설계 |
| `docs/drafts/google-sheets-upload/Code.gs` | Apps Script 붙여넣기용 |
| `docs/drafts/google-sheets-upload/client-api.draft.ts` | 앱 측 API 스케치 (src 아님) |
| `docs/drafts/google-sheets-upload/sample-payload.json` | 테스트용 payload 골격 |
| `docs/drafts/google-sheets-upload/README.md` | 초안 폴더 안내 |
