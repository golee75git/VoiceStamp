@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-speech-cursor\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-speech-cursor
  exit /b 1
)
copy /Y "src.pre-speech-cursor\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-speech-cursor\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
echo Restored speech cursor insertion rollback (§96)
