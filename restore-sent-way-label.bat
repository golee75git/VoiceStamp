@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-sent-way-label\services\projectCollectSettings.ts" "%ROOT%src\services\projectCollectSettings.ts"
copy /Y "%ROOT%src.pre-sent-way-label\services\projectUploadQueue.ts" "%ROOT%src\services\projectUploadQueue.ts"
copy /Y "%ROOT%src.pre-sent-way-label\services\saveStamp.ts" "%ROOT%src\services\saveStamp.ts"
copy /Y "%ROOT%src.pre-sent-way-label\services\joinStampSend.ts" "%ROOT%src\services\joinStampSend.ts"
copy /Y "%ROOT%src.pre-sent-way-label\components\ProjectSentList.tsx" "%ROOT%src\components\ProjectSentList.tsx"
copy /Y "%ROOT%src.pre-sent-way-label\components\StampSaveModal.tsx" "%ROOT%src\components\StampSaveModal.tsx"
copy /Y "%ROOT%src.pre-sent-way-label\components\StampListScreen.tsx" "%ROOT%src\components\StampListScreen.tsx"
if exist "%ROOT%public.pre-sent-way-label\help.html" copy /Y "%ROOT%public.pre-sent-way-label\help.html" "%ROOT%public\help.html"
echo Restored sent-way-label snapshot.
