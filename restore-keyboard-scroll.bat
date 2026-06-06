@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-keyboard-scroll\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-keyboard-scroll
  exit /b 1
)
copy /Y "src.pre-keyboard-scroll\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-keyboard-scroll\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
echo Restored save modal keyboard scroll from src.pre-keyboard-scroll
