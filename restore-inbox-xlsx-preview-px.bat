@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-inbox-xlsx-preview-px\services\exportXlsx.ts" "%ROOT%src\services\exportXlsx.ts"
copy /Y "%ROOT%src.pre-inbox-xlsx-preview-px\services\projectCollectSettings.ts" "%ROOT%src\services\projectCollectSettings.ts"
copy /Y "%ROOT%src.pre-inbox-xlsx-preview-px\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
if exist "%ROOT%public.pre-inbox-xlsx-preview-px\help.html" copy /Y "%ROOT%public.pre-inbox-xlsx-preview-px\help.html" "%ROOT%public\help.html"
echo Restored inbox-xlsx-preview-px snapshot.
