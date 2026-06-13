@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-mic-hint\components\VoiceInputField.tsx" (
  echo Backup not found: src.pre-mic-hint
  exit /b 1
)
copy /Y "src.pre-mic-hint\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
echo Restored mic hint from src.pre-mic-hint
