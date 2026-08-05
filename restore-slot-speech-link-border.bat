@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-slot-speech-link-border\components\SaveSlotSpeechSheet.tsx" (
  echo Backup not found: src.pre-slot-speech-link-border
  exit /b 1
)
copy /Y "src.pre-slot-speech-link-border\components\SaveSlotSpeechSheet.tsx" "src\components\SaveSlotSpeechSheet.tsx"
echo Restored slot-speech-link-border from src.pre-slot-speech-link-border
endlocal
