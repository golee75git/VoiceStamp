@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-speech-cursor-respect\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-speech-cursor-respect
  exit /b 1
)
copy /Y "src.pre-speech-cursor-respect\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored speech cursor respect rollback from src.pre-speech-cursor-respect
