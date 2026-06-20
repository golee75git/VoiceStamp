@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-search\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-search
  exit /b 1
)
copy /Y "src.pre-list-search\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
del "src\utils\stampListSearch.ts" 2>nul
echo Restored list search changes from src.pre-list-search
