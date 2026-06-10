@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-site-folder-keep\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-site-folder-keep
  exit /b 1
)
copy /Y "src.pre-site-folder-keep\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored site-folder-keep rollback from src.pre-site-folder-keep
