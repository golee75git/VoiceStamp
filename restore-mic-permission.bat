@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "app.json.pre-mic-permission" (
  echo Backup not found: app.json.pre-mic-permission
  exit /b 1
)
copy /Y "app.json.pre-mic-permission" "app.json" >nul
echo Restored mic-permission rollback from app.json.pre-mic-permission
echo Run: npx expo prebuild --platform android --no-install
echo Then: build-apk.bat
