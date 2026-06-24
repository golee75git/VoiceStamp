@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-export-bottom-lift\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-export-bottom-lift
  exit /b 1
)
copy /Y "src.pre-export-bottom-lift\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored export bottom lift rollback from src.pre-export-bottom-lift
