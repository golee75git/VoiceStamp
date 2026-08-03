@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-item-speak-label\components\SaveSlotSpeechSheet.tsx" (
  echo Backup not found: src.pre-item-speak-label
  exit /b 1
)
copy /Y "src.pre-item-speak-label\components\SaveSlotSpeechSheet.tsx" "src\components\SaveSlotSpeechSheet.tsx"
copy /Y "src.pre-item-speak-label\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-item-speak-label\components\WebLimitNoticeScreen.tsx" "src\components\WebLimitNoticeScreen.tsx"
if exist "src.pre-item-speak-label\apkBuildLabel.ts" (
  copy /Y "src.pre-item-speak-label\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "public.pre-item-speak-label\help.html" (
  copy /Y "public.pre-item-speak-label\help.html" "public\help.html"
)
if exist "public.pre-item-speak-label\landing.html" (
  copy /Y "public.pre-item-speak-label\landing.html" "public\landing.html"
)
if exist "public.pre-item-speak-label\info.html" (
  copy /Y "public.pre-item-speak-label\info.html" "public\info.html"
)
echo Restored item-speak-label from src.pre-item-speak-label / public.pre-item-speak-label
endlocal
