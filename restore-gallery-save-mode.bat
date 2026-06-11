@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-gallery-save-mode\services\saveStamp.ts" (
  echo Backup not found: src.pre-gallery-save-mode
  exit /b 1
)
copy /Y "src.pre-gallery-save-mode\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-gallery-save-mode\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-gallery-save-mode\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-gallery-save-mode\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-gallery-save-mode\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
copy /Y "src.pre-gallery-save-mode\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-gallery-save-mode\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-gallery-save-mode\services\exportStampImage.ts" "src\services\exportStampImage.ts"
echo Restored gallery-save-mode rollback from src.pre-gallery-save-mode
