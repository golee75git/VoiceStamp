@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-zoom-pan-fix\components\ZoomableImage.tsx" (
  echo Backup not found: src.pre-zoom-pan-fix
  exit /b 1
)
copy /Y "src.pre-zoom-pan-fix\components\ZoomableImage.tsx" "src\components\ZoomableImage.tsx"
echo Restored zoom pan fix from src.pre-zoom-pan-fix
