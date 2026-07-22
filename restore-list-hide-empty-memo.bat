@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-hide-empty-memo\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-hide-empty-memo
  exit /b 1
)
copy /Y "src.pre-list-hide-empty-memo\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-list-hide-empty-memo\public\help.html" copy /Y "src.pre-list-hide-empty-memo\public\help.html" "public\help.html"
if exist "src.pre-list-hide-empty-memo\apkBuildLabel.ts" copy /Y "src.pre-list-hide-empty-memo\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored list hide-empty-memo from src.pre-list-hide-empty-memo
