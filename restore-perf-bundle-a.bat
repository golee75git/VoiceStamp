@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-perf-bundle-a\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-perf-bundle-a
  exit /b 1
)
copy /Y "src.pre-perf-bundle-a\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-perf-bundle-a\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-perf-bundle-a\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-perf-bundle-a\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-perf-bundle-a\services\pickStampImage.ts" "src\services\pickStampImage.ts"
copy /Y "src.pre-perf-bundle-a\utils\cameraPictureSize.ts" "src\utils\cameraPictureSize.ts"
if exist "public.pre-perf-bundle-a\help.html" copy /Y "public.pre-perf-bundle-a\help.html" "public\help.html"
if exist "src\constants\captureImageBudget.ts" del /F /Q "src\constants\captureImageBudget.ts"
if exist "src\services\gallerySaveIdleQueue.ts" del /F /Q "src\services\gallerySaveIdleQueue.ts"
echo Restored perf-bundle-a from src.pre-perf-bundle-a / public.pre-perf-bundle-a
