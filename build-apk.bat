@echo off
chcp 65001 >nul
cd /d "%~dp0"
set ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a

if /I "%~1"=="debug" goto :debug

echo [1/3] Release APK build (arm64, standalone)
echo      First build may take 10-30 minutes.
cd android
call gradlew.bat assembleRelease --no-daemon
if errorlevel 1 exit /b 1
cd ..
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "VoiceStamp.apk" >nul
echo.
echo [2/3] Done: %~dp0VoiceStamp.apk
echo [3/3] Install on phone and allow camera/mic permissions.
goto :eof

:debug
echo [1/2] Debug APK build (requires Metro)
cd android
call gradlew.bat assembleDebug --no-daemon
if errorlevel 1 exit /b 1
cd ..
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "VoiceStamp-debug.apk" >nul
echo.
echo [2/2] Done: %~dp0VoiceStamp-debug.apk
