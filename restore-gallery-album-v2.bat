@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-gallery-album-v2\services\galleryService.ts" (
  echo Backup not found: src.pre-gallery-album-v2
  exit /b 1
)
copy /Y "src.pre-gallery-album-v2\services\galleryService.ts" "src\services\galleryService.ts"
echo Restored gallery-album-v2 rollback from src.pre-gallery-album-v2
