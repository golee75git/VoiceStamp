@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-slot-speech-type-hint\components\SaveSlotSpeechSheet.tsx" (
  echo Backup not found: src.pre-slot-speech-type-hint
  exit /b 1
)
copy /Y "src.pre-slot-speech-type-hint\components\SaveSlotSpeechSheet.tsx" "src\components\SaveSlotSpeechSheet.tsx"
copy /Y "src.pre-slot-speech-type-hint\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-slot-speech-type-hint\components\SettingsScreen.tsx" (
  copy /Y "src.pre-slot-speech-type-hint\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
)
if exist "public.pre-slot-speech-type-hint\help.html" (
  copy /Y "public.pre-slot-speech-type-hint\help.html" "public\help.html"
)
if exist "public.pre-slot-speech-type-hint\landing.html" (
  copy /Y "public.pre-slot-speech-type-hint\landing.html" "public\landing.html"
)
if exist "public.pre-slot-speech-type-hint\info.html" (
  copy /Y "public.pre-slot-speech-type-hint\info.html" "public\info.html"
)
if exist "src.pre-slot-speech-type-hint\apkBuildLabel.ts" (
  copy /Y "src.pre-slot-speech-type-hint\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "docs.pre-slot-speech-type-hint\DESIGN-save-slot-speech.md" (
  copy /Y "docs.pre-slot-speech-type-hint\DESIGN-save-slot-speech.md" "docs\DESIGN-save-slot-speech.md"
)
if exist "docs.pre-slot-speech-type-hint\SECURITY-save-slot-speech-20260803.md" (
  copy /Y "docs.pre-slot-speech-type-hint\SECURITY-save-slot-speech-20260803.md" "docs\SECURITY-save-slot-speech-20260803.md"
)
echo Restored slot-speech-type-hint from src.pre-slot-speech-type-hint / public.pre-slot-speech-type-hint
