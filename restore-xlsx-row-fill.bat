@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-xlsx-row-fill\services\exportXlsx.ts" "%ROOT%src\services\exportXlsx.ts"
copy /Y "%ROOT%src.pre-xlsx-row-fill\services\exportOnDemand.ts" "%ROOT%src\services\exportOnDemand.ts"
copy /Y "%ROOT%src.pre-xlsx-row-fill\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
copy /Y "%ROOT%src.pre-xlsx-row-fill\components\StampListScreen.tsx" "%ROOT%src\components\StampListScreen.tsx"
if exist "%ROOT%public.pre-xlsx-row-fill\help.html" copy /Y "%ROOT%public.pre-xlsx-row-fill\help.html" "%ROOT%public\help.html"
echo Restored xlsx-row-fill snapshot.
