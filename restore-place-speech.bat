@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-place-speech\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-place-speech
  exit /b 1
)
copy /Y "src.pre-place-speech\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored place speech mic rollback from src.pre-place-speech
