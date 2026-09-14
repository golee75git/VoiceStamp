@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-save-kb-clear\components\StampSaveModal.tsx" copy /Y "src.pre-save-kb-clear\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-save-kb-clear\components\VoiceInputField.tsx" copy /Y "src.pre-save-kb-clear\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx" >nul
if exist "public.pre-save-kb-clear\help.html" copy /Y "public.pre-save-kb-clear\help.html" "public\help.html" >nul
echo Restored save-kb-clear (pre save/edit fields staying above the system keyboard). Reload Metro.
endlocal
