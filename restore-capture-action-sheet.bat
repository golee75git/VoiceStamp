@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-capture-action-sheet\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-capture-action-sheet
  exit /b 1
)
copy /Y "src.pre-capture-action-sheet\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-capture-action-sheet\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-capture-action-sheet\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src\components\CaptureActionSheet.tsx" del /Q "src\components\CaptureActionSheet.tsx"
echo Restored capture action sheet rollback (§110)
