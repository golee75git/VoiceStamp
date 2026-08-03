@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-gallery-exif-parser\services\pickStampImage.ts" (
  echo Backup not found: src.pre-gallery-exif-parser
  exit /b 1
)
copy /Y "src.pre-gallery-exif-parser\services\pickStampImage.ts" "src\services\pickStampImage.ts" >nul
if exist "public.pre-gallery-exif-parser\help.html" copy /Y "public.pre-gallery-exif-parser\help.html" "public\help.html" >nul
echo Restored gallery-exif-parser from src.pre-gallery-exif-parser
