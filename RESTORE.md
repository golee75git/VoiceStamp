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

**현재 아이콘 (2026-06-08):** 3D 나무 액자 + 금색 마이크 + VS. `565e4b3` 디자인, `591666e` Adaptive Icon safe zone 여백. 로컬 `assets/*--.png`는 git 미포함 수동 백업.

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

## 32. 휴지통 기능만 되돌리기 (선택)

휴지통·소프트 삭제 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-trash.bat
```

또는:

```powershell
Copy-Item src.pre-trash\db\schema.ts src\db\ -Force
Copy-Item src.pre-trash\db\database.ts src\db\ -Force
Copy-Item src.pre-trash\types\stamp.ts src\types\ -Force
Copy-Item src.pre-trash\services\stampRepository.ts src\services\ -Force
Copy-Item src.pre-trash\services\fileService.ts src\services\ -Force
Copy-Item src.pre-trash\screens\MainScreen.tsx src\screens\ -Force
Copy-Item src.pre-trash\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-trash\components\StampListScreen.tsx src\components\ -Force
Remove-Item src\services\stampTrash.ts, src\components\TrashScreen.tsx -ErrorAction SilentlyContinue
```

※ DB에 추가된 `deleted_at` 컬럼은 앱 데이터에 남을 수 있습니다. 코드만 이전 동작으로 되돌립니다.

## 33. 갤러리 저장만 되돌리기 (선택)

스탬프 저장 시 갤러리 복사 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-save.bat
```

또는:

```powershell
Copy-Item src.pre-gallery-save\app.json . -Force
Copy-Item src.pre-gallery-save\package.json . -Force
Copy-Item src.pre-gallery-save\services\saveStamp.ts src\services\ -Force
Remove-Item src\services\galleryService.ts -ErrorAction SilentlyContinue
npm install
```

※ `expo-media-library` 제거 후 APK 재빌드가 필요할 수 있습니다.

## 34. PDF 원본 화질 상한만 되돌리기 (선택)

PDF 「원본」 화질 HTML 크기 상한 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-original-cap.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-original-cap\services\pdfImageForExport.ts src\services\ -Force
```

## 35. 저장 목록 카메라 버튼 크기만 되돌리기 (선택)

저장 목록 「← 카메라」 버튼 크기 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-list-back-button.bat
```

또는:

```powershell
Copy-Item src.pre-list-back-button\components\StampListScreen.tsx src\components\ -Force
```

## 36. 저장 목록 설정 기어 푸터만 되돌리기 (선택)

저장 목록 하단 설정을 기어 아이콘(중앙)으로 바꾼 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-list-gear-footer.bat
```

또는:

```powershell
Copy-Item src.pre-list-gear-footer\components\StampListScreen.tsx src\components\ -Force
```

## 37. 앨범·기본 카메라 선택만 되돌리기 (선택)

앨범에서 선택·기본 카메라 촬영 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-image-picker.bat
```

또는:

```powershell
Copy-Item src.pre-image-picker\app.json . -Force
Copy-Item src.pre-image-picker\package.json . -Force
Copy-Item src.pre-image-picker\components\CameraScreen.tsx src\components\ -Force
Remove-Item src\services\pickStampImage.ts -ErrorAction SilentlyContinue
npm install
```

※ `expo-image-picker` 제거 후 APK 재빌드가 필요할 수 있습니다.

## 38. 제목·메모 정렬만 되돌리기 (선택)

설정의 제목·메모 정렬(왼쪽/가운데/오른쪽) 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-text-align.bat
```

또는:

```powershell
Copy-Item src.pre-text-align\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-text-align\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-text-align\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-text-align\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-text-align\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-text-align\components\VoiceInputField.tsx src\components\ -Force
Copy-Item src.pre-text-align\components\TrashScreen.tsx src\components\ -Force
Copy-Item src.pre-text-align\screens\MainScreen.tsx src\screens\ -Force
```

## 39. 설정 화면 스크롤만 되돌리기 (선택)

설정 페이지 세로 스크롤 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-settings-scroll.bat
```

또는:

```powershell
Copy-Item src.pre-settings-scroll\components\SettingsScreen.tsx src\components\ -Force
```

## 40. PDF 사진·텍스트 정렬 맞춤만 되돌리기 (선택)

PDF에서 사진을 제목 정렬에 맞춘 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-align.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-align\services\exportPdf.ts src\services\ -Force
```

## 41. PDF 이미지 크기 확대만 되돌리기 (선택)

PDF 사진 표시 크기(vh·여백) 확대 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-image-size.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-image-size\services\exportPdf.ts src\services\ -Force
```

## 42. PDF 일시·파일명·빈 메모 표시만 되돌리기 (선택)

PDF 촬영 일시 표시, 파일명 날짜·시간, 빈 메모 `(메모 없음)` 생략 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-datetime-memo.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-datetime-memo\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-pdf-datetime-memo\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-pdf-datetime-memo\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-pdf-datetime-memo\components\StampListScreen.tsx src\components\ -Force
Remove-Item src\services\pdfTitleFormat.ts -ErrorAction SilentlyContinue
```

## 43. PDF 1페이지 보고서 제목만 되돌리기 (선택)

PDF 1페이지 상단 보고서 제목 입력·표시 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-report-title.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-report-title\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-pdf-report-title\components\StampListScreen.tsx src\components\ -Force
```

## 44. 카메라·목록 메뉴 재배치만 되돌리기 (선택)

카메라 왼쪽 세로 메뉴, 목록 앨범, 목록 하단 설정 제거 후 문제가 생기면 아래로 복구합니다.

```bat
restore-camera-nav.bat
```

또는:

```powershell
Copy-Item src.pre-camera-nav\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-nav\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-nav\screens\MainScreen.tsx src\screens\ -Force
```

## 45. 카메라 메뉴 오른쪽 하단 배치만 되돌리기 (선택)

카메라 메뉴를 오른쪽 하단으로 옮긴 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-camera-nav-bottom.bat
```

또는:

```powershell
Copy-Item src.pre-camera-nav-bottom\components\CameraScreen.tsx src\components\ -Force
```

## 46. 카메라 손잡이(왼손/오른손) 메뉴 위치만 되돌리기 (선택)

설정에서 카메라 메뉴를 왼손·오른손에 따라 좌/우 하단에 배치하는 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-camera-hand.bat
```

또는:

```powershell
Copy-Item src.pre-camera-hand\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-camera-hand\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-hand\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-hand\screens\MainScreen.tsx src\screens\ -Force
```

## 47. 마이크 버튼 손잡이 위치만 되돌리기 (선택)

저장 모달에서 마이크 버튼을 왼손·오른손 설정에 맞춰 좌/우에 배치하는 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-mic-hand.bat
```

또는:

```powershell
Copy-Item src.pre-mic-hand\components\VoiceInputField.tsx src\components\ -Force
Copy-Item src.pre-mic-hand\components\StampSaveModal.tsx src\components\ -Force
```

## 48. 마이크 PNG 아이콘만 되돌리기 (선택)

저장 모달 마이크 버튼을 이모지(🎤)에서 PNG 아이콘으로 바꾼 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-mic-icon.bat
```

또는:

```powershell
Copy-Item src.pre-mic-icon\components\VoiceInputField.tsx src\components\ -Force
Remove-Item assets\mic-icon.png -ErrorAction SilentlyContinue
```

## 49. 마이크 녹음 중 점(●) 표시만 되돌리기 (선택)

녹음 중 PNG 대신 점(●) 표시로 바꾼 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-mic-dot.bat
```

또는:

```powershell
Copy-Item src.pre-mic-dot\components\VoiceInputField.tsx src\components\ -Force
```

## 50. 카메라 목록·설정 메뉴 타원 크기 통일만 되돌리기 (선택)

목록·설정 버튼 배경을 카메라 메뉴와 같은 타원 크기로 맞춘 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-nav-button-size.bat
```

또는:

```powershell
Copy-Item src.pre-nav-button-size\components\CameraScreen.tsx src\components\ -Force
```

## 51. 스탬프 합성 JPEG 저장만 되돌리기 (선택)

목록 선택 후 제목·메모가 포함된 JPEG를 갤러리에 저장하는 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-image-export.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-image-export\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-stamp-image-export\package.json . -Force
Remove-Item src\services\exportStampImage.ts -ErrorAction SilentlyContinue
Remove-Item src\components\StampExportCard.tsx -ErrorAction SilentlyContinue
Remove-Item src\components\StampImageExportHost.tsx -ErrorAction SilentlyContinue
npm install
```

## 52. 갤러리 앨범 분류 예외 처리만 되돌리기 (선택)

이미지 저장은 되는데 실패 알림만 뜨던 문제(앨범 추가 실패 시 예외) 수정 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-album-fix.bat
```

또는:

```powershell
Copy-Item src.pre-gallery-album-fix\services\galleryService.ts src\services\ -Force
```

## 53. 제목·메모 표시 방식(워터마크)만 되돌리기 (선택)

설정에서 별도 영역/워터마크 선택 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-text-layout.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-text-layout\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-stamp-text-layout\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-stamp-text-layout\services\exportStampImage.ts src\services\ -Force
Copy-Item src.pre-stamp-text-layout\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-stamp-text-layout\components\StampExportCard.tsx src\components\ -Force
Copy-Item src.pre-stamp-text-layout\components\StampListScreen.tsx src\components\ -Force
```

## 54. PDF·이미지 공통 파일명만 되돌리기 (선택)

선택 모드 파일명 라벨·이미지 저장 파일명 연동 후 문제가 생기면 아래로 복구합니다.

```bat
restore-export-filename.bat
```

또는:

```powershell
Copy-Item src.pre-export-filename\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-export-filename\services\exportStampImage.ts src\services\ -Force
Copy-Item src.pre-export-filename\services\galleryService.ts src\services\ -Force
```

## 55. Android 뒤로가기만 되돌리기 (선택)

카메라 종료 확인·하위 화면 복귀(`BackHandler`) 후 문제가 생기면 아래로 복구합니다.

```bat
restore-back-handler.bat
```

또는:

```powershell
Copy-Item src.pre-back-handler\screens\MainScreen.tsx src\screens\ -Force
```

## 56. APK 마이크 권한(RECORD_AUDIO) 복구만 되돌리기 (선택)

`expo-image-picker`의 `microphonePermission: false` 제거 후 문제가 생기면 아래로 복구합니다.

```bat
restore-mic-permission.bat
```

또는:

```powershell
Copy-Item app.json.pre-mic-permission app.json -Force
npx expo prebuild --platform android --no-install
```

※ 되돌린 뒤 APK 재빌드(`build-apk.bat`)가 필요합니다.

## 57. 현장명·날짜별 폴더/앨범 분류만 되돌리기 (선택)

현장명 입력 및 `YYYYMMDD_현장명` 앱 하위 폴더·갤러리 앨범 분류 후 문제가 생기면 아래로 복구합니다.

```bat
restore-site-group.bat
```

또는:

```powershell
Copy-Item src.pre-site-group\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-site-group\services\fileService.ts src\services\ -Force
Copy-Item src.pre-site-group\services\galleryService.ts src\services\ -Force
Copy-Item src.pre-site-group\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-site-group\services\exportStampImage.ts src\services\ -Force
Copy-Item src.pre-site-group\components\CameraScreen.tsx src\components\ -Force
```

## 58. 현장명 저장 모달 배치만 되돌리기 (선택)

현장명을 카메라가 아닌 저장 모달(제목 위)에 표시한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-site-modal.bat
```

또는:

```powershell
Copy-Item src.pre-site-modal\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-site-modal\components\StampSaveModal.tsx src\components\ -Force
```

## 59. 갤러리 날짜·현장 앨범 분류(Android)만 되돌리기 (선택)

`initialAssetLocalUri`·`copyAsset: true` 앨범 저장 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-album-v2.bat
```

또는:

```powershell
Copy-Item src.pre-gallery-album-v2\services\galleryService.ts src\services\ -Force
```

## 60. 갤러리 앨범 분류(캐시 복사·MediaLibrary Next API)만 되돌리기 (선택)

캐시 복사 + `Asset`/`Album` API 앨범 저장 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-album-v3.bat
```

또는:

```powershell
Copy-Item src.pre-gallery-album-v3\services\galleryService.ts src\services\ -Force
```

## 61. 갤러리 앨범 분류(쓰기 전용·앨범 ID 캐시)만 되돌리기 (선택)

쓰기 전용 권한 + 앨범 ID 로컬 저장 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-album-v4.bat
```

또는:

```powershell
Copy-Item src.pre-gallery-album-v4\services\galleryService.ts src\services\ -Force
Copy-Item src.pre-gallery-album-v4\services\settingsService.ts src\services\ -Force
```

## 62. 저장 모달 장소명 라벨 문구만 되돌리기 (선택)

`장소명(앨범에 날짜_장소명 폴더저장)` 라벨 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-site-label.bat
```

또는:

```powershell
Copy-Item src.pre-site-label\components\StampSaveModal.tsx src\components\ -Force
```

## 63. 저장·수정 모달 사진 전체 보기만 되돌리기 (선택)

미리보기 탭 시 전체 화면 사진 보기 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-image-viewer.bat
```

또는:

```powershell
Copy-Item src.pre-image-viewer\components\StampSaveModal.tsx src\components\ -Force
```

## 64. 전체 보기 사진 삭제·버리기만 되돌리기 (선택)

전체 보기 화면 삭제/버리기 버튼 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-image-viewer-delete.bat
```

또는:

```powershell
Copy-Item src.pre-image-viewer-delete\components\StampSaveModal.tsx src\components\ -Force
```

## 65. 수정 화면 저장 폴더·갤러리 앨범 변경만 되돌리기 (선택)

저장 폴더 표시/변경 및 `gallery_asset_id` 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-folder-edit.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-folder-edit\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-stamp-folder-edit\services\fileService.ts src\services\ -Force
Copy-Item src.pre-stamp-folder-edit\services\galleryService.ts src\services\ -Force
Copy-Item src.pre-stamp-folder-edit\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-stamp-folder-edit\services\stampRepository.ts src\services\ -Force
Copy-Item src.pre-stamp-folder-edit\db\schema.ts src\db\ -Force
Copy-Item src.pre-stamp-folder-edit\db\database.ts src\db\ -Force
Copy-Item src.pre-stamp-folder-edit\types\stamp.ts src\types\ -Force
```

## 66. 수정 화면 저장 폴더 선택 모달만 되돌리기 (선택)

저장 폴더 [선택] 모달 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-folder-picker.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-folder-picker\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-stamp-folder-picker\services\settingsService.ts src\services\ -Force
Remove-Item src\services\stampFolderService.ts -ErrorAction SilentlyContinue
```

## 64. 저장 폴더 전체 자동 채우기 되돌리기 (선택)

저장 모달에 `YYYYMMDD_장소` 전체 표시·기존 폴더 선택 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-site-group-full.bat
```

또는:

```powershell
Copy-Item src.pre-site-group-full\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-site-group-full\services\fileService.ts src\services\ -Force
Copy-Item src.pre-site-group-full\services\saveStamp.ts src\services\ -Force
```

## 65. 웹 갤러리 스텁 되돌리기 (선택)

웹에서 `ExpoMediaLibraryNext` 오류 방지용 `galleryService.web.ts` 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-web-stub.bat
```

또는:

```powershell
Remove-Item src\services\galleryService.web.ts -ErrorAction SilentlyContinue
```

## 66. 목록 휴지통 이동 후 스크롤 유지 되돌리기 (선택)

휴지통 이동 후 목록 스크롤 위치 유지( refreshKey 건너뛰기·scrollToOffset ) 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-list-trash-scroll.bat
```

또는:

```powershell
Copy-Item src.pre-list-trash-scroll\components\StampListScreen.tsx src\components\ -Force
```

## 67. 목록 silent 로드 후 재진입 무한 로딩 수정 되돌리기 (선택)

휴지통 이동 후 카메라 갔다가 목록 재진입 시 무한 로딩 수정( silent load 에서도 setLoading(false) ) 후 문제가 생기면 아래로 복구합니다.

```bat
restore-list-silent-loading.bat
```

또는:

```powershell
Copy-Item src.pre-list-silent-loading\components\StampListScreen.tsx src\components\ -Force
```

## 68. 수정 모달 휴지통 이동 후 목록 스크롤 유지 되돌리기 (선택)

스탬프 수정에서 사진 휴지통 이동 후 목록 스크롤 위치 유지( onTrashed·removeStampsKeepScroll ) 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-edit-trash-scroll.bat
```

또는:

```powershell
Copy-Item src.pre-edit-trash-scroll\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-edit-trash-scroll\components\StampListScreen.tsx src\components\ -Force
```

## 69. 목록 헤더 설정·앱 정보 링크·정책 웹페이지 되돌리기 (선택)

목록 헤더 「설정」·설정 복귀(목록/카메라)·앱 정보 링크·`public/*.html`·`vercel.json` rewrites 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-info-leg04.bat
```

또는:

```powershell
Copy-Item src.pre-info-leg04\screens\MainScreen.tsx src\screens\ -Force
Copy-Item src.pre-info-leg04\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-info-leg04\components\SettingsScreen.tsx src\components\ -Force
Copy-Item vercel.json.pre-info-leg04 vercel.json -Force
Remove-Item src\constants\infoUrls.ts -ErrorAction SilentlyContinue
Remove-Item public\info.html, public\privacy.html, public\license.html, public\help.html -ErrorAction SilentlyContinue
```

## 70. 저장 폴더 기본 현장명 유지 되돌리기 (선택)

GPS 위치로 저장 폴더(앨범)명을 덮어쓰지 않고 `current_site_name`만 유지하도록 변경한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-site-folder-keep.bat
```

또는:

```powershell
Copy-Item src.pre-site-folder-keep\components\StampSaveModal.tsx src\components\ -Force
```

## 71. 학교 POI 우선 위치 제목 되돌리기 (선택)

반경 내 학교(SC4)를 건물명보다 우선하는 `kakaoLocal.ts` 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-school-poi.bat
```

또는:

```powershell
Copy-Item src.pre-school-poi\services\kakaoLocal.ts src\services\ -Force
```

## 71a. 로컬 학교 DB 위치 조회 되돌리기 (선택)

공공데이터 학교 DB + 카카오 SC4 fallback(`resolveNearestSchool`) 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-local-school-db.bat
```

또는:

```powershell
Copy-Item src.pre-local-school-db\services\kakaoLocal.ts src\services\ -Force
Copy-Item src.pre-local-school-db\db\database.ts src\db\ -Force
Copy-Item src.pre-local-school-db\db\schema.ts src\db\ -Force
Remove-Item src\services\schoolLookup.ts, src\services\schoolSeed.ts, src\types\school.ts, assets\schools.seed.json -ErrorAction SilentlyContinue
```

## 71b. 빌드 타임 SQLite 학교 DB 되돌리기 (선택)

`assets/schools.sqlite` + `schoolDatabase.ts` 변경 후 문제가 생기면 아래로 JSON seed 방식으로 복구합니다.

```bat
restore-schools-sqlite.bat
```

또는:

```powershell
Copy-Item src.pre-schools-sqlite\services\kakaoLocal.ts src\services\ -Force
Copy-Item src.pre-schools-sqlite\services\schoolLookup.ts src\services\ -Force
Copy-Item src.pre-schools-sqlite\services\schoolSeed.ts src\services\ -Force
Copy-Item src.pre-schools-sqlite\db\database.ts src\db\ -Force
Copy-Item src.pre-schools-sqlite\db\schema.ts src\db\ -Force
Copy-Item src.pre-schools-sqlite\schools.seed.json assets\ -Force
Remove-Item src\services\schoolDatabase.ts, assets\schools.sqlite, scripts\build-schools-db.mjs -ErrorAction SilentlyContinue
```

## 71c. 저장 목록 검색 되돌리기 (선택)

목록 상단 제목·메모 검색 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-list-search.bat
```

또는:

```powershell
Copy-Item src.pre-list-search\components\StampListScreen.tsx src\components\ -Force
Remove-Item src\utils\stampListSearch.ts -ErrorAction SilentlyContinue
```

## 72. 온보딩 인트로 화면 되돌리기 (선택)

앱 시작 시 3단계 인트로(온보딩) 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-intro.bat
```

또는:

```powershell
Copy-Item src.pre-intro\App.tsx . -Force
Copy-Item src.pre-intro\settingsService.ts src\services\ -Force
Remove-Item src\components\IntroScreen.tsx -ErrorAction SilentlyContinue
```

## 73. 온보딩 4단계(1-1~1-4) 되돌리기 (선택)

`img/1-1`~`1-4` 기반 4단계 인트로로 바꾼 뒤 문제가 생기면 아래로 3단계 인트로로 복구합니다.

```bat
restore-intro-4.bat
```

또는:

```powershell
Copy-Item src.pre-intro-4\IntroScreen.tsx src\components\ -Force
Copy-Item src.pre-intro-4\onboarding-1.png assets\onboarding\ -Force
Copy-Item src.pre-intro-4\onboarding-2.png assets\onboarding\ -Force
Copy-Item src.pre-intro-4\onboarding-3.png assets\onboarding\ -Force
Remove-Item assets\onboarding\onboarding-4.png -ErrorAction SilentlyContinue
```

## 74. 온보딩 반응형 레이아웃 되돌리기 (선택)

`contain`+하단 버튼 레이아웃 적용 후 문제가 생기면 아래로 복구합니다.

```bat
restore-intro-layout.bat
```

또는:

```powershell
Copy-Item src.pre-intro-layout\IntroScreen.tsx src\components\ -Force
```

## 75. 온보딩 이미지(버튼 제거판) 되돌리기 (선택)

`img/1-1`~`1-4` 수정본으로 교체한 뒤 문제가 생기면 아래로 이전 이미지로 복구합니다.

```bat
restore-onboarding-images.bat
```

또는:

```powershell
Copy-Item src.pre-onboarding-images\onboarding-1.png assets\onboarding\ -Force
Copy-Item src.pre-onboarding-images\onboarding-2.png assets\onboarding\ -Force
Copy-Item src.pre-onboarding-images\onboarding-3.png assets\onboarding\ -Force
Copy-Item src.pre-onboarding-images\onboarding-4.png assets\onboarding\ -Force
```

## 76. 온보딩 idle 재표시(30일) 되돌리기 (선택)

30일 미사용 시 온보딩 재표시(`last_app_open_at`) 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-onboarding-idle.bat
```

또는:

```powershell
Copy-Item src.pre-onboarding-idle\App.tsx . -Force
Copy-Item src.pre-onboarding-idle\settingsService.ts src\services\ -Force
```

## 77. 설정 온보딩 다시 보기 되돌리기 (선택)

설정 > 「온보딩 다시 보기」 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-onboarding-replay.bat
```

또는:

```powershell
Copy-Item src.pre-onboarding-replay\MainScreen.tsx src\screens\ -Force
Copy-Item src.pre-onboarding-replay\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-onboarding-replay\IntroScreen.tsx src\components\ -Force
```

## 78. 별도 영역 네이티브 합성 되돌리기 (선택)

별도 영역(caption) 저장을 ViewShot 대신 네이티브 합성으로 바꾼 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-caption-native.bat
```

또는:

```powershell
Copy-Item src.pre-caption-native\services\exportStampImage.ts src\services\ -Force
Remove-Item src\services\renderStampCaptionNative.ts -ErrorAction SilentlyContinue
Remove-Item src\services\captionLayout.ts -ErrorAction SilentlyContinue
```

## 79. 별도 영역 흰 배경 강화 되돌리기 (선택)

별도 영역 전체 여백 흰색 강화(PNG→JPEG 1회, quality 0.95) 후 문제가 생기면 아래로 복구합니다.

```bat
restore-caption-white.bat
```

또는:

```powershell
Copy-Item src.pre-caption-white\services\renderStampCaptionNative.ts src\services\ -Force
```

## 80. 갤러리 한글 파일명 되돌리기 (선택)

갤러리 저장 파일명에 한글 제목 포함 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-filename.bat
```

또는:

```powershell
Copy-Item src.pre-gallery-filename\services\galleryService.ts src\services\ -Force
Copy-Item src.pre-gallery-filename\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-gallery-filename\services\exportStampImage.ts src\services\ -Force
```

## 83. 캡션 EXIF(ISO·GPS·크기) 되돌리기 (선택)

캡션 갤러리 파일에 원본 EXIF 복사 후 문제가 생기면 아래로 복구합니다.

```bat
restore-caption-exif.bat
```

## 82. 갤러리 DISPLAY_NAME 네이티브 저장 되돌리기 (선택)

Android MediaStore DISPLAY_NAME 한글 저장(네이티브 모듈) 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-display-name.bat
```

또는:

```powershell
Copy-Item src.pre-gallery-display-name\services\galleryService.ts src\services\ -Force
Copy-Item src.pre-gallery-display-name\package.json . -Force
npm install
```

## 81. 캡처 좌표(위도·경도) 표시 되돌리기 (선택)

캡션/워터마크에 GPS 좌표 표시 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-coords.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-coords\components\StampExportCard.tsx src\components\ -Force
Copy-Item src.pre-stamp-coords\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-stamp-coords\db\database.ts src\db\ -Force
Copy-Item src.pre-stamp-coords\db\schema.ts src\db\ -Force
Copy-Item src.pre-stamp-coords\services\captionLayout.ts src\services\ -Force
Copy-Item src.pre-stamp-coords\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-stamp-coords\services\exportStampImage.ts src\services\ -Force
Copy-Item src.pre-stamp-coords\services\locationService.ts src\services\ -Force
Copy-Item src.pre-stamp-coords\services\renderStampCaptionNative.ts src\services\ -Force
Copy-Item src.pre-stamp-coords\services\renderStampWatermarkNative.ts src\services\ -Force
Copy-Item src.pre-stamp-coords\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-stamp-coords\services\stampRepository.ts src\services\ -Force
Copy-Item src.pre-stamp-coords\types\stamp.ts src\types\ -Force
Remove-Item src\services\stampCoords.ts -ErrorAction SilentlyContinue
```

## 82. 저장 화면 미리보기(제목·메모) 되돌리기 (선택)

저장·전체 보기 미리보기에 워터마크/별도 영역 표시 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-preview.bat
```

또는:

```powershell
Copy-Item src.pre-save-preview\components\StampSaveModal.tsx src\components\ -Force
Remove-Item src\components\StampSavePreview.tsx -ErrorAction SilentlyContinue
```

## 83. 저장 전체 보기(줌·합성 미리보기) 되돌리기 (선택)

저장 화면 전체 보기의 핀치 줌·저화질 합성 미리보기 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-zoom-viewer.bat
```

또는:

```powershell
Copy-Item src.pre-save-zoom-viewer\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-zoom-viewer\services\exportStampImage.ts src\services\ -Force
Copy-Item src.pre-save-zoom-viewer\services\renderStampCaptionNative.ts src\services\ -Force
Copy-Item src.pre-save-zoom-viewer\services\renderStampWatermarkNative.ts src\services\ -Force
Copy-Item src.pre-save-zoom-viewer\App.tsx . -Force
Copy-Item src.pre-save-zoom-viewer\index.ts . -Force
Copy-Item src.pre-save-zoom-viewer\package.json . -Force
Copy-Item src.pre-save-zoom-viewer\package-lock.json . -Force
Remove-Item src\components\StampSaveZoomViewer.tsx -ErrorAction SilentlyContinue
Remove-Item src\components\ZoomableImage.tsx -ErrorAction SilentlyContinue
Remove-Item babel.config.js -ErrorAction SilentlyContinue
npm install
```

## 84. 저장 전체 보기 줌 제스처(Modal) 되돌리기 (선택)

전체 보기 Modal 안 `GestureHandlerRootView` 적용 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-zoom-modal-fix.bat
```

또는:

```powershell
Copy-Item src.pre-save-zoom-modal-fix\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-zoom-modal-fix\components\ZoomableImage.tsx src\components\ -Force
```

## 85. 저장 시 사진 자르기(크롭) 되돌리기 (선택)

확대·이동 후 잘라 저장 기능 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-crop.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-crop\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-stamp-crop\components\StampSaveZoomViewer.tsx src\components\ -Force
Copy-Item src.pre-stamp-crop\components\ZoomableImage.tsx src\components\ -Force
Copy-Item src.pre-stamp-crop\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-stamp-crop\services\fileService.ts src\services\ -Force
Remove-Item src\services\stampImageCrop.ts -ErrorAction SilentlyContinue
```

## 86. 확대 후 이미지 이동(팬) 되돌리기 (선택)

확대 후 드래그 이동 개선 후 문제가 생기면 아래로 복구합니다.

```bat
restore-zoom-pan-fix.bat
```

또는:

```powershell
Copy-Item src.pre-zoom-pan-fix\components\ZoomableImage.tsx src\components\ -Force
```

## 87. 전체 보기 닫기·적용 버튼 되돌리기 (선택)

전체 보기에서 「닫기」/「적용」 분리 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-viewer-actions.bat
```

또는:

```powershell
Copy-Item src.pre-save-viewer-actions\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-viewer-actions\components\StampSaveZoomViewer.tsx src\components\ -Force
```

## 88. 마이크 옆 안내 문구 되돌리기 (선택)

「(눌러서 말하기)」 표시 후 문제가 생기면 아래로 복구합니다.

```bat
restore-mic-hint.bat
```

또는:

```powershell
Copy-Item src.pre-mic-hint\components\VoiceInputField.tsx src\components\ -Force
```

## 90. 수정 모드 크롭·적용 되돌리기 (선택)

스탬프 수정 화면 전체 보기 크롭·적용 후 문제가 생기면 아래로 복구합니다.

```bat
restore-edit-crop.bat
```

또는:

```powershell
Copy-Item src.pre-edit-crop\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-edit-crop\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-edit-crop\services\fileService.ts src\services\ -Force
```

## 89. 저장 시 갤러리 백그라운드 처리 되돌리기 (선택)

저장 버튼 반응 속도 개선(갤러리 비동기) 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-fast-gallery.bat
```

또는:

```powershell
Copy-Item src.pre-save-fast-gallery\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-save-fast-gallery\services\stampRepository.ts src\services\ -Force
```

## 91. 저장 목록 PDF·이미지 안내 문구 되돌리기 (선택)

저장 목록 상단 안내 문구 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-list-export-hint.bat
```

또는:

```powershell
Copy-Item src.pre-list-export-hint\components\StampListScreen.tsx src\components\ -Force
```

## 92. 시작 배너(start.png) 되돌리기 (선택)

Intro 다음 start.png 배너 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-start-screen.bat
```

또는:

```powershell
Copy-Item src.pre-start-screen\App.tsx . -Force
Copy-Item src.pre-start-screen\services\settingsService.ts src\services\ -Force
Remove-Item src\components\StartScreen.tsx -ErrorAction SilentlyContinue
```

## 93. 웹 브라우저 카메라 촬영 되돌리기 (선택)

Vercel 웹에서 브라우저 카메라 연동 후 문제가 생기면 아래로 복구합니다.

```bat
restore-web-camera.bat
```

또는:

```powershell
Copy-Item src.pre-web-camera\components\CameraScreen.tsx src\components\ -Force
```

## 94. 근처 이전 장소 즉시 표시 되돌리기 (선택)

저장 모달에서 300m 이내 이전 장소명 즉시 표시 후 GPS 갱신 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-location-place-cache.bat
```

또는:

```powershell
Copy-Item src.pre-location-place-cache\services\locationService.ts src\services\ -Force
Copy-Item src.pre-location-place-cache\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-location-place-cache\components\StampSaveModal.tsx src\components\ -Force
Remove-Item src\utils\geoDistance.ts -ErrorAction SilentlyContinue
```

## 95. 좌표 표기 설정 되돌리기 (선택)

설정「좌표 표기」(GPS/좌표/없음) 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-coords-label.bat
```

또는:

```powershell
Copy-Item src.pre-coords-label\services\*.ts src\services\ -Force
Copy-Item src.pre-coords-label\components\*.tsx src\components\ -Force
```

## 96. 음성 입력 커서 삽입 되돌리기 (선택)

저장·수정 화면에서 음성 입력이 커서 위치에 삽입되도록 변경한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-speech-cursor.bat
```

또는:

```powershell
Copy-Item src.pre-speech-cursor\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-speech-cursor\components\VoiceInputField.tsx src\components\ -Force
```

## 97. 저장·수정 화면 하단 버튼 레이아웃 되돌리기 (선택)

취소·저장 버튼을 스크롤 밖 고정 푸터로 옮긴 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-save-modal-footer.bat
```

또는:

```powershell
Copy-Item src.pre-save-modal-footer\components\StampSaveModal.tsx src\components\ -Force
```

## 98. 저장·수정 화면 내비게이션 바 여백 되돌리기 (선택)

하단 취소·저장 버튼 `paddingBottom`(Android 56) 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-modal-nav-padding.bat
```

또는:

```powershell
Copy-Item src.pre-save-modal-nav-padding\components\StampSaveModal.tsx src\components\ -Force
```

## 99. 저장·수정 미리보기 썸네일 되돌리기 (선택)

작은 미리보기용 720px 썸네일 생성 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-preview-thumb.bat
```

또는:

```powershell
Copy-Item src.pre-save-preview-thumb\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-preview-thumb\components\StampSavePreview.tsx src\components\ -Force
Copy-Item src.pre-save-preview-thumb\services\exportStampImage.ts src\services\ -Force
```

## 100. Android 미리보기 표시 수정 되돌리기 (선택)

Android에서 미리보기 URI 캐시 복사·경로 정규화 적용 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-preview-android-fix.bat
```

또는:

```powershell
Copy-Item src.pre-save-preview-android-fix\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-preview-android-fix\components\StampSavePreview.tsx src\components\ -Force
Copy-Item src.pre-save-preview-android-fix\services\exportStampImage.ts src\services\ -Force
```

## 101. 워터마크 미리보기 레이아웃 되돌리기 (선택)

워터마크 모드 미리보기 사진 높이 고정(180px) 적용 후 문제가 생기면 아래로 복구합니다.

```bat
restore-watermark-preview-layout.bat
```

또는:

```powershell
Copy-Item src.pre-watermark-preview-layout\components\StampSavePreview.tsx src\components\ -Force
```

## 102. 워터마크 미리보기 v2 되돌리기 (선택)

워터마크 썸네일 direct Image + 설정 로드 후 표시 적용 후 문제가 생기면 아래로 복구합니다.

```bat
restore-watermark-preview-v2.bat
```

또는:

```powershell
Copy-Item src.pre-watermark-preview-v2\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-watermark-preview-v2\components\StampSavePreview.tsx src\components\ -Force
```

## 103. 워터마크 미리보기 캡션 슬롯 되돌리기 (선택)

워터마크 썸네일을 별도 영역과 동일한 120px 사진 슬롯으로 통일한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-watermark-preview-caption-slot.bat
```

또는:

```powershell
Copy-Item src.pre-watermark-preview-caption-slot\components\StampSavePreview.tsx src\components\ -Force
```

## 104. 층 표기 설정 되돌리기 (선택)

설정「층 표기」(제목 뒤에 붙이기 / 제목 커서에 삽입) 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-floor-display-mode.bat
```

또는:

```powershell
Copy-Item src.pre-floor-display-mode\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-floor-display-mode\services\stampFloor.ts src\services\ -Force
Copy-Item src.pre-floor-display-mode\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-floor-display-mode\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-floor-display-mode\App.tsx . -Force
Remove-Item src\services\floorDisplayMode.ts -ErrorAction SilentlyContinue
```

## 105. 자동 제목(날짜/시간) 설정 되돌리기 (선택)

설정「자동 제목」(없음 / 날짜 / 날짜+시간) 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-title-datetime-mode.bat
```

또는:

```powershell
Copy-Item src.pre-title-datetime-mode\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-title-datetime-mode\services\fileService.ts src\services\ -Force
Copy-Item src.pre-title-datetime-mode\services\pdfTitleFormat.ts src\services\ -Force
Copy-Item src.pre-title-datetime-mode\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-title-datetime-mode\App.tsx . -Force
Remove-Item src\services\titleDatetimeMode.ts -ErrorAction SilentlyContinue
```

## 106. 워터마크 스타일 설정 되돌리기 (선택)

설정「워터마크 스타일」(검은 반투명 / 빨간 세로줄) 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-watermark-style.bat
```

또는:

```powershell
Copy-Item src.pre-watermark-style\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-watermark-style\services\exportStampImage.ts src\services\ -Force
Copy-Item src.pre-watermark-style\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-watermark-style\services\renderStampWatermarkNative.ts src\services\ -Force
Copy-Item src.pre-watermark-style\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-watermark-style\services\exportProject.ts src\services\ -Force
Copy-Item src.pre-watermark-style\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-watermark-style\components\StampSavePreview.tsx src\components\ -Force
Copy-Item src.pre-watermark-style\components\StampExportCard.tsx src\components\ -Force
Copy-Item src.pre-watermark-style\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-watermark-style\components\StampListScreen.tsx src\components\ -Force
Remove-Item src\services\watermarkStyle.ts -ErrorAction SilentlyContinue
Remove-Item src\components\WatermarkBarBackground.tsx -ErrorAction SilentlyContinue
```

## 107. 워터마크 흰색 반투명 되돌리기 (선택)

워터마크 스타일을 검은/흰 반투명으로 바꾼 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-watermark-solid-light.bat
```

또는:

```powershell
Copy-Item src.pre-watermark-solid-light\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-watermark-solid-light\services\watermarkStyle.ts src\services\ -Force
Copy-Item src.pre-watermark-solid-light\services\renderStampWatermarkNative.ts src\services\ -Force
Copy-Item src.pre-watermark-solid-light\services\exportPdf.ts src\services\ -Force
Copy-Item src.pre-watermark-solid-light\components\WatermarkBarBackground.tsx src\components\ -Force
```

## 108. 좌표 표기「없음」 숨김 되돌리기 (선택)

설정「좌표 표기」에서 없음 선택 시 좌표 숫자를 숨기도록 변경한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-coords-off-hide.bat
```

또는:

```powershell
Copy-Item src.pre-coords-off-hide\services\stampCoords.ts src\services\ -Force
Copy-Item src.pre-coords-off-hide\components\SettingsScreen.tsx src\components\ -Force
```

## 109. 연속 촬영 설정 되돌리기 (선택)

설정「연속 촬영」 토글 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-continuous-capture.bat
```

또는:

```powershell
Copy-Item src.pre-continuous-capture\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-continuous-capture\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-continuous-capture\components\SettingsScreen.tsx src\components\ -Force
Remove-Item src\services\quickCaptureSave.ts -ErrorAction SilentlyContinue
```

## 110. 촬영 후 3버튼 선택 되돌리기 (선택)

촬영 확인 후 「다시 촬영 / 저장 / 연속 촬영」 선택 UI 추가·설정 토글 제거 후 문제가 생기면 아래로 복구합니다.

```bat
restore-capture-action-sheet.bat
```

또는:

```powershell
Copy-Item src.pre-capture-action-sheet\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-capture-action-sheet\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-capture-action-sheet\components\SettingsScreen.tsx src\components\ -Force
Remove-Item src\components\CaptureActionSheet.tsx -ErrorAction SilentlyContinue
```

## 111. 연속 촬영 직전 위치 재사용 되돌리기 (선택)

연속 촬영 루프에서 직전 저장 좌표·장소명을 재사용하도록 변경한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-quick-capture-location.bat
```

또는:

```powershell
Copy-Item src.pre-quick-capture-location\services\quickCaptureSave.ts src\services\ -Force
Copy-Item src.pre-quick-capture-location\components\CameraScreen.tsx src\components\ -Force
```

## 112. 랜딩 방문자 카운터 되돌리기 (선택)

홈페이지 하단 방문자 집계(`api/visitor.js`, `localStorage` 당일 1회) 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-visitor-counter.bat
```

또는:

```powershell
Copy-Item public.pre-visitor-counter\landing.html public\ -Force
Copy-Item public.pre-visitor-counter\privacy.html public\ -Force
Remove-Item api\visitor.js -ErrorAction SilentlyContinue
Remove-Item api -ErrorAction SilentlyContinue
```

## 113. 랜딩 저작권 표기 영문 되돌리기 (선택)

홈페이지 `© 2026 Lee Hyung Woo` 표기 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-landing-copyright-en.bat
```

또는:

```powershell
Copy-Item public.pre-landing-copyright-en\landing.html public\ -Force
```

## 114. 길 위치 지번·POI 근처·학교 300m 되돌리기 (선택)

지번 fallback·POI `근처`·학교 반경 300m 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-road-place-fallback.bat
```

또는:

```powershell
Copy-Item src.pre-road-place-fallback\services\kakaoLocal.ts src\services\ -Force
```

## 115. 저장 화면 장소 음성 입력 되돌리기 (선택)

장소 필드 마이크 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-place-speech.bat
```

또는:

```powershell
Copy-Item src.pre-place-speech\components\StampSaveModal.tsx src\components\ -Force
```

## 116. 음성 입력 끝 공백·커서 되돌리기 (선택)

장소·제목·메모 음성 입력 시 끝 공백·커서 맨 뒤 배치 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-speech-end-gap.bat
```

또는:

```powershell
Copy-Item src.pre-speech-end-gap\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-speech-end-gap\components\VoiceInputField.tsx src\components\ -Force
```

## 117. 도로명+POI 근처 장소 표기 되돌리기 (선택)

건물명 없을 때 도로명·지번과 근처 POI를 함께 표시하도록 변경한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-place-road-poi.bat
```

또는:

```powershell
Copy-Item src.pre-place-road-poi\services\kakaoLocal.ts src\services\ -Force
```

## 118. 위치 prefetch 중복 조회·학교 카카오 축소 되돌리기 (선택)

저장 모달에서 prefetch 완료 후 GPS·카카오 전체 조회를 반복하지 않도록 한 변경과, 로컬 학교 DB 매칭 시 카카오 주소·POI 호출을 건너뛰도록 한 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-location-prefetch-school.bat
```

또는:

```powershell
Copy-Item src.pre-location-prefetch-school\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-location-prefetch-school\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-location-prefetch-school\services\kakaoLocal.ts src\services\ -Force
```

## 119. 저장 미리보기 즉시 표시·APK 빌드 라벨 되돌리기 (선택)

저장 모달 원본 즉시 미리보기 + prefetch 장소 즉시 반영 + 설정 APK 파일명 표시 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-preview-fast.bat
```

또는:

```powershell
Copy-Item src.pre-save-preview-fast\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-preview-fast\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-save-preview-fast\build-apk.bat build-apk.bat -Force
Set-Content src\constants\apkBuildLabel.ts "export const APK_BUILD_FILENAME = '';"
```

## 120. 카메라 위치 워밍업·빠른 장소 조회 되돌리기 (선택)

시스템 카메라 열 때 위치 워밍업 + `getFastLocationSnapshot` 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-location-warmup.bat
```

또는:

```powershell
Copy-Item src.pre-location-warmup\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-location-warmup\components\CaptureActionSheet.tsx src\components\ -Force
Copy-Item src.pre-location-warmup\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-location-warmup\services\locationService.ts src\services\ -Force
```

## 121. 촬영 시트 빠른 위치 프리페치 되돌리기 (선택)

3버튼 시트에서는 fast 위치만 표시하고 정밀 GPS는 백그라운드로 미룬 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-location-fast-sheet.bat
```

또는:

```powershell
Copy-Item src.pre-location-fast-sheet\components\CameraScreen.tsx src\components\ -Force
```

## 122. 촬영 후 모드(선택 화면 / 저장 화면 바로) 되돌리기 (선택)

설정 「촬영 후」 토글 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-capture-after-mode.bat
```

또는:

```powershell
Copy-Item src.pre-capture-after-mode\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-capture-after-mode\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-capture-after-mode\services\settingsService.ts src\services\ -Force
```

## 123. 로컬 학교명만 표시(Kakao region 생략) 되돌리기 (선택)

로컬 학교 DB 매칭 시 Kakao `fetchRegionLabel` 생략 후 문제가 생기면 아래로 복구합니다.

```bat
restore-school-skip-region.bat
```

또는:

```powershell
Copy-Item src.pre-school-skip-region\services\kakaoLocal.ts src\services\ -Force
```

## 124. 저장 모달 성능(워밍·설정 캐시·미리보기 지연) 되돌리기 (선택)

카메라 화면 위치 워밍 선행·저장 모달 설정 캐시·미리보기 썸네일 지연 후 문제가 생기면 아래로 복구합니다.

```bat
restore-save-modal-perf.bat
```

또는:

```powershell
Copy-Item src.pre-save-modal-perf\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-save-modal-perf\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-modal-perf\components\SettingsScreen.tsx src\components\ -Force
Remove-Item src\services\stampSaveModalLayoutCache.ts -ErrorAction SilentlyContinue
```

## 125. 촬영 후 처리 중 표시(런처 깜빡임 방지) 되돌리기 (선택)

촬영 복귀 후 저장 모달·선택 화면이 열릴 때까지 처리 중 오버레이를 유지한 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-post-capture-busy.bat
```

또는:

```powershell
Copy-Item src.pre-post-capture-busy\components\CameraScreen.tsx src\components\ -Force
```

## 126. 갤러리 「앱만」 저장 모드 되돌리기 (선택)

설정 「저장 시 갤러리」에 **앱만** 옵션을 추가한 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-gallery-app-only.bat
```

또는:

```powershell
Copy-Item src.pre-gallery-app-only\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-gallery-app-only\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-gallery-app-only\services\settingsService.ts src\services\ -Force
```

## 127. 저장 모달 장소 필드 항상 표시 되돌리기 (선택)

「위치 사용 안 함」에서도 장소 입력란을 보이게 한 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-place-field-always.bat
```

또는:

```powershell
Copy-Item src.pre-place-field-always\components\StampSaveModal.tsx src\components\ -Force
```

## 128. PDF 별도 영역 캡션 너비 맞춤 되돌리기 (선택)

별도 영역 PDF에서 캡션 너비를 사진에 맞춘 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-caption-fit.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-caption-fit\services\exportPdf.ts src\services\ -Force
```

## 129. PDF 페이지內 동일 사진 박스 되돌리기 (선택)

PDF 사진 슬롯(고정 박스 + object-fit contain) 적용 후 문제가 생기면 아래로 복구합니다.

```bat
restore-pdf-photo-slot.bat
```

또는:

```powershell
Copy-Item src.pre-pdf-photo-slot\services\exportPdf.ts src\services\ -Force
```

## 130. 스탬프 미리보기 확대/수정 배지(zoomedit) 되돌리기 (선택)

저장·수정 모달 미리보기에 `zoomedit.png` 배지를 오버레이한 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-preview-zoom-badge.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-preview-zoom-badge\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-stamp-preview-zoom-badge\assets\zoomedit.png assets\ -Force
```

## 131. 스탬프 미리보기 배지 zoom.png 되돌리기 (선택)

미리보기 배지 에셋을 `zoomedit.png`에서 `zoom.png`로 바꾼 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-zoom-png.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-zoom-png\components\StampSaveModal.tsx src\components\ -Force
```

## 132. 목록 내보내기 파일명·보고서 제목 모달 되돌리기 (선택)

목록 선택 후 **파일명·보고서 제목**을 모달로 편집하도록 바꾼 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-list-export-name-modal.bat
```

또는:

```powershell
Copy-Item src.pre-list-export-name-modal\components\StampListScreen.tsx src\components\ -Force
Remove-Item src\components\ExportNameModal.tsx -ErrorAction SilentlyContinue
```

## 133. zoom.png 투명 배경 되돌리기 (선택)

미리보기 배지 `zoom.png` 배경을 투명 처리한 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-zoom-transparent.bat
```

또는:

```powershell
Copy-Item assets.pre-zoom-transparent\zoom.png assets\ -Force
```

## 134. 위치 끔 시 직전 장소 자동 채움 되돌리기 (선택)

위치 조회를 끈 상태에서 저장 모달 장소란에 직전 장소를 자동 표시하는 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-last-place-off.bat
```

또는:

```powershell
Copy-Item src.pre-last-place-off\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-last-place-off\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-last-place-off\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-last-place-off\help.html public\ -Force
```

## 135. 일반 촬영 카메라(시스템/앱 내) 되돌리기 (선택)

일반 촬영 카메라 설정 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-primary-capture-camera.bat
```

또는:

```powershell
Copy-Item src.pre-primary-capture-camera\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-primary-capture-camera\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-primary-capture-camera\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-primary-capture-camera\help.html public\ -Force
```

## 136. 앱 내 카메라 핀치·더블탭 확대 되돌리기 (선택)

앱 내 카메라 촬영 전 확대 기능 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-in-app-camera-zoom.bat
```

또는:

```powershell
Copy-Item src.pre-in-app-camera-zoom\components\CameraScreen.tsx src\components\ -Force
Remove-Item src\components\InAppCameraPreview.tsx -ErrorAction SilentlyContinue
Copy-Item src.pre-in-app-camera-zoom\help.html public\ -Force
Copy-Item src.pre-in-app-camera-zoom\components\SettingsScreen.tsx src\components\ -Force
```

## 137. 설정 하단 고정 저장 버튼 되돌리기 (선택)

설정 화면 저장 버튼을 하단에 고정한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-settings-sticky-save.bat
```

또는:

```powershell
Copy-Item src.pre-settings-sticky-save\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-settings-sticky-save\help.html public\ -Force
```

## 138. 설정 기본값 칩 표시·기본값 버튼 제거 되돌리기 (선택)

설정 칩에 「· 기본」 표시 및 기본값 버튼 제거 후 문제가 생기면 아래로 복구합니다.

```bat
restore-settings-default-chips.bat
```

또는:

```powershell
Copy-Item src.pre-settings-default-chips\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-settings-default-chips\help.html public\ -Force
```

## 139. 설정 하단 바(뒤로가기·저장 한 줄) 되돌리기 (선택)

설정 화면 하단 바 정렬 후 문제가 생기면 아래로 복구합니다.

```bat
restore-settings-bottom-bar.bat
```

또는:

```powershell
Copy-Item src.pre-settings-bottom-bar\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-settings-bottom-bar\help.html public\ -Force
```

## 140. 설정 빠른 로드(한 번에 읽기·스피너 제거) 되돌리기 (선택)

설정 DB 일괄 로드 및 즉시 표시 후 문제가 생기면 아래로 복구합니다.

```bat
restore-settings-fast-load.bat
```

또는:

```powershell
Copy-Item src.pre-settings-fast-load\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-settings-fast-load\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-settings-fast-load\help.html public\ -Force
```

## 141. 앱 내 카메라 1x·3x·5x 배율 버튼 되돌리기 (선택)

앱 내 카메라 셔터 위 배율 프리셋 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-camera-zoom-presets.bat
```

또는:

```powershell
Copy-Item src.pre-camera-zoom-presets\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-zoom-presets\components\InAppCameraPreview.tsx src\components\ -Force
Copy-Item src.pre-camera-zoom-presets\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-zoom-presets\help.html public\ -Force
```

## 142. 앱 내 촬영음 켜기/끄기 되돌리기 (선택)

설정 「앱 내 촬영음」 옵션 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-shutter-sound.bat
```

또는:

```powershell
Copy-Item src.pre-shutter-sound\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-shutter-sound\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-shutter-sound\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-shutter-sound\help.html public\ -Force
```

## 143. 확대 뷰어 닫기·적용 손잡이 위치 되돌리기 (선택)

스탬프 저장·수정 확대 화면의 닫기·적용 버튼을 카메라 손잡이 쪽 하단(사진 버리기 위)에 둔 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-viewer-action-hand.bat
```

또는:

```powershell
Copy-Item src.pre-viewer-action-hand\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-viewer-action-hand\components\StampSaveZoomViewer.tsx src\components\ -Force
Copy-Item src.pre-viewer-action-hand\help.html public\ -Force
```

## 144. 층 school_only lastFloor/저장 가드 되돌리기 (선택)

「학교일 때만」에서 비학교 장소에 직전 층이 따라붙거나 저장되던 문제를 막은 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-floor-school-only.bat
```

또는:

```powershell
Copy-Item src.pre-floor-school-only\services\stampFloor.ts src\services\ -Force
Copy-Item src.pre-floor-school-only\services\quickCaptureSave.ts src\services\ -Force
Copy-Item src.pre-floor-school-only\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-floor-school-only\help.html public\ -Force
```

## 145. 저장 목록 성능 A+B 되돌리기 (선택)

목록 스탬프 우선 표시·FlatList 튜닝·디스크 썸네일 추가 후 문제가 생기면 아래로 복구합니다.

```bat
restore-list-perf-ab.bat
```

또는:

```powershell
Copy-Item src.pre-list-perf-ab\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-list-perf-ab\components\TrashScreen.tsx src\components\ -Force
Copy-Item src.pre-list-perf-ab\services\saveStamp.ts src\services\ -Force
Copy-Item src.pre-list-perf-ab\services\stampTrash.ts src\services\ -Force
Remove-Item src\services\stampThumb.ts, src\components\StampListThumb.tsx -ErrorAction SilentlyContinue
Copy-Item src.pre-list-perf-ab\help.html public\ -Force
```

## 146. 목록 검색 음성 마이크 되돌리기 (선택)

저장 목록 헤더 장식 마이크를 제거하고 제목·메모 검색창 앞에 음성 검색 마이크를 둔 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-list-search-mic.bat
```

또는:

```powershell
Copy-Item src.pre-list-search-mic\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-list-search-mic\help.html public\ -Force
```

## 147. 내보내기 파일명·보고서 제목 음성 마이크 되돌리기 (선택)

파일명·보고서 제목 모달에 손잡이 쪽 음성 마이크를 추가한 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-export-name-mic.bat
```

또는:

```powershell
Copy-Item src.pre-export-name-mic\components\ExportNameModal.tsx src\components\ -Force
Copy-Item src.pre-export-name-mic\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-export-name-mic\help.html public\ -Force
```

## 148. 위치 조회 「사용 안 함」= GPS+학교 DB만 되돌리기 (선택)

「사용 안 함」을 직전 장소 재사용에서 GPS·로컬 학교 DB만으로 바꾼 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-location-school-only.bat
```

또는:

```powershell
Copy-Item src.pre-location-school-only\services\*.ts src\services\ -Force
Copy-Item src.pre-location-school-only\components\StampSaveModal.tsx,src.pre-location-school-only\components\CameraScreen.tsx,src.pre-location-school-only\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-location-school-only\help.html public\ -Force
```

## 149. 저장 화면 손잡이쪽 확대 아이콘·폴더 선택 되돌리기 (선택)

미리보기 확대 아이콘·저장 폴더 [선택]을 카메라 손잡이 쪽에 맞춘 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-save-hand-side.bat
```

또는:

```powershell
Copy-Item src.pre-save-hand-side\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-hand-side\help.html public\ -Force
```

## 150. /report 행 삭제 되돌리기 (선택)

PC 보고서 편집에서 스탬프 행 삭제를 추가한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-report-row-delete.bat
```

또는:

```powershell
Copy-Item public.pre-report-row-delete\report.html,public.pre-report-row-delete\help.html,public.pre-report-row-delete\landing.html,public.pre-report-row-delete\info.html public\ -Force
```

## 151. 프로젝트 ZIP PDF 미포함 되돌리기 (선택)

목록 「프로젝트」저장에서 ZIP 내 report.pdf 생성을 끈 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-project-zip-no-pdf.bat
```

또는:

```powershell
Copy-Item src.pre-project-zip-no-pdf\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-project-zip-no-pdf\help.html public\ -Force
```

## 152. 내보내기 바이너리/청크 저장 되돌리기 (선택)

프로젝트·엑셀·HWPX의 base64 통짜 쓰기를 바이너리/스트리밍으로 바꾼 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-export-binary-write.bat
```

또는:

```powershell
Copy-Item src.pre-export-binary-write\services\*.ts src\services\ -Force
Remove-Item src\services\writeCacheFile.ts -ErrorAction SilentlyContinue
Copy-Item src.pre-export-binary-write\help.html public\ -Force
```

## 153. 카메라 권한 확인 중 화면 생략 되돌리기 (선택)

권한 로딩 문구를 제거하고 카메라 홈을 바로 보이게 한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-camera-permission-skip.bat
```

또는:

```powershell
Copy-Item src.pre-camera-permission-skip\components\CameraScreen.tsx src\components\ -Force
Copy-Item src.pre-camera-permission-skip\help.html public\ -Force
```

## 154. PDF 현장 폴더 저장 되돌리기 (선택)

PDF archive를 `exports/` 대신 `stamps/YYYYMMDD_장소명/`에 두도록 바꾼 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-export-site-folder.bat
```

또는:

```powershell
Copy-Item src.pre-export-site-folder\services\exportPdf.ts src\services\ -Force
Copy-Item public.pre-export-site-folder\help.html public\ -Force
```

## 155. 확대 크롭 적용(뷰포트) 되돌리기 (선택)

저장·수정 확대 화면의 크롭 영역을 화면(contain) 가시 영역 기준으로 맞춘 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-crop-viewport-fix.bat
```

또는:

```powershell
Copy-Item src.pre-crop-viewport-fix\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-crop-viewport-fix\help.html public\ -Force
Copy-Item src.pre-crop-viewport-fix\apkBuildLabel.ts src\constants\ -Force
Copy-Item src.pre-crop-viewport-fix\landing.html,src.pre-crop-viewport-fix\info.html public\ -Force
```

## 156. 확대 적용 라이브 크롭 되돌리기 (선택)

「적용」이 화면 줌 shared value를 직접 읽도록 한 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-crop-apply-live.bat
```

또는:

```powershell
Copy-Item src.pre-crop-apply-live\components\ZoomableImage.tsx,src.pre-crop-apply-live\components\StampSaveZoomViewer.tsx,src.pre-crop-apply-live\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-crop-apply-live\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-crop-apply-live\help.html public\ -Force
Copy-Item src.pre-crop-apply-live\constants\apkBuildLabel.ts src\constants\ -Force
Copy-Item src.pre-crop-apply-live\landing.html,src.pre-crop-apply-live\info.html public\ -Force
```

## 157. 확대 적용 UI 스레드 flush 되돌리기 (선택)

「적용」이 UI 스레드에서 줌을 flush 하도록 고친 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-crop-apply-ui-flush.bat
```

또는:

```powershell
Copy-Item src.pre-crop-apply-ui-flush\components\ZoomableImage.tsx,src.pre-crop-apply-ui-flush\components\StampSaveZoomViewer.tsx,src.pre-crop-apply-ui-flush\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-crop-apply-ui-flush\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-crop-apply-ui-flush\help.html public\ -Force
Copy-Item src.pre-crop-apply-ui-flush\constants\apkBuildLabel.ts src\constants\ -Force
Copy-Item src.pre-crop-apply-ui-flush\landing.html,src.pre-crop-apply-ui-flush\info.html public\ -Force
```

## 158. 크롭을 20260720_225635(6060a48)로 되돌린 것 취소 (선택)

줌·크롭을 `6060a48` / APK `225635` 동작으로 되돌린 뒤, 그 직전(UI flush 시대)으로 다시 가려면 아래로 복구합니다.

```bat
restore-revert-crop-225635.bat
```

또는:

```powershell
Copy-Item src.pre-revert-crop-225635\components\ZoomableImage.tsx,src.pre-revert-crop-225635\components\StampSaveZoomViewer.tsx,src.pre-revert-crop-225635\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-revert-crop-225635\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-revert-crop-225635\help.html public\ -Force
Copy-Item src.pre-revert-crop-225635\constants\apkBuildLabel.ts src\constants\ -Force
Copy-Item src.pre-revert-crop-225635\landing.html,src.pre-revert-crop-225635\info.html public\ -Force
```

## 159. 앱 내 카메라 크롭 적용 수정 되돌리기 (선택)

앱 내 고해상도 사진에서 getSize/onLayout이 줌을 지우고, 크롭 수식을 뷰포트 기준으로 맞춘 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-crop-inapp-fix.bat
```

또는:

```powershell
Copy-Item src.pre-crop-inapp-fix\components\ZoomableImage.tsx,src.pre-crop-inapp-fix\components\StampSaveZoomViewer.tsx,src.pre-crop-inapp-fix\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-crop-inapp-fix\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-crop-inapp-fix\help.html public\ -Force
Copy-Item src.pre-crop-inapp-fix\constants\apkBuildLabel.ts src\constants\ -Force
Copy-Item src.pre-crop-inapp-fix\landing.html,src.pre-crop-inapp-fix\info.html public\ -Force
```

## 160. 필드 표시명·워터마크 라벨 되돌리기 (선택)

설정에서 제목·장소·메모 표시명을 바꾸고 워터마크·PDF에 「표시명: 내용」을 붙인 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-field-labels.bat
```

또는:

```powershell
Copy-Item src.pre-field-labels\*.ts src\services\ -Force
Copy-Item src.pre-field-labels\components\*.tsx src\components\ -Force
Copy-Item src.pre-field-labels\public\help.html,src.pre-field-labels\public\landing.html,src.pre-field-labels\public\info.html public\ -Force
Copy-Item src.pre-field-labels\apkBuildLabel.ts src\constants\ -Force
Remove-Item src\services\fieldLabels.ts -ErrorAction SilentlyContinue
```

## 161. 추가1·추가2 필드 되돌리기 (선택)

스탬프에 추가1·추가2 입력 칸과 설정 표시명·워터마크·PDF·프로젝트 ZIP 반영을 넣은 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-extra-fields.bat
```

또는:

```powershell
Copy-Item src.pre-extra-fields\db\*.ts src\db\ -Force
Copy-Item src.pre-extra-fields\types\stamp.ts src\types\ -Force
Copy-Item src.pre-extra-fields\services\*.ts src\services\ -Force
Copy-Item src.pre-extra-fields\components\*.tsx src\components\ -Force
Copy-Item src.pre-extra-fields\public\help.html,src.pre-extra-fields\public\landing.html,src.pre-extra-fields\public\info.html public\ -Force
Copy-Item src.pre-extra-fields\report\watermark-export.js public\report\ -Force
Copy-Item src.pre-extra-fields\apkBuildLabel.ts src\constants\ -Force
```

## 162. 캡션·PDF 표 되돌리기 (선택)

별도 영역·PDF에 2열 표(표시명|내용)를 넣은 뒤 문제가 생기면 아래로 복구합니다. 워터마크 줄글은 유지됩니다.

```bat
restore-caption-table.bat
```

또는:

```powershell
Copy-Item src.pre-caption-table\services\*.ts src\services\ -Force
Copy-Item src.pre-caption-table\components\*.tsx src\components\ -Force
Copy-Item src.pre-caption-table\public\help.html,src.pre-caption-table\public\landing.html,src.pre-caption-table\public\info.html public\ -Force
Copy-Item src.pre-caption-table\report\watermark-export.js public\report\ -Force
Copy-Item src.pre-caption-table\apkBuildLabel.ts src\constants\ -Force
Remove-Item src\services\captionTable.ts -ErrorAction SilentlyContinue
```

## 163. 저장 화면 필드 순서 되돌리기 (선택)

저장 화면을 제목→장소(+층)→추가1·2→메모로 맞춘 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-save-field-order.bat
```

또는:

```powershell
Copy-Item src.pre-save-field-order\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-save-field-order\public\help.html public\ -Force
Copy-Item src.pre-save-field-order\apkBuildLabel.ts src\constants\ -Force
```

## 164. 크롭 EXIF 방향 정규화 되돌리기 (선택)

확대·적용 전 EXIF 방향을 픽셀에 굽는 변경 후 문제가 생기면 아래로 복구합니다.

```bat
restore-crop-orient.bat
```

또는:

```powershell
Copy-Item src.pre-crop-orient\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-crop-orient\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-crop-orient\public\help.html public\ -Force
Copy-Item src.pre-crop-orient\apkBuildLabel.ts src\constants\ -Force
Copy-Item src.pre-crop-orient\gallery-android\VoicestampGalleryModule.kt modules\voicestamp-gallery\android\src\main\java\expo\modules\voicestampgallery\ -Force
Copy-Item src.pre-crop-orient\gallery-src\index.ts modules\voicestamp-gallery\src\ -Force
```

## 165. 저장 화면 표시명 편집 되돌리기 (선택)

저장 화면에서 칸 이름 탭 수정·설정 저장을 넣은 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-save-label-edit.bat
```

또는:

```powershell
Copy-Item src.pre-save-label-edit\components\VoiceInputField.tsx,src.pre-save-label-edit\components\StampSaveModal.tsx,src.pre-save-label-edit\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-save-label-edit\public\help.html public\ -Force
Copy-Item src.pre-save-label-edit\apkBuildLabel.ts src\constants\ -Force
```

## 166. 스탬프별 표시명 스냅샷 되돌리기 (선택)

저장 시 칸 이름(표시명)을 스탬프 행에 보관·목록/내보내기 반영을 넣은 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-stamp-field-labels.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-field-labels\db\schema.ts,src.pre-stamp-field-labels\db\database.ts src\db\ -Force
Copy-Item src.pre-stamp-field-labels\types\stamp.ts src\types\ -Force
Copy-Item src.pre-stamp-field-labels\services\fieldLabels.ts,src.pre-stamp-field-labels\services\stampRepository.ts,src.pre-stamp-field-labels\services\saveStamp.ts,src.pre-stamp-field-labels\services\exportStampImage.ts,src.pre-stamp-field-labels\services\exportPdf.ts,src.pre-stamp-field-labels\services\exportProject.ts src\services\ -Force
Copy-Item src.pre-stamp-field-labels\components\StampListScreen.tsx,src.pre-stamp-field-labels\components\StampSaveModal.tsx,src.pre-stamp-field-labels\components\StampExportCard.tsx src\components\ -Force
Copy-Item src.pre-stamp-field-labels\public\help.html public\ -Force
Copy-Item src.pre-stamp-field-labels\apkBuildLabel.ts src\constants\ -Force
```

기기 DB에 이미 추가된 `*_field_label` 컬럼은 그대로 두어도 무방합니다.

## 167. 목록 빈 메모 숨김 되돌리기 (선택)

저장 목록에서 메모가 비어 있을 때 `(표시명 없음)`을 숨긴 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-list-hide-empty-memo.bat
```

또는:

```powershell
Copy-Item src.pre-list-hide-empty-memo\components\StampListScreen.tsx src\components\ -Force
Copy-Item src.pre-list-hide-empty-memo\public\help.html public\ -Force
Copy-Item src.pre-list-hide-empty-memo\apkBuildLabel.ts src\constants\ -Force
```

## 168. 확대 크롭 cover 일치 되돌리기 (선택)

확대 뷰어를 cover로 맞추고 크롭 수식을 화면에 맞춘 뒤 문제가 생기면 아래로 복구합니다.

```bat
restore-crop-cover-match.bat
```

또는:

```powershell
Copy-Item src.pre-crop-cover-match\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-crop-cover-match\components\ZoomableImage.tsx,src.pre-crop-cover-match\components\StampSaveZoomViewer.tsx,src.pre-crop-cover-match\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-crop-cover-match\public\help.html public\ -Force
Copy-Item src.pre-crop-cover-match\apkBuildLabel.ts src\constants\ -Force
```

## 169. 확대 크롭 cover 일치 적용분 롤백 기록

`7302cd4`(cover 뷰어·크롭)이 해결되지 않아 `restore-crop-cover-match.bat`로 **contain 수식·뷰어**로 되돌린 배포입니다. cover 쪽을 다시 쓰려면 해당 커밋을 참고하세요.

```bat
git show 7302cd4 -- src/services/stampImageCrop.ts src/components/ZoomableImage.tsx
```

## 170. 확대 자르기(적용) 비활성 되돌리기 (선택)

저장 확대 화면에서 「적용」 자르기를 끈 뒤 문제가 생기면 아래로 복구합니다(확대 미리보기는 유지된 상태의 적용 복구).

```bat
restore-disable-crop-apply.bat
```

또는:

```powershell
Copy-Item src.pre-disable-crop-apply\components\StampSaveModal.tsx,src.pre-disable-crop-apply\components\StampSaveZoomViewer.tsx src\components\ -Force
Copy-Item src.pre-disable-crop-apply\public\help.html public\ -Force
Copy-Item src.pre-disable-crop-apply\apkBuildLabel.ts src\constants\ -Force
```

## 171. 스탬프 글자 크기(A+B) 되돌리기 (선택)

설정 「글자 크기」(작게·보통·크게) — 입력 UI + 미리보기·워터마크·PDF·갤러리 내보내기. 문제 시:

```bat
restore-stamp-text-size.bat
```

또는:

```powershell
Copy-Item src.pre-stamp-text-size\services\*.ts src\services\ -Force
Copy-Item src.pre-stamp-text-size\components\*.tsx src\components\ -Force
Copy-Item src.pre-stamp-text-size\public\help.html public\ -Force
Copy-Item src.pre-stamp-text-size\apkBuildLabel.ts src\constants\ -Force
```

## 172. 장소명 prefetch 재조회 되돌리기 (선택)

저장 모달에서 프리페치에 장소명이 없을 때 한 번 더 조회하도록 한 뒤 문제가 생기면:

```bat
restore-place-label-retry.bat
```

또는:

```powershell
Copy-Item src.pre-place-label-retry\components\StampSaveModal.tsx src\components\ -Force
Copy-Item src.pre-place-label-retry\public\help.html,src.pre-place-label-retry\public\landing.html,src.pre-place-label-retry\public\info.html public\ -Force
Copy-Item src.pre-place-label-retry\constants\apkBuildLabel.ts src\constants\ -Force
```

## 173. 설정 저장 빠르게(1+2+3+4) 되돌리기 (선택)

설정 저장 dirty+트랜잭션·재로드 생략·짧은 알림. 문제 시:

```bat
restore-settings-save-fast.bat
```

또는:

```powershell
Copy-Item src.pre-settings-save-fast\services\settingsService.ts src\services\ -Force
Copy-Item src.pre-settings-save-fast\components\SettingsScreen.tsx src\components\ -Force
Copy-Item src.pre-settings-save-fast\public\help.html,src.pre-settings-save-fast\public\landing.html,src.pre-settings-save-fast\public\info.html public\ -Force
Copy-Item src.pre-settings-save-fast\constants\apkBuildLabel.ts src\constants\ -Force
```

## 174. 앱내 카메라 미리보기 맞춤 저장 되돌리기 (선택)

앱내 촬영 후 FILL 미리보기 비율로 크롭 저장. 문제 시:

```bat
restore-inapp-preview-crop.bat
```

또는:

```powershell
Copy-Item src.pre-inapp-preview-crop\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-inapp-preview-crop\components\CameraScreen.tsx,src.pre-inapp-preview-crop\components\InAppCameraPreview.tsx src\components\ -Force
Copy-Item src.pre-inapp-preview-crop\public\help.html,src.pre-inapp-preview-crop\public\landing.html,src.pre-inapp-preview-crop\public\info.html public\ -Force
Copy-Item src.pre-inapp-preview-crop\constants\apkBuildLabel.ts src\constants\ -Force
```

## 175. 앱내 미리보기 크롭 롤백 되돌리기 (선택)

FILL 맞춤 크롭을 다시 넣으려면:

```bat
restore-revert-inapp-preview-crop.bat
```

또는:

```powershell
Copy-Item src.pre-revert-inapp-preview-crop\services\stampImageCrop.ts src\services\ -Force
Copy-Item src.pre-revert-inapp-preview-crop\components\CameraScreen.tsx,src.pre-revert-inapp-preview-crop\components\InAppCameraPreview.tsx src\components\ -Force
Copy-Item src.pre-revert-inapp-preview-crop\public\help.html,src.pre-revert-inapp-preview-crop\public\landing.html,src.pre-revert-inapp-preview-crop\public\info.html public\ -Force
Copy-Item src.pre-revert-inapp-preview-crop\constants\apkBuildLabel.ts src\constants\ -Force
```

## 176. 저장 템플릿·추가3 필드 되돌리기 (선택)

홈 템플릿 아이콘·extra3·필드 템플릿. 문제 시:

```bat
restore-field-templates.bat
```

(`src.pre-field-templates`로 복구. 신규 `stampFieldTemplates.ts`·`FieldTemplateSheet.tsx`는 삭제됨. `assets\template-icon.png`는 수동 삭제.)

## 177. 홈 네비 아이콘(템플릿 교체·1.3배) 되돌리기 (선택)

`img/temp.png` 기반 투명 템플릿 아이콘 · 홈 아이콘 1.3배. 문제 시:

```bat
restore-home-nav-icons.bat
```

## 178. 템플릿 표시명 깜빡임 수정 되돌리기 (선택)

저장 모달 첫 화면이 제목/장소로 잠깐 보이던 현상 수정. 문제 시:

```bat
restore-template-label-flash.bat
```

## 179. 저장 템플릿 6종 추가 되돌리기 (선택)

교육·급식·지원·자산·재난·민원 템플릿 추가. 문제 시:

```bat
restore-more-field-templates.bat
```

## 180. 저장 템플릿 시트 스크롤·여백 되돌리기 (선택)

제목 고정·목록 스크롤·닫기 하단 여백. 문제 시:

```bat
restore-template-sheet-scroll.bat
```

## 181. 내 템플릿(사용자 정의) 되돌리기 (선택)

내 템플릿 만들기·수정·삭제(기기 SQLite). 문제 시:

```bat
restore-custom-field-templates.bat
```

(`src.pre-custom-field-templates`로 복구. 신규 `CustomFieldTemplateEditor.tsx`는 삭제됨.)

## 182. 별도영역 이미지 초록 테두리 되돌리기 (선택)

캡션 JPEG 흰 캔버스(반투명 노랑→초록 테두리) 수정. 문제 시:

```bat
restore-caption-green-border.bat
```

## 183. 별도영역 이미지 표 표시 되돌리기 (선택)

이미지 내보내기 2열 표(PDF와 동일). 문제 시:

```bat
restore-caption-image-table.bat
```

## 184. 저장 목록 표시 모드 되돌리기 (선택)

설정 「저장 목록 표시」(제목·날짜만 / 전체). 문제 시:

```bat
restore-list-display-mode.bat
```

## 185. 별도영역 이미지 흐림(워시) 되돌리기 (선택)

캡션 JPEG를 ViewShot 대신 네이티브 불투명 합성으로 바꾼 뒤 문제가 생기면:

```bat
restore-caption-export-wash.bat
```

파일을 스냅샷에서 덮어쓴 뒤 Metro/앱을 다시 로드하세요.

---

## 186. 개인정보 가리기(블러) 되돌리기 (선택)

온디바이스 얼굴·숫자 모자이크 블러(AI-ML-02) 추가 후 문제가 생기면:

```bat
restore-privacy-blur.bat
```

`src.pre-privacy-blur/` 스냅샷으로 `StampSaveModal`·`SettingsScreen`·`settingsService`·`package.json` 등을 되돌리고 `modules/voicestamp-mlkit`·`PrivacyBlurModal` 등을 제거합니다. `app_settings` 키 `privacy_blur_enabled`는 남아도 무해합니다.

---

## 187. 개인정보 가리기 해상도 비례 강도 되돌리기 (선택)

약·중·강 모자이크를 사진 해상도·영역 크기 비례로 바꾼 뒤 문제가 생기면:

```bat
restore-privacy-blur-scale.bat
```

`VoicestampMlkitModule.kt`를 고정 px(12/24/40) 버전으로 되돌립니다.


---

## 188. 하단 촬영 일시 설정 되돌리기 (선택)

설정 「하단 촬영 일시」를 제목 접두어와 분리한 뒤 문제가 생기면:

```bat
restore-export-footer-datetime.bat
```

`src.pre-export-footer-datetime/` 스냅샷으로 관련 서비스·설정·미리보기·목록을 되돌립니다. DB 키 `export_footer_datetime`은 남아도 무해합니다.

---

## 189. 개인정보 가리기 EXIF 정렬 되돌리기 (선택)

시스템 카메라 JPEG의 EXIF 회전을 bake한 뒤 감지·모자이크하도록 바꾸 뒤 문제가 생기면:

```bat
restore-privacy-blur-exif.bat
```

`src.pre-privacy-blur-exif/` 스냅샷으로 `privacyBlurService`·`PrivacyBlurModal`·도움말을 되돌립니다.

---

## 190. 앱 내 카메라 전·후면 전환 되돌리기 (선택)

앱 내 카메라 전면/후면 전환을 넣은 뒤 문제가 생기면:

```bat
restore-inapp-camera-facing.bat
```

`src.pre-inapp-camera-facing/` 스냅샷으로 `CameraScreen`·`InAppCameraPreview`·도움말을 되돌립니다.

---

---

## 191. ML Kit scene keywords (AI-ML-01) rollback (optional)

If scene keyword auto-fill (Image Labeling) causes issues:

```bat
restore-mlkit-scene.bat
```

Restores settings / save modal / native module from `src.pre-mlkit-scene/`.
DB key `mlkit_scene_label_enabled` may remain and is harmless.

---

## 192. OCR 메모 긴 글 스크롤 되돌리기 (선택)

「글자 읽어 채우기」 후 긴 메모 칸·시트 스크롤을 넣은 뒤 문제가 생기면:

```bat
restore-ocr-memo-scroll.bat
```

`src.pre-ocr-memo-scroll/` 스냅샷으로 `VoiceInputField`·`StampSaveModal`·도움말을 되돌립니다.

---

## 193. 웹 제한 안내 + OCR/가리기 버튼 가로 배치 되돌리기 (선택)

웹 `/app` 진입 전 안내 화면 또는 저장 화면 버튼 가로 배치 후 문제가 생기면:

```bat
restore-web-limit-ocr-row.bat
```

`src.pre-web-limit-ocr-row/` 스냅샷으로 `App.tsx`·`StampSaveModal`·도움말을 되돌리고 `WebLimitNoticeScreen.tsx`를 삭제합니다.

---

## 194. 시작 배너(mainint) 되돌리기 (선택)

시작 화면(`assets/start.png`)을 `mainint` 키비주얼로 교체한 뒤 문제가 생기면:

```bat
restore-start-mainint.bat
```

`assets.pre-start-mainint/`·`src.pre-start-mainint/`·`public.pre-start-mainint/` 스냅샷으로 `start.png`·`StartScreen.tsx`·도움말을 되돌립니다.

---

## 195. 카메라 홈(mainint) 되돌리기 (선택)

촬영 전 카메라 홈(`assets/camera-home.png`)을 `mainint` 키비주얼로 교체한 뒤 문제가 생기면:

```bat
restore-camera-home-mainint.bat
```

`assets.pre-camera-home-mainint/`·`public.pre-camera-home-mainint/` 스냅샷으로 `camera-home.png`·도움말을 되돌립니다.

---

## 196. 카메라 홈 배경 설정 되돌리기 (선택)

설정에서 카메라 홈 배경(기본/스타일 2)을 고르는 기능을 넣은 뒤 문제가 생기면:

```bat
restore-camera-home-bg.bat
```

`src.pre-camera-home-bg/`·`public.pre-camera-home-bg/` 스냅샷으로 설정·카메라 화면·도움말을 되돌립니다. DB 키 `camera_home_bg`는 남아도 무해합니다.

---

## 197. 카메라 홈 기본값 mainint1 되돌리기 (선택)

카메라 홈 기본 배경을 mainint1(검정 뒤 배경)으로 바꾼 뒤 문제가 생기면:

```bat
restore-camera-home-default-mainint1.bat
```

`src.pre-camera-home-default-mainint1/`·`public.pre-camera-home-default-mainint1/` 스냅샷으로 되돌립니다.

---

## 198. 카메라 홈 기본/스타일2 뒤 배경색 되돌리기 (선택)

기본=mainint(검정)·스타일2=mainint1(흰색) 매핑 후 문제가 생기면:

`at
restore-camera-home-bg-colors.bat
`

src.pre-camera-home-bg-colors/·public.pre-camera-home-bg-colors/·ssets.pre-camera-home-bg-colors/ 스냅샷으로 되돌립니다.

---

## 199. 왼손 카메라 홈 테마 되돌리기 (선택)

왼손 손잡이일 때 홈 배경·목록/설정 아이콘을 고정 테마로 덮어쓴 뒤 문제가 생기면:

`at
restore-camera-hand-theme.bat
`

src.pre-camera-hand-theme/·public.pre-camera-hand-theme/ 스냅샷으로 카메라·설정·도움말을 되돌립니다.

---

## 200. 랜딩 웹테스트 링크 되돌리기 (선택)

홈(/) APK 파일명 아래 큰 「웹테스트」 링크를 넣은 뒤 문제가 생기면:

`at
restore-landing-web-test-link.bat
`

public.pre-landing-web-test-link/ 스냅샷으로 landing.html·help.html을 되돌립니다.

---

## 201. QR URL 마이크·https:// 기본값 되돌리기 (선택)

QR URL(별도 영역)에 마이크와 기본 https:// 를 넣은 뒤 문제가 생기면:

`at
restore-qr-url-mic.bat
`

src.pre-qr-url-mic/·public.pre-qr-url-mic/ 스냅샷으로 저장 모달·도움말을 되돌립니다.

---

## 202. 웹 보안 헤더·visitor·report 되돌리기 (선택)

랜딩 보안 헤더·방문 API 제한·보고서 imageFile 검증 후 문제가 생기면:

`at
restore-web-security-harden.bat
`

public.pre-web-security-harden/·pi.pre-web-security-harden/ 스냅샷으로 되돌립니다.

---

## 203. QR URL 연결확인 되돌리기 (선택)

저장 화면 QR URL 「연결확인」 추가 후 문제가 생기면:

```bat
restore-qr-url-check.bat
```

src.pre-qr-url-check/·public.pre-qr-url-check/ 스냅샷으로 되돌리고 `qrUrlConnectCheckService.ts`를 삭제합니다.

---

## 204. 성능 번들 A 되돌리기 (선택)

촬영 JPEG 상한·갤러리 유휴 직렬 큐·기본 갤러리「앱만」 적용 후 문제가 생기면:

```bat
restore-perf-bundle-a.bat
```

src.pre-perf-bundle-a/·public.pre-perf-bundle-a/ 스냅샷으로 되돌리고 `captureImageBudget.ts`·`gallerySaveIdleQueue.ts`를 삭제합니다.

---

## 205. 성능 번들 B 되돌리기 (선택)

Kakao POI 축소·장면 키워드 버튼화 후 문제가 생기면:

```bat
restore-perf-bundle-b.bat
```

src.pre-perf-bundle-b/·public.pre-perf-bundle-b/ 스냅샷으로 되돌립니다.

---

## 206. 성능 번들 C 되돌리기 (선택)

목록 내보내기 동적 import 분리 후 문제가 생기면:

```bat
restore-perf-bundle-c.bat
```

src.pre-perf-bundle-c/·public.pre-perf-bundle-c/ 스냅샷으로 되돌리고 `exportOnDemand.ts`를 삭제합니다.

---

## 207. 음성 타깃 가드 되돌리기 (선택)

목록 내보내기 마이크와 검색 마이크 혼입 방지 후 문제가 생기면:

```bat
restore-speech-target-guard.bat
```

src.pre-speech-target-guard/·public.pre-speech-target-guard/ 스냅샷으로 되돌립니다.

---

## 208. 저장 목록 행 간격·테두리 되돌리기 (선택)

목록 카드 테두리·그림자 축소 후 문제가 생기면:

```bat
restore-list-row-compact.bat
```

src.pre-list-row-compact/·public.pre-list-row-compact/ 스냅샷으로 되돌립니다.

---

## 209. 저장 목록 행 높이 추가 축소 되돌리기 (선택)

썸네일·행 패딩 추가 축소 후 문제가 생기면:

```bat
restore-list-row-tighter.bat
```

src.pre-list-row-tighter/·public.pre-list-row-tighter/ 스냅샷으로 되돌립니다.

---

## 210. 설정 필드 표시명 UI 제거 되돌리기 (선택)

설정 「필드 표시명」입력 칸 제거 후 문제가 생기면:

```bat
restore-hide-settings-field-labels.bat
```

src.pre-hide-settings-field-labels/·public.pre-hide-settings-field-labels/ 스냅샷으로 되돌립니다.

---

## 211. 목록 선택 취소 흰 썸네일 되돌리기 (선택)

선택 취소 후 썸네일 공백 수정 후 문제가 생기면:

```bat
restore-list-thumb-selection-fix.bat
```

src.pre-list-thumb-selection-fix/·public.pre-list-thumb-selection-fix/ 스냅샷으로 되돌립니다.

---

## 212. 목록 저장 유형 필터 (선택)

저장 유형(`template_id`)·칩 필터·행 배지 추가 후 문제가 생기면:

```bat
restore-template-list-filter.bat
```

src.pre-template-list-filter/·public.pre-template-list-filter/ 스냅샷으로 되돌립니다.

---

## 214. 장소 칩 · 저장 모달 유형 선택 되돌리기 (선택)

목록 장소 칩·저장 화면 유형 선택(다음 기본값) 추가 후 문제가 생기면:

```bat
restore-place-chip-save-template.bat
```

src.pre-place-chip-save-template/·public.pre-place-chip-save-template/ 스냅샷으로 되돌립니다.

---

## 215. 앨범 EXIF 촬영 위치 되돌리기 (선택)

앨범 가져오기 EXIF GPS 장소 적용 후 문제가 생기면:

```bat
restore-gallery-exif-place.bat
```

src.pre-gallery-exif-place/·public.pre-gallery-exif-place/ 스냅샷으로 되돌립니다.

---

## 216. 앨범 EXIF 파서·비가압 되돌리기 (선택)

앨범 quality 생략·유리수 파싱 보강 후 문제가 생기면:

```bat
restore-gallery-exif-parser.bat
```

src.pre-gallery-exif-parser/·public.pre-gallery-exif-parser/ 스냅샷으로 되돌립니다.

---

## 213. 웹 저장 알림·사진 persist 되돌리기 (선택)

웹테스트 설정/스탬프 저장 안내·브라우저 사진 저장 수정 후 문제가 생기면:

```bat
restore-web-save-alert.bat
```

src.pre-web-save-alert/·public.pre-web-save-alert/ 스냅샷으로 되돌립니다.

---

## 217. 저장 직후 칸 말하기 되돌리기 (선택)

새 저장 화면 제목→장소→메모 순차 마이크 안내 후 문제가 생기면:

`at
restore-save-slot-speech.bat
`

src.pre-save-slot-speech/·public.pre-save-slot-speech/ 스냅샷으로 되돌리고 SaveSlotSpeechSheet.tsx를 삭제합니다.

---

## 218. 칸 말하기 유형·예시 되돌리기 (선택)

시트 상단 저장 유형·칸별 말하기 예 보강 후 문제가 생기면:

`at
restore-slot-speech-type-hint.bat
`

src.pre-slot-speech-type-hint/·public.pre-slot-speech-type-hint/ 스냅샷으로 되돌립니다.

---

## 219. 항목 말하기 표시명 되돌리기 (선택)

UI 문구(항목 말하기 / 저장 직후 음성으로 항목 채우기) 변경 후 문제가 생기면:

```bat
restore-item-speak-label.bat
```

src.pre-item-speak-label/·public.pre-item-speak-label/ 스냅샷으로 되돌립니다.


---

## 220. 목록 하단 갤러리·촬영 버튼 맞춤 되돌리기 (선택)

contain + 높이 56 변경 후 문제가 생기면:

```bat
restore-list-bottom-btn-fit.bat
```

src.pre-list-bottom-btn-fit/·public.pre-list-bottom-btn-fit/ 스냅샷으로 되돌립니다.

---

## 221. 랜딩 히어로 배너 되돌리기 (선택)

홈(/) 히어로 배너·섹션 카피 변경 후 문제가 생기면:

```bat
restore-landing-hero.bat
```

public.pre-landing-hero/ 스냅샷으로 landing.html·help.html을 되돌립니다. (hero PNG는 수동 삭제)

---

## 222. 항목 말하기 보조 버튼 테두리 되돌리기 (선택)

「지금까지 넣기」「적용 없이 닫기」테두리 스타일 변경 후 문제가 생기면:

```bat
restore-slot-speech-link-border.bat
```

src.pre-slot-speech-link-border/ 스냅샷으로 SaveSlotSpeechSheet.tsx를 되돌립니다.


---

## 223. APK �ٿ�ε� ��ũ 20260805_164947 �ǵ����� (����)

`at
restore-apk-download-20260805_164947.bat
`

public.pre-apk-download-20260805_164947/ ���������� landing��info��apkBuildLabel�� �ǵ����ϴ�.

---

## 224. 워터마크 JPEG QR 되돌리기 (선택)

워터마크에도 QR 합성 추가 후 문제가 생기면:

```bat
restore-watermark-qr.bat
```

src.pre-watermark-qr/·public.pre-watermark-qr/ 스냅샷으로 되돌립니다.

---

## 225. APK download 20260805_174155 rollback

```bat
restore-apk-download-20260805_174155.bat
```r

---

## 226. 템플릿 행 복사·적용 배경 되돌리기 (선택)

행 옆 「복사」·적용 중 파란 배경 변경 후 문제가 생기면:

```bat
restore-template-row-copy.bat
```

src.pre-template-row-copy/·public.pre-template-row-copy/ 스냅샷으로 되돌립니다.

---

## 227. 작업내용기록 기본 템플릿 되돌리기 (선택)

작업내용기록 기본 템플릿 추가 후 문제가 생기면:

```bat
restore-work-content-template.bat
```

src.pre-work-content-template/·public.pre-work-content-template/ 스냅샷으로 되돌립니다.

---

## 228. 행사·사고조사 기본 템플릿 되돌리기 (선택)

행사기록·사고조사기록 추가 후 문제가 생기면:

```bat
restore-event-accident-templates.bat
```

src.pre-event-accident-templates/·public.pre-event-accident-templates/ 스냅샷으로 되돌립니다.

---

## 229. 탐구·여행 기본 템플릿 되돌리기 (선택)

탐구기록·여행기록 추가 후 문제가 생기면:

```bat
restore-inquiry-travel-templates.bat
```

src.pre-inquiry-travel-templates/·public.pre-inquiry-travel-templates/ 스냅샷으로 되돌립니다.

---

## 230. 후속 스탬프 연결 되돌리기 (선택)

후속 스탬프 연결 후 문제가 생기면:

```bat
restore-follow-link.bat
```

src.pre-follow-link/·public.pre-follow-link/ 스냅샷으로 되돌리고 FollowLinkCompareSheet.tsx를 제거합니다.

---

## 231. 목록 원본 표시 되돌리기 (선택)

후속 있는 원본 `(원본)` 표시 후 문제가 생기면:

```bat
restore-follow-root-label.bat
```

src.pre-follow-root-label/·public.pre-follow-root-label/ 스냅샷으로 되돌립니다.

---

## 233. 사업 QR 일시 취합 되돌리기 (선택)

사업 취합(FEAT-NCP-PROJECT-01) 후 문제가 생기면:

```bat
restore-ncp-project-qr.bat
```

src.pre-ncp-project-qr/ · public.pre-ncp-project-qr/ · api.pre-ncp-project-qr/ 스냅샷으로 되돌리고 신규 파일을 제거합니다.

---

## 234. NCP Put AccessDenied 수정 되돌리기 (선택)

사업 만들기 API Put 서명 수정 후 문제가 생기면:

```bat
restore-ncp-put-fix.bat
```

`api.pre-ncp-put-fix/project.js`로 `api/project.js`를 되돌린 뒤 Vercel을 재배포합니다.


## 235. 사업 QR 격자 표시 되돌리기 (선택)

사업 취합 QR이 모듈 격자로 바뀐 뒤 문제가 생기면:

```bat
restore-project-qr-matrix.bat
```

`src.pre-project-qr-matrix/` 스냅샷으로 `ProjectCollectScreen.tsx`를 되돌립니다.


## 236. 수신 하단 바·QR https 되돌리기 (선택)

수신 목록 하단 여백·QR https 페이로드 변경 후 문제가 생기면:

`at
restore-project-inbox-qr-https.bat
`

src.pre-project-inbox-qr-https/ · pi.pre-project-inbox-qr-https/ 스냅샷으로 되돌린 뒤 API 변경분은 Vercel 재배포합니다.


## 237. 사업 참여 QR 찍기 되돌리기 (선택)

앱 내 QR 찍기·참여 후 카메라 이동 후 문제가 생기면:

`at
restore-project-join-scan.bat
`

src.pre-project-join-scan/ 스냅샷으로 되돌립니다.


## 238. 사업 참여 구분 표시 되돌리기 (선택)

코드/QR 참여 시 선택 구분 표시·uploadedByMark 후 문제가 생기면:

```bat
restore-project-join-label.bat
```

`src.pre-project-join-label/` · `api.pre-project-join-label/` 스냅샷으로 되돌린 뒤 API 변경분은 Vercel 재배포합니다.

