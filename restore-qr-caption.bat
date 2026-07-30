@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-qr-caption\services\settingsService.ts" (
  echo Backup not found: src.pre-qr-caption
  exit /b 1
)
copy /Y "src.pre-qr-caption\services\settingsService.ts" "src\services\settingsService.ts" >nul
copy /Y "src.pre-qr-caption\services\stampRepository.ts" "src\services\stampRepository.ts" >nul
copy /Y "src.pre-qr-caption\services\saveStamp.ts" "src\services\saveStamp.ts" >nul
copy /Y "src.pre-qr-caption\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts" >nul
copy /Y "src.pre-qr-caption\services\exportStampImage.ts" "src\services\exportStampImage.ts" >nul
copy /Y "src.pre-qr-caption\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-qr-caption\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
copy /Y "src.pre-qr-caption\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx" >nul
copy /Y "src.pre-qr-caption\db\schema.ts" "src\db\schema.ts" >nul
copy /Y "src.pre-qr-caption\db\database.ts" "src\db\database.ts" >nul
copy /Y "src.pre-qr-caption\types\stamp.ts" "src\types\stamp.ts" >nul
if exist "src\services\qrCodeService.ts" del /F /Q "src\services\qrCodeService.ts"
if exist "src\services\qrUrlExtractService.ts" del /F /Q "src\services\qrUrlExtractService.ts"
if exist "src.pre-qr-caption\public\help.html" copy /Y "src.pre-qr-caption\public\help.html" "public\help.html" >nul
if exist "src.pre-qr-caption\public\privacy.html" copy /Y "src.pre-qr-caption\public\privacy.html" "public\privacy.html" >nul
if exist "src.pre-qr-caption\public\landing.html" copy /Y "src.pre-qr-caption\public\landing.html" "public\landing.html" >nul
if exist "src.pre-qr-caption\public\info.html" copy /Y "src.pre-qr-caption\public\info.html" "public\info.html" >nul
if exist "src.pre-qr-caption\constants\apkBuildLabel.ts" copy /Y "src.pre-qr-caption\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
if exist "src.pre-qr-caption\package.json" copy /Y "src.pre-qr-caption\package.json" "package.json" >nul
echo Restored qr-caption from src.pre-qr-caption
echo Note: run npm install if package.json was restored
