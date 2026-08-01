@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-speech-target-guard\hooks\useSpeechInput.ts" (
  echo Backup not found: src.pre-speech-target-guard
  exit /b 1
)
copy /Y "src.pre-speech-target-guard\hooks\useSpeechInput.ts" "src\hooks\useSpeechInput.ts"
copy /Y "src.pre-speech-target-guard\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "public.pre-speech-target-guard\help.html" (
  copy /Y "public.pre-speech-target-guard\help.html" "public\help.html"
)
if exist "src.pre-speech-target-guard\apkBuildLabel.ts" (
  copy /Y "src.pre-speech-target-guard\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
echo Restored speech-target-guard from src.pre-speech-target-guard / public.pre-speech-target-guard
