@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-prefetch-school\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-location-prefetch-school
  exit /b 1
)
copy /Y "src.pre-location-prefetch-school\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-location-prefetch-school\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-location-prefetch-school\services\kakaoLocal.ts" "src\services\kakaoLocal.ts"
echo Restored location prefetch + school-fast kakaoLocal from src.pre-location-prefetch-school
