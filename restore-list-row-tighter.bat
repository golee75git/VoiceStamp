@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-row-tighter\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-row-tighter
  exit /b 1
)
copy /Y "src.pre-list-row-tighter\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "public.pre-list-row-tighter\help.html" (
  copy /Y "public.pre-list-row-tighter\help.html" "public\help.html"
)
if exist "src.pre-list-row-tighter\apkBuildLabel.ts" (
  copy /Y "src.pre-list-row-tighter\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
echo Restored list-row-tighter from src.pre-list-row-tighter / public.pre-list-row-tighter
