@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-hwpx-caption-below\services\exportHwpx.ts" (
  echo Backup not found: src.pre-hwpx-caption-below
  exit /b 1
)
copy /Y "src.pre-hwpx-caption-below\services\exportHwpx.ts" "src\services\exportHwpx.ts"
if exist "src.pre-hwpx-caption-below\help.html" (
  copy /Y "src.pre-hwpx-caption-below\help.html" "public\help.html"
)
if exist "src.pre-hwpx-caption-below\apkBuildLabel.ts" (
  copy /Y "src.pre-hwpx-caption-below\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "src.pre-hwpx-caption-below\landing.html" (
  copy /Y "src.pre-hwpx-caption-below\landing.html" "public\landing.html"
)
if exist "src.pre-hwpx-caption-below\info.html" (
  copy /Y "src.pre-hwpx-caption-below\info.html" "public\info.html"
)
echo Restored HWPX caption-below from src.pre-hwpx-caption-below
