@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-ocr-memo-scroll\components\VoiceInputField.tsx" (
  echo Backup not found: src.pre-ocr-memo-scroll
  exit /b 1
)
copy /Y "src.pre-ocr-memo-scroll\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx" >nul
copy /Y "src.pre-ocr-memo-scroll\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-ocr-memo-scroll\components\SettingsScreen.tsx" copy /Y "src.pre-ocr-memo-scroll\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
if exist "src.pre-ocr-memo-scroll\public\help.html" copy /Y "src.pre-ocr-memo-scroll\public\help.html" "public\help.html" >nul
if exist "src.pre-ocr-memo-scroll\apkBuildLabel.ts" copy /Y "src.pre-ocr-memo-scroll\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
echo Restored ocr-memo-scroll from src.pre-ocr-memo-scroll
