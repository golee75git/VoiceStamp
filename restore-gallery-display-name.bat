@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-gallery-display-name\services\galleryService.ts" (
  echo Backup not found: src.pre-gallery-display-name
  exit /b 1
)
copy /Y "src.pre-gallery-display-name\services\galleryService.ts" "src\services\galleryService.ts"
copy /Y "src.pre-gallery-display-name\package.json" "package.json"
echo Restored gallery DISPLAY_NAME native rollback from src.pre-gallery-display-name
echo Run: npm install
echo Optional: remove modules\voicestamp-gallery if no longer needed
