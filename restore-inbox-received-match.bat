@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-inbox-received-match\services\projectCollectSettings.ts" "%ROOT%src\services\projectCollectSettings.ts"
copy /Y "%ROOT%src.pre-inbox-received-match\services\projectImportedStamps.ts" "%ROOT%src\services\projectImportedStamps.ts"
copy /Y "%ROOT%src.pre-inbox-received-match\services\projectImportService.ts" "%ROOT%src\services\projectImportService.ts"
copy /Y "%ROOT%src.pre-inbox-received-match\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
copy /Y "%ROOT%src.pre-inbox-received-match\components\ProjectImportedList.tsx" "%ROOT%src\components\ProjectImportedList.tsx"
if exist "%ROOT%public.pre-inbox-received-match\help.html" copy /Y "%ROOT%public.pre-inbox-received-match\help.html" "%ROOT%public\help.html"
echo Restored inbox-received-match snapshot.
