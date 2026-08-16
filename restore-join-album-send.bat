@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-join-album-send\services\pickStampImage.ts" "%ROOT%src\services\pickStampImage.ts"
copy /Y "%ROOT%src.pre-join-album-send\services\projectUploadQueue.ts" "%ROOT%src\services\projectUploadQueue.ts"
copy /Y "%ROOT%src.pre-join-album-send\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
copy /Y "%ROOT%src.pre-join-album-send\components\StampListScreen.tsx" "%ROOT%src\components\StampListScreen.tsx"
if exist "%ROOT%src\services\joinStampSend.ts" del /F "%ROOT%src\services\joinStampSend.ts"
if exist "%ROOT%public.pre-join-album-send\help.html" copy /Y "%ROOT%public.pre-join-album-send\help.html" "%ROOT%public\help.html"
echo Restored join-album-send snapshot.
