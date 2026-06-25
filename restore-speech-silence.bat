@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-speech-silence\hooks\useSpeechInput.ts" (
  echo Backup not found: src.pre-speech-silence
  exit /b 1
)
copy /Y "src.pre-speech-silence\hooks\useSpeechInput.ts" "src\hooks\useSpeechInput.ts"
echo Restored speech silence settings from src.pre-speech-silence
