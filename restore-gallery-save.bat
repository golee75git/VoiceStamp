@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-gallery-save\services\saveStamp.ts" (
  echo Backup not found: src.pre-gallery-save
  exit /b 1
)
copy /Y "src.pre-gallery-save\app.json" "app.json"
copy /Y "src.pre-gallery-save\package.json" "package.json"
copy /Y "src.pre-gallery-save\services\saveStamp.ts" "src\services\saveStamp.ts"
if exist "src\services\galleryService.ts" del "src\services\galleryService.ts"
echo Restored gallery save rollback from src.pre-gallery-save
echo Run: npm install
