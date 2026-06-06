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
| 추가 | `src/`, `src.pre-edit/`, `restore-edit.bat`, `App.original.tsx`, `RESTORE.md`, `BUILD-APK.md`, `start.bat`, `build-apk.bat`, `apply-icon.bat`, `restore-icon.bat`, `assets.pre-icon`, `package.json.pre-web`, `app.json.pre-eas`, `eas.json` |
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
