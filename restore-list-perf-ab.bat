@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-perf-ab\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-perf-ab
  exit /b 1
)
copy /Y "src.pre-list-perf-ab\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-list-perf-ab\components\TrashScreen.tsx" "src\components\TrashScreen.tsx"
copy /Y "src.pre-list-perf-ab\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-list-perf-ab\services\stampTrash.ts" "src\services\stampTrash.ts"
if exist "src\services\stampThumb.ts" del /Q "src\services\stampThumb.ts"
if exist "src\components\StampListThumb.tsx" del /Q "src\components\StampListThumb.tsx"
if exist "src.pre-list-perf-ab\help.html" copy /Y "src.pre-list-perf-ab\help.html" "public\help.html"
echo Restored list perf A+B (stamps-first + thumbs)
