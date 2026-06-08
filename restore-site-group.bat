@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-site-group\services\saveStamp.ts" (
  echo Backup not found: src.pre-site-group
  exit /b 1
)
copy /Y "src.pre-site-group\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-site-group\services\fileService.ts" "src\services\fileService.ts"
copy /Y "src.pre-site-group\services\galleryService.ts" "src\services\galleryService.ts"
copy /Y "src.pre-site-group\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-site-group\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-site-group\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored site-group rollback from src.pre-site-group
