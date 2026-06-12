@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-gallery-filename\services\galleryService.ts" (
  echo Backup not found: src.pre-gallery-filename
  exit /b 1
)
copy /Y "src.pre-gallery-filename\services\galleryService.ts" "src\services\galleryService.ts"
copy /Y "src.pre-gallery-filename\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-gallery-filename\services\exportStampImage.ts" "src\services\exportStampImage.ts"
echo Restored gallery filename handling from src.pre-gallery-filename
