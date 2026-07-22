@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-label-edit\components\VoiceInputField.tsx" (
  echo Backup not found: src.pre-save-label-edit
  exit /b 1
)
copy /Y "src.pre-save-label-edit\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
copy /Y "src.pre-save-label-edit\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-save-label-edit\components\SettingsScreen.tsx" copy /Y "src.pre-save-label-edit\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src.pre-save-label-edit\public\help.html" copy /Y "src.pre-save-label-edit\public\help.html" "public\help.html"
if exist "src.pre-save-label-edit\apkBuildLabel.ts" copy /Y "src.pre-save-label-edit\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored save label edit from src.pre-save-label-edit
