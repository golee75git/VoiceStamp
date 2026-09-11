@echo off
REM Restore HWPX to the previous photo-top table inside report.hwpx.
setlocal
set "ROOT=%~dp0"
if exist "%ROOT%src.pre-hwpx-own-table\services\exportHwpx.ts" (
  copy /Y "%ROOT%src.pre-hwpx-own-table\services\exportHwpx.ts" "%ROOT%src\services\exportHwpx.ts" >nul
)
if exist "%ROOT%src.pre-hwpx-own-table\public\help.html" (
  copy /Y "%ROOT%src.pre-hwpx-own-table\public\help.html" "%ROOT%public\help.html" >nul
)
if exist "%ROOT%src\services\hwpxCaptionPack.ts" del /F /Q "%ROOT%src\services\hwpxCaptionPack.ts"
echo restored exportHwpx.ts and help.html; removed hwpxCaptionPack.ts
endlocal
