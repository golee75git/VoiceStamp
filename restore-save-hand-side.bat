@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-hand-side\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-hand-side
  exit /b 1
)
copy /Y "src.pre-save-hand-side\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-save-hand-side\help.html" copy /Y "src.pre-save-hand-side\help.html" "public\help.html"
echo Restored save modal hand-side zoom badge and folder select
