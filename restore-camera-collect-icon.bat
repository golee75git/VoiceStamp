@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-camera-collect-icon\components\CameraScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-camera-collect-icon\components\CameraScreen.tsx" "src\components\CameraScreen.tsx" >nul
copy /Y "src.pre-camera-collect-icon\screens\MainScreen.tsx" "src\screens\MainScreen.tsx" >nul
if exist "public.pre-camera-collect-icon\help.html" copy /Y "public.pre-camera-collect-icon\help.html" "public\help.html" >nul
if exist "assets\project-collect-icon.png" del /F /Q "assets\project-collect-icon.png" >nul
echo Restored camera-collect-icon.
endlocal
