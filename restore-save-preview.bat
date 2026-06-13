@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-preview\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-preview
  exit /b 1
)
copy /Y "src.pre-save-preview\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src\components\StampSavePreview.tsx" del /Q "src\components\StampSavePreview.tsx"
echo Restored save preview from src.pre-save-preview
