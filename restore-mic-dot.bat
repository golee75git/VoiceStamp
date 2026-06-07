@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-mic-dot\components\VoiceInputField.tsx" (
  echo Backup not found: src.pre-mic-dot
  exit /b 1
)
copy /Y "src.pre-mic-dot\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
echo Restored mic-dot rollback from src.pre-mic-dot
