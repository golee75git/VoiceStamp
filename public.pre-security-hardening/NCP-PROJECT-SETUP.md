# NCP 사업 취합 설정 (FEAT-NCP-PROJECT-01)

| 항목 | 내용 |
|------|------|
| API | `POST https://voicestamp-gilt.vercel.app/api/project` |
| 스토리지 | NCP Object Storage `kr-standard` |
| 앱 | 설정 → 사업 취합 → 사용 |

## Vercel 환경 변수

| 이름 | 설명 |
|------|------|
| `NCP_ACCESS_KEY` | Object Storage 권한이 있는 서브 계정 Access Key |
| `NCP_SECRET_KEY` | Secret Key |
| `NCP_BUCKET` | Private 버킷 이름 |
| `PROJECT_PIN_SALT` | (권장) PIN·업로드 코드 해시용 소금 |

미설정 시 API는 `503 ncp_not_configured`를 반환합니다.

## 트러블슈팅

| 증상 | 확인 |
|------|------|
| `ncp_not_configured` | 세 env 모두 Production에 있는지, 배포 후인지 |
| `server_error` + `detail: s3_put_403` + AccessDenied | `ncpProbe`로 list·Put 변이 확인. 키가 SDK/콘솔에서 OK인데 API만 실패하면 서명 시각 형식(`x-amz-date`가 `…ZZ`면 버그)부터 볼 것. CLI는 `AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED` 권장 |
| SignatureDoesNotMatch | Access/Secret 짝 오타 |
| `hint` Resource가 `/버킷/voicestamp/projects/...` | 정상 경로(접두 `voicestamp/projects/`). 버킷 이름만 `NCP_BUCKET`에 넣고 경로를 넣지 말 것 |
| env 변경 후 | Vercel Redeploy 필수 |

### 권한 프로브 (비밀키 불필요)

```powershell
Invoke-RestMethod -Method POST -Uri "https://voicestamp-gilt.vercel.app/api/project" `
  -ContentType "application/json" -Body '{"action":"ncpProbe"}'
```

응답 예: `ok`, `bucket`, `accessKeyPrefix`(키 앞 6자). `ok:false` + AccessDenied이면 **그 Prefix의 Access Key**로 Sub Account Access Key 탭·정책을 대조하세요.

## 버킷

- ACL: Private  
- CORS: **APK는 클라이언트→NCP 직통 PUT/GET**을 씁니다. 네이티브는 CORS가 없어 버킷 CORS가 필수는 아닙니다. 웹 취합은 앱에서 숨겨 두었습니다.  
- Lifecycle(권장): `voicestamp/projects/` 접두 7~30일 후 삭제  

## 전송 경로

- 앱 → `prepareUpload` / `completeUpload` / `downloadUrl` (작은 JSON만 Vercel Function)  
- 사진 바이트 → NCP Object Storage **presigned PUT/GET** (Vercel 본문에 base64 없음)  
- 구 `upload`·`download`(base64) action은 `400`으로 거절합니다. 최신 APK 필요.

## 앱

- 기본 API URL: `https://voicestamp-gilt.vercel.app/api/project`  
- 재정의: `EXPO_PUBLIC_PROJECT_API_URL`  

## 보안

- Access Key는 Vercel 환경변수만. APK·git 금지.  
- QR에는 uploadCode만. 취합 PIN은 QR에 넣지 않음.  
