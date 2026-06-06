@echo off
cd /d "%~dp0"
set ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a

if /I "%~1"=="debug" goto :debug

echo [1/3] Release APK 빌드 중 (arm64, JS 포함 - PC/Metro 없이 설치 가능)
echo      첫 빌드는 10~30분 걸릴 수 있습니다.
cd android
call gradlew.bat assembleRelease --no-daemon
if errorlevel 1 exit /b 1
cd ..
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "VoiceStamp.apk" >nul
echo.
echo [2/3] 완료: %~dp0VoiceStamp.apk
echo [3/3] 폰에 설치 후 카메라 권한을 허용하세요.
goto :eof

:debug
echo [1/2] Debug APK 빌드 중 (Metro 서버 필요 - 개발용)
cd android
call gradlew.bat assembleDebug --no-daemon
if errorlevel 1 exit /b 1
cd ..
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "VoiceStamp-debug.apk" >nul
echo.
echo [2/2] 완료: %~dp0VoiceStamp-debug.apk (npx expo start 필요)
