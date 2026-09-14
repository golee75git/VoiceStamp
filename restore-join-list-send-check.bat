@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-join-list-send-check\components\StampListScreen.tsx" copy /Y "src.pre-join-list-send-check\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-join-list-send-check\help.html" copy /Y "public.pre-join-list-send-check\help.html" "public\help.html" >nul
echo Restored join-list-send-check (pre list send picker tap + join check). Reload Metro.
endlocal
