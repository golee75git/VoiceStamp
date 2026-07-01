@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-modal-perf\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-modal-perf
  exit /b 1
)
copy /Y "src.pre-save-modal-perf\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-save-modal-perf\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-save-modal-perf\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src\services\stampSaveModalLayoutCache.ts" del /F "src\services\stampSaveModalLayoutCache.ts"
echo Restored save-modal-perf rollback
