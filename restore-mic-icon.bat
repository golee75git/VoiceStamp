@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-mic-icon\components\VoiceInputField.tsx" (
  echo Backup not found: src.pre-mic-icon
  exit /b 1
)
copy /Y "src.pre-mic-icon\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
if exist "assets\mic-icon.png" del /Q "assets\mic-icon.png"
echo Restored mic-icon rollback from src.pre-mic-icon
