@echo off
cd /d "%~dp0"
if not exist "src.pre-speech-append\components\StampSaveModal.tsx" (
  echo ERROR: src.pre-speech-append backup not found.
  exit /b 1
)
copy /Y "src.pre-speech-append\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
echo Restored speech append files
