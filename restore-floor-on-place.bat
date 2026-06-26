@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-floor-on-place\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-floor-on-place
  exit /b 1
)
copy /Y "src.pre-floor-on-place\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-floor-on-place\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-floor-on-place\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-floor-on-place\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-floor-on-place\services\stampFloor.ts" "src\services\stampFloor.ts"
copy /Y "src.pre-floor-on-place\services\stampPlace.ts" "src\services\stampPlace.ts"
copy /Y "src.pre-floor-on-place\services\floorDisplayMode.ts" "src\services\floorDisplayMode.ts"
echo Restored floor-on-place rollback from src.pre-floor-on-place
