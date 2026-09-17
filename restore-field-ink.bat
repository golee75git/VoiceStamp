@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-field-ink\components\VoiceInputField.tsx" copy /Y "src.pre-field-ink\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx" >nul
if exist "public.pre-field-ink\help.html" copy /Y "public.pre-field-ink\help.html" "public\help.html" >nul
echo Restored field-ink (before save/edit field body text color). Reload Metro.
endlocal
