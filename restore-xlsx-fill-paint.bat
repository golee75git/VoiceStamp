@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-xlsx-fill-paint\services\exportXlsx.ts" "%ROOT%src\services\exportXlsx.ts"
copy /Y "%ROOT%src.pre-xlsx-fill-paint\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
if exist "%ROOT%public.pre-xlsx-fill-paint\help.html" copy /Y "%ROOT%public.pre-xlsx-fill-paint\help.html" "%ROOT%public\help.html"
echo Restored xlsx-fill-paint snapshot.
