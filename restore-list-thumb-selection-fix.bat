@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-thumb-selection-fix\components\StampListThumb.tsx" (
  echo Backup not found: src.pre-list-thumb-selection-fix
  exit /b 1
)
copy /Y "src.pre-list-thumb-selection-fix\components\StampListThumb.tsx" "src\components\StampListThumb.tsx"
copy /Y "src.pre-list-thumb-selection-fix\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "public.pre-list-thumb-selection-fix\help.html" (
  copy /Y "public.pre-list-thumb-selection-fix\help.html" "public\help.html"
)
if exist "src.pre-list-thumb-selection-fix\apkBuildLabel.ts" (
  copy /Y "src.pre-list-thumb-selection-fix\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
echo Restored list-thumb-selection-fix
