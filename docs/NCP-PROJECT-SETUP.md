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
