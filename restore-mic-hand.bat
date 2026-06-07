@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-mic-hand\components\VoiceInputField.tsx" (
  echo Backup not found: src.pre-mic-hand
  exit /b 1
)
copy /Y "src.pre-mic-hand\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
copy /Y "src.pre-mic-hand\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored mic-hand rollback from src.pre-mic-hand
