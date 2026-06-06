@echo off
setlocal
cd /d "%~dp0"
set "SRC=C:\Users\PJY\.cursor\projects\c-VoiceStamp\assets\c__Users_PJY_AppData_Roaming_Cursor_User_workspaceStorage_9f053dbc23b0fc0d0b0b41e77d91da68_images_9035c77b-aa42-4918-bef0-836a6bc6a47d-1e6822f8-39a6-406a-aa08-43d2d072c5fe.png"
if not exist "%SRC%" (
  echo ERROR: Source icon image not found: %SRC%
  exit /b 1
)
if not exist "assets.pre-icon" (
  xcopy "assets" "assets.pre-icon\" /E /I /Y >nul
  echo Created backup assets.pre-icon
)
copy /Y "%SRC%" "assets\icon.png" >nul
copy /Y "%SRC%" "assets\android-icon-foreground.png" >nul
copy /Y "%SRC%" "assets\favicon.png" >nul
echo Applied icon to assets\icon.png, android-icon-foreground.png, favicon.png
echo Run: npx expo prebuild --platform android --no-install
echo Then rebuild APK with build-apk.bat
exit /b 0
