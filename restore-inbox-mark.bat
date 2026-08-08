@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-inbox-mark\services\projectImportService.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-inbox-mark\types\stamp.ts" "src\types\stamp.ts" >nul
copy /Y "src.pre-inbox-mark\db\schema.ts" "src\db\schema.ts" >nul
copy /Y "src.pre-inbox-mark\db\database.ts" "src\db\database.ts" >nul
copy /Y "src.pre-inbox-mark\services\stampRepository.ts" "src\services\stampRepository.ts" >nul
copy /Y "src.pre-inbox-mark\services\projectImportService.ts" "src\services\projectImportService.ts" >nul
copy /Y "src.pre-inbox-mark\services\exportXlsx.ts" "src\services\exportXlsx.ts" >nul
if exist "public.pre-inbox-mark\help.html" copy /Y "public.pre-inbox-mark\help.html" "public\help.html" >nul
echo Restored inbox-mark. Note: already-migrated DB still has uploaded_by_mark column.
endlocal
