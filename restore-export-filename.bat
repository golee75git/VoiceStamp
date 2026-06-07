@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-export-filename\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-export-filename
  exit /b 1
)
copy /Y "src.pre-export-filename\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-export-filename\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-export-filename\services\galleryService.ts" "src\services\galleryService.ts"
echo Restored export-filename rollback from src.pre-export-filename
