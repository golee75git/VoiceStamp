@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-xlsx-keep-share\services\exportXlsx.ts" "%ROOT%src\services\exportXlsx.ts"
copy /Y "%ROOT%src.pre-xlsx-keep-share\components\StampListScreen.tsx" "%ROOT%src\components\StampListScreen.tsx"
if exist "%ROOT%public.pre-xlsx-keep-share\help.html" copy /Y "%ROOT%public.pre-xlsx-keep-share\help.html" "%ROOT%public\help.html"
echo Restored xlsx-keep-share snapshot.
