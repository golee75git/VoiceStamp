@echo off
setlocal
if not exist "src.pre-list-camera-back-icon\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-camera-back-icon
  exit /b 1
)
copy /Y "src.pre-list-camera-back-icon\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored StampListScreen.tsx from src.pre-list-camera-back-icon
echo Note: assets/camera-back-icon.png is not removed.
