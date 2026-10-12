@echo off
REM Restore save-list select-all and export-bar gap before 2026-10-12.
setlocal
set "ROOT=%~dp0"
copy /Y "%ROOT%src.pre-list-select-visible\components\StampListScreen.tsx" "%ROOT%src\components\StampListScreen.tsx" >nul
copy /Y "%ROOT%public.pre-list-select-visible\help.html" "%ROOT%public\help.html" >nul
echo restored StampListScreen.tsx and help.html
endlocal
