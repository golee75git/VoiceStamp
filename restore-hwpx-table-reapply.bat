@echo off
REM Restore HWPX export to the 110523 Hangul-template-fill approach (undo the table reapply).
setlocal
set "ROOT=%~dp0"
if exist "%ROOT%src.pre-hwpx-table-restore\services\exportHwpx.ts" (
  copy /Y "%ROOT%src.pre-hwpx-table-restore\services\exportHwpx.ts" "%ROOT%src\services\exportHwpx.ts" >nul
)
if exist "%ROOT%src\services\hwpxCaptionPack.ts" del /F /Q "%ROOT%src\services\hwpxCaptionPack.ts"
echo restored exportHwpx.ts to the 110523 template-fill version; removed hwpxCaptionPack.ts
endlocal
pause
