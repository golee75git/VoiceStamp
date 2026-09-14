@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-hwpx-first-pic\services\hwpxTemplate.ts" copy /Y "src.pre-hwpx-first-pic\services\hwpxTemplate.ts" "src\services\hwpxTemplate.ts" >nul
if exist "public.pre-hwpx-first-pic\help.html" copy /Y "public.pre-hwpx-first-pic\help.html" "public\help.html" >nul
echo Restored HWPX first-pic fill (pre page-break / bindata / table-slot). Reload Metro.
endlocal
