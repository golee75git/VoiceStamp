@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-speech-end-gap\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-speech-end-gap
  exit /b 1
)
copy /Y "src.pre-speech-end-gap\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-speech-end-gap\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
echo Restored speech end-gap cursor rollback from src.pre-speech-end-gap
