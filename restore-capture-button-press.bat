@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-capture-button-press\components\CaptureActionSheet.tsx" (
  echo Backup not found: src.pre-capture-button-press
  exit /b 1
)
copy /Y "src.pre-capture-button-press\components\CaptureActionSheet.tsx" "src\components\CaptureActionSheet.tsx"
echo Restored capture action sheet button press rollback from src.pre-capture-button-press
