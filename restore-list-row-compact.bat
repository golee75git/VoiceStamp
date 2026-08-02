@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-row-compact\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-row-compact
  exit /b 1
)
copy /Y "src.pre-list-row-compact\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "public.pre-list-row-compact\help.html" (
  copy /Y "public.pre-list-row-compact\help.html" "public\help.html"
)
if exist "src.pre-list-row-compact\apkBuildLabel.ts" (
  copy /Y "src.pre-list-row-compact\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
echo Restored list-row-compact from src.pre-list-row-compact / public.pre-list-row-compact
