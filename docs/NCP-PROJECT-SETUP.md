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
| `server_error` + `detail: s3_put_403` + AccessDenied | Sub Account·암호화 확인 후 `ncpProbe`. CLI는 `AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED`로 Put 성공할 수 있음. API Put은 **path-style + 본문 SHA-256**(UNSIGNED-PAYLOAD Put 사용 안 함) |
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
- CORS: APK는 서버 경유 업로드(base64)라 클라이언트 PUT CORS 불필요  
- Lifecycle(권장): `voicestamp/projects/` 접두 7~30일 후 삭제  

## 앱

- 기본 API URL: `https://voicestamp-gilt.vercel.app/api/project`  
- 재정의: `EXPO_PUBLIC_PROJECT_API_URL`  

## 보안

- Access Key는 Vercel 환경변수만. APK·git 금지.  
- QR에는 uploadCode만. 취합 PIN은 QR에 넣지 않음.  
