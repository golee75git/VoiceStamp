@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-speech-mic-end\hooks\useSpeechInput.ts" (
  echo Backup not found: src.pre-speech-mic-end
  exit /b 1
)
copy /Y "src.pre-speech-mic-end\hooks\useSpeechInput.ts" "src\hooks\useSpeechInput.ts"
copy /Y "src.pre-speech-mic-end\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored speech mic-end fix from src.pre-speech-mic-end
