@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-image-picker\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-image-picker
  exit /b 1
)
copy /Y "src.pre-image-picker\app.json" "app.json"
copy /Y "src.pre-image-picker\package.json" "package.json"
copy /Y "src.pre-image-picker\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "src\services\pickStampImage.ts" del "src\services\pickStampImage.ts"
echo Restored image picker rollback from src.pre-image-picker
echo Run: npm install
