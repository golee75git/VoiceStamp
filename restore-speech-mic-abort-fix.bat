@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-speech-mic-abort-fix\hooks\useSpeechInput.ts" (
  echo Backup not found: src.pre-speech-mic-abort-fix
  exit /b 1
)
copy /Y "src.pre-speech-mic-abort-fix\hooks\useSpeechInput.ts" "src\hooks\useSpeechInput.ts"
echo Restored speech mic-abort fix from src.pre-speech-mic-abort-fix
