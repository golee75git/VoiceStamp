@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-trip-presurvey-template\services\stampFieldTemplates.ts" "%ROOT%src\services\stampFieldTemplates.ts"
if exist "%ROOT%public.pre-trip-presurvey-template\help.html" copy /Y "%ROOT%public.pre-trip-presurvey-template\help.html" "%ROOT%public\help.html"
echo Restored trip-presurvey-template snapshot.
