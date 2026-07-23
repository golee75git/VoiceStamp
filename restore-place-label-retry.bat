@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-place-label-retry\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-place-label-retry
  exit /b 1
)
copy /Y "src.pre-place-label-retry\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-place-label-retry\public\help.html" copy /Y "src.pre-place-label-retry\public\help.html" "public\help.html"
if exist "src.pre-place-label-retry\public\landing.html" copy /Y "src.pre-place-label-retry\public\landing.html" "public\landing.html"
if exist "src.pre-place-label-retry\public\info.html" copy /Y "src.pre-place-label-retry\public\info.html" "public\info.html"
if exist "src.pre-place-label-retry\constants\apkBuildLabel.ts" copy /Y "src.pre-place-label-retry\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored place-label retry from src.pre-place-label-retry
