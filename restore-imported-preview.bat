@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-imported-preview\collect\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-imported-preview\collect\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-imported-preview\title\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-imported-preview\title\services\quickCaptureSave.ts" "src\services\quickCaptureSave.ts" >nul
copy /Y "src.pre-imported-preview\collect\services\projectImportService.ts" "src\services\projectImportService.ts" >nul
if exist "public.pre-imported-preview\help.html" copy /Y "public.pre-imported-preview\help.html" "public\help.html" >nul
if exist "src\components\ProjectImportedList.tsx" del "src\components\ProjectImportedList.tsx" >nul
if exist "src\services\projectImportedStamps.ts" del "src\services\projectImportedStamps.ts" >nul
echo Restored imported preview / join title changes. Reload Metro.
endlocal
