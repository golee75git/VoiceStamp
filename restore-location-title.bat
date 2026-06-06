@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-title\services\fileService.ts" (
  echo Backup not found: src.pre-location-title
  exit /b 1
)
copy /Y "src.pre-location-title\services\fileService.ts" "src\services\fileService.ts"
copy /Y "src.pre-location-title\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-location-title\app.json" "app.json"
copy /Y "src.pre-location-title\package.json" "package.json"
if exist "src\services\kakaoLocal.ts" del "src\services\kakaoLocal.ts"
if exist "src\services\locationService.ts" del "src\services\locationService.ts"
echo Restored location title behavior from src.pre-location-title
echo Run: npm install
