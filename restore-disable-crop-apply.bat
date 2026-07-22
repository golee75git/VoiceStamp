@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-disable-crop-apply\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-disable-crop-apply
  exit /b 1
)
copy /Y "src.pre-disable-crop-apply\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-disable-crop-apply\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
if exist "src.pre-disable-crop-apply\public\help.html" copy /Y "src.pre-disable-crop-apply\public\help.html" "public\help.html"
if exist "src.pre-disable-crop-apply\apkBuildLabel.ts" copy /Y "src.pre-disable-crop-apply\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored crop-apply disable from src.pre-disable-crop-apply
