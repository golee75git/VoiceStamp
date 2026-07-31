@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-hand-theme\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-hand-theme
  exit /b 1
)
copy /Y "src.pre-camera-hand-theme\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-camera-hand-theme\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "public.pre-camera-hand-theme\help.html" (
  copy /Y "public.pre-camera-hand-theme\help.html" "public\help.html"
)
echo Restored camera-hand-theme from src.pre-camera-hand-theme / public.pre-camera-hand-theme
