@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-slot-speech\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-slot-speech
  exit /b 1
)
copy /Y "src.pre-save-slot-speech\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-save-slot-speech\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-save-slot-speech\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-save-slot-speech\components\WebLimitNoticeScreen.tsx" "src\components\WebLimitNoticeScreen.tsx"
copy /Y "src.pre-save-slot-speech\hooks\useSpeechInput.ts" "src\hooks\useSpeechInput.ts"
if exist "src.pre-save-slot-speech\constants\apkBuildLabel.ts" (
  copy /Y "src.pre-save-slot-speech\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "public.pre-save-slot-speech\help.html" (
  copy /Y "public.pre-save-slot-speech\help.html" "public\help.html"
)
if exist "public.pre-save-slot-speech\landing.html" (
  copy /Y "public.pre-save-slot-speech\landing.html" "public\landing.html"
)
if exist "public.pre-save-slot-speech\info.html" (
  copy /Y "public.pre-save-slot-speech\info.html" "public\info.html"
)
if exist "src\components\SaveSlotSpeechSheet.tsx" (
  del /F /Q "src\components\SaveSlotSpeechSheet.tsx"
)
echo Restored save-slot-speech from src.pre-save-slot-speech / public.pre-save-slot-speech
