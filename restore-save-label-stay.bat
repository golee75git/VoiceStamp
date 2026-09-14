@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-save-label-stay\components\StampSaveModal.tsx" copy /Y "src.pre-save-label-stay\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-save-label-stay\components\VoiceInputField.tsx" copy /Y "src.pre-save-label-stay\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx" >nul
if exist "public.pre-save-label-stay\help.html" copy /Y "public.pre-save-label-stay\help.html" "public\help.html" >nul
echo Restored save-label-stay (pre label-tap stay on field). Reload Metro.
endlocal
