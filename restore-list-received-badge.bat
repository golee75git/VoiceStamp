@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-list-received-badge\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-list-received-badge\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-list-received-badge\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
copy /Y "src.pre-list-received-badge\services\projectImportService.ts" "src\services\projectImportService.ts" >nul
if exist "public.pre-list-received-badge\help.html" copy /Y "public.pre-list-received-badge\help.html" "public\help.html" >nul
echo Restored list received badges. Reload Metro.
endlocal
