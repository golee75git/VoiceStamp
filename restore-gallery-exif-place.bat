@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-gallery-exif-place\services\pickStampImage.ts" (
  echo Backup not found: src.pre-gallery-exif-place
  exit /b 1
)
copy /Y "src.pre-gallery-exif-place\services\pickStampImage.ts" "src\services\pickStampImage.ts" >nul
copy /Y "src.pre-gallery-exif-place\services\locationService.ts" "src\services\locationService.ts" >nul
copy /Y "src.pre-gallery-exif-place\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-gallery-exif-place\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "public.pre-gallery-exif-place\help.html" copy /Y "public.pre-gallery-exif-place\help.html" "public\help.html" >nul
echo Restored gallery-exif-place from src.pre-gallery-exif-place
