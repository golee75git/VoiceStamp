@echo off
REM Restore label-to-value cursor move before 2026-11-05.
setlocal
set "ROOT=%~dp0"
copy /Y "%ROOT%src.pre-label-to-value-focus\components\VoiceInputField.tsx" "%ROOT%src\components\VoiceInputField.tsx" >nul
copy /Y "%ROOT%public.pre-label-to-value-focus\help.html" "%ROOT%public\help.html" >nul
echo restored VoiceInputField.tsx and help.html
endlocal
