@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-inbox-xlsx-font\services\exportXlsx.ts" "%ROOT%src\services\exportXlsx.ts"
copy /Y "%ROOT%src.pre-inbox-xlsx-font\services\projectCollectSettings.ts" "%ROOT%src\services\projectCollectSettings.ts"
copy /Y "%ROOT%src.pre-inbox-xlsx-font\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
if exist "%ROOT%public.pre-inbox-xlsx-font\help.html" copy /Y "%ROOT%public.pre-inbox-xlsx-font\help.html" "%ROOT%public\help.html"
echo Restored inbox-xlsx-font snapshot.
