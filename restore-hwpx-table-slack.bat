@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-hwpx-table-slack\services\hwpxTemplate.ts" copy /Y "src.pre-hwpx-table-slack\services\hwpxTemplate.ts" "src\services\hwpxTemplate.ts" >nul
if exist "public.pre-hwpx-table-slack\help.html" copy /Y "public.pre-hwpx-table-slack\help.html" "public\help.html" >nul
echo Restored HWPX table slack (pre slightly shorter photo/table). Reload Metro.
endlocal
