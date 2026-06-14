@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-place-cache\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-location-place-cache
  exit /b 1
)
copy /Y "src.pre-location-place-cache\services\locationService.ts" "src\services\locationService.ts"
copy /Y "src.pre-location-place-cache\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-location-place-cache\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src\utils\geoDistance.ts" del /Q "src\utils\geoDistance.ts"
echo Restored location place cache rollback (§94)
