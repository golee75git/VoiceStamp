# VoiceStamp

사진 촬영 후 음성·텍스트로 제목·메모를 남기고, 스탬프로 저장·PDF 공유하는 Expo 앱입니다.

## 실행

```bat
npm install
npx expo start
```

Expo Go에서 QR 스캔 또는 `exp://<PC-IP>:8081` 입력.

## APK 빌드

```bat
build-apk.bat
```

출력: `VoiceStamp_YYYYMMDD_HHmmss.apk`, `VoiceStamp.apk`  
자세한 내용: [BUILD-APK.md](./BUILD-APK.md)

## 문서

| 문서 | 설명 |
|------|------|
| [docs/PRD.md](./docs/PRD.md) | 제품 요구사항 (PRD) |
| [docs/PROJECT.md](./docs/PROJECT.md) | 프로젝트 현황·기능 이력 |
| [docs/README.md](./docs/README.md) | 문서 목록 |
| [RESTORE.md](./RESTORE.md) | 기능별 되돌리기 |

## 되돌리기

기능 단위 복구: `restore-*.bat` 또는 [RESTORE.md](./RESTORE.md) (§8~36)
