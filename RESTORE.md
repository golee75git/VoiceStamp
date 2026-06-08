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
