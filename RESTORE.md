# 되돌리기 가이드

문제가 생기면 아래 순서로 **초기 Expo 템플릿 상태**로 복구할 수 있습니다.

## 1. 앱 진입점 복구

```powershell
Copy-Item App.original.tsx App.tsx -Force
```

## 2. 추가 모듈 제거

```powershell
Remove-Item -Recurse -Force src
Remove-Item RESTORE.md
Remove-Item start.bat
```

## 3. 의존성 제거 (선택)

```powershell
npm uninstall expo-camera expo-sqlite expo-file-system expo-speech-recognition
```

## 4. app.json 복구

`app.json`의 `plugins` 항목을 삭제하거나 빈 배열로 되돌립니다.

```json
"plugins": []
```

## 5. 앱 데이터 초기화 (선택)

기기/에뮬레이터에서 앱 삭제 후 재설치하면 SQLite DB와 저장 이미지가 함께 초기화됩니다.

## 6. APK 빌드

반복 빌드 절차·소요 시간·오류 해결: **`BUILD-APK.md`** 참고.

### APK 빌드 설정만 되돌리기 (선택)

EAS/APK 설정 후 문제가 생기면 아래로 복구합니다.

```powershell
Copy-Item app.json.pre-eas app.json -Force
Remove-Item eas.json -ErrorAction SilentlyContinue
Remove-Item build-apk.bat, VoiceStamp.apk, VoiceStamp-debug.apk -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android
```

## 7. 웹 의존성만 되돌리기 (선택)

`react-dom`, `react-native-web` 추가 후 문제가 생기면 아래로 복구합니다.

```powershell
Copy-Item package.json.pre-web package.json -Force
npm install
```

## 변경 요약

| 구분 | 내용 |
|------|------|
| 수정 | `App.tsx`, `app.json`, `package.json` |
| 추가 | `src/`, `src.pre-edit/`, `src.pre-pdf/`, `src.pre-web-fs/`, `src.pre-web-pdf/`, `src.pre-pdf-name/`, `src.pre-settings/`, `src.pre-longpress/`, `src.pre-responsive/`, `src.pre-speech-append/`, `restore-edit.bat`, `restore-pdf.bat`, `restore-vercel.bat`, `restore-web-fs.bat`, `restore-web-pdf.bat`, `restore-pdf-name.bat`, `restore-settings.bat`, `restore-longpress.bat`, `restore-responsive.bat`, `restore-speech-append.bat`, `vercel.json`, `metro.config.js`, `package.json.pre-vercel`, `App.original.tsx`, `RESTORE.md`, `BUILD-APK.md`, `start.bat`, `build-apk.bat`, `apply-icon.bat`, `restore-icon.bat`, `assets.pre-icon`, `package.json.pre-web`, `package.json.pre-pdf`, `app.json.pre-eas`, `eas.json` |
| 미변경 | `app.json`, `index.ts`, DB 스키마, 카메라 화면 등 수정 기능 외 코드 |

## 8. 앱 아이콘 되돌리기 (선택)

커스텀 아이콘 적용 후 이전 `assets`로 복구합니다.

```powershell
Remove-Item -Recurse -Force assets
Copy-Item assets.pre-icon assets -Recurse
```

또는 프로젝트 루트에서:

```bat
restore-icon.bat
```

아이콘을 다시 적용하려면 `apply-icon.bat` 실행 후 `npx expo prebuild --platform android --no-install` 및 `build-apk.bat`로 APK를 다시 빌드하세요.

## 9. 목록 수정 기능만 되돌리기 (선택)

저장 목록 터치 수정 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-edit.bat
```

또는:

```powershell
Copy-Item src.pre-edit\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-edit\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-edit\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-edit\services\stampRepository.ts src\services\ -Force
```

되돌린 뒤 APK에 반영하려면 `build-apk.bat`으로 다시 빌드하세요.

## 10. PDF보내기 기능만 되돌리기 (선택)

저장 목록 PDF보내기 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf.bat
```

또는:

```powershell
Copy-Item src.pre-pdf\components\StampListScreen.tsx src\components\ -Force
Remove-Item src\services\exportPdf.ts -ErrorAction SilentlyContinue
Copy-Item package.json.pre-pdf package.json -Force
npm install
```

되돌린 뒤 APK에 반영하려면 `build-apk.bat`으로 다시 빌드하세요.

## 11. Vercel 웹 배포 설정만 되돌리기 (선택)

Vercel 배포 설정 후 문제가 생기면 아래로 복구합니다.

```bat
restore-vercel.bat
```

또는:

```powershell
Copy-Item package.json.pre-vercel package.json -Force
Remove-Item vercel.json -ErrorAction SilentlyContinue
Remove-Item metro.config.js -ErrorAction SilentlyContinue
```

## 12. 웹 사진 저장만 되돌리기 (선택)

Vercel 웹에서 사진 저장 지원 후 문제가 생기면 아래로 복구합니다.

```bat
restore-web-fs.bat
```

또는:

```powershell
Copy-Item src.pre-web-fs\services\fileService.ts src\services\ -Force
Copy-Item src.pre-web-fs\services\exportPdf.ts src\services\ -Force
```

## 13. 웹 PDF 사진 출력만 되돌리기 (선택)

Vercel 웹 PDF 사진 출력 지원 후 문제가 생기면 아래로 복구합니다.

```bat
restore-web-pdf.bat
```

또는:

```powershell
Copy-Item src.pre-web-pdf\services\exportPdf.ts src\services\ -Force
```

## 14. PDF 파일명 기능만 되돌리기 (선택)

PDF 기본 파일명(첫 사진 제목) 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-name.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-name\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-pdf-name\services\exportPdf.ts src\services\ -Force
```

## 15. 사진 저장 폴더 설정만 되돌리기 (선택)

앱 내부 저장 폴더 설정 후 문제가 생기면 아래로 복구합니다.

```bat
restore-settings.bat
```

또는:

```powershell
Copy-Item src.pre-settings\services\fileService.ts src\services\ -Force
Copy-Item src.pre-settings\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-settings\screens\MainScreen.tsx src\screens\ -Force
Copy-Item src.pre-settings\db\database.ts src\db\ -Force
Copy-Item src.pre-settings\db\schema.ts src\db\ -Force
Remove-Item src\services\settingsService.ts -ErrorAction SilentlyContinue
Remove-Item src\components\SettingsScreen.tsx -ErrorAction SilentlyContinue
```

## 16. 길게 누르기 선택만 되돌리기 (선택)

목록 길게 누르기 선택 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-longpress.bat
```

또는:

```powershell
Copy-Item src.pre-longpress\components\StampListScreen.tsx src\components\ -Force
```

## 17. 반응형 목록만 되돌리기 (선택)

목록 반응형(2열) 레이아웃 후 문제가 생기면 아래로 복구합니다.

```bat
restore-responsive.bat
```

또는:

```powershell
Copy-Item src.pre-responsive\components\StampListScreen.tsx src\components\ -Force
```

## 18. 음성 입력 이어쓰기만 되돌리기 (선택)

음성 입력 시 기존 텍스트 뒤에 이어쓰기 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-speech-append.bat
```

또는:

```powershell
Copy-Item src.pre-speech-append\components\StampSaveModal.tsx src\components\ -Force
```

## 19. PDF 페이지당 사진 수만 되돌리기 (선택)

설정의 PDF 페이지당 사진 수(1~4장) 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-per-page.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-per-page\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-pdf-per-page\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-pdf-per-page\components\SettingsScreen.tsx src\components\ -Force
```

## 20. 사진 파일명(제목 기반)만 되돌리기 (선택)

사진 파일명을 제목·날짜시간 기반으로 저장하는 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-filename.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-filename\services\fileService.ts src\services\ -Force
Copy-Item src.pre-stamp-filename\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-stamp-filename\services\stampRepository.ts src\services\ -Force
```

## 21. 카메라 화면 설정 버튼만 되돌리기 (선택)

카메라 화면 상단 설정 버튼 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-camera-settings.bat
```

또는:

```powershell
Copy-Item src.pre-camera-settings\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-settings\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-settings\screens\MainScreen.tsx src\screens\ -Force
```

## 22. PDF 저장 copyAsync 수정만 되돌리기 (선택)

PDF 저장/공유 시 copyAsync 오류 수정 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-save.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-save\services\exportPdf.ts src\services\ -Force
```

## 23. 제목 위치(카카오) 자동 입력만 되돌리기 (선택)

카카오 역지오코딩으로 제목에 위치를 넣는 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-location-title.bat
```

또는:

```powershell
Copy-Item src.pre-location-title\services\fileService.ts src\services\ -Force
Copy-Item src.pre-location-title\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-location-title\app.json . -Force
Copy-Item src.pre-location-title\package.json . -Force
Remove-Item src\services\kakaoLocal.ts, src\services\locationService.ts -ErrorAction SilentlyContinue
npm install
```

## 24. .env gitignore만 되돌리기 (선택)

`.env` gitignore 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-env-gitignore.bat
```

## 25. 제목 건물명(아파트) 보조 표시만 되돌리기 (선택)

`coord2address`로 건물명을 제목에 붙이는 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-building-title.bat
```

또는:

```powershell
Copy-Item src.pre-building-title\services\kakaoLocal.ts src\services\ -Force
```

## 26. 카메라 최대 해상도 촬영만 되돌리기 (선택)

기기 최대 `pictureSize`와 `quality: 1` 적용 후 문제가 생기면 아래로 복구합니다.

```bat
restore-camera-resolution.bat
```

또는:

```powershell
Copy-Item src.pre-camera-resolution\components\CameraScreen.tsx src\components\ -Force
Remove-Item src\utils\cameraPictureSize.ts -ErrorAction SilentlyContinue
```

## 27. PDF 화질(원본/표준/압축)만 되돌리기 (선택)

PDF 이미지 압축 옵션 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-quality.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-quality\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-pdf-quality\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-pdf-quality\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-pdf-quality\package.json package.json -Force
Remove-Item src\services\pdfImageForExport.ts -ErrorAction SilentlyContinue
npm install
```

## 28. 제목 즉시 표시(1단계 A)만 되돌리기 (선택)

촬영 후 저장 모달에서 날짜·시간 제목을 즉시 보여주는 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-title-ux.bat
```

또는:

```powershell
Copy-Item src.pre-title-ux\components\StampSaveModal.tsx src\components\ -Force
```

## 29. 위치 확인 중 표시만 되돌리기 (선택)

저장 모달에서 "위치 확인 중…" 안내 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-location-loading.bat
```

또는:

```powershell
Copy-Item src.pre-location-loading\components\StampSaveModal.tsx src\components\ -Force
```

## 30. 저장 모달 키보드 스크롤만 되돌리기 (선택)

키보드 올릴 때 메모 필드 스크롤 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-keyboard-scroll.bat
```

또는:

```powershell
Copy-Item src.pre-keyboard-scroll\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-keyboard-scroll\components\VoiceInputField.tsx src\components\ -Force
```

## 31. GPS 캐시·타임아웃만 되돌리기 (선택)

`getLastKnownPositionAsync` + GPS 타임아웃 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-location-fast.bat
```

또는:

```powershell
Copy-Item src.pre-location-fast\services\locationService.ts src\services\ -Force
```
