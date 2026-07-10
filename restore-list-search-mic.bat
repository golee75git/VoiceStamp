@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-search-mic\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-search-mic
  exit /b 1
)
copy /Y "src.pre-list-search-mic\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-list-search-mic\help.html" copy /Y "src.pre-list-search-mic\help.html" "public\help.html"
echo Restored list search mic (header mic decorative)
