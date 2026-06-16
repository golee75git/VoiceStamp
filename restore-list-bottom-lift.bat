@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-bottom-lift\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-bottom-lift
  exit /b 1
)
copy /Y "src.pre-list-bottom-lift\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list bottom lift rollback from src.pre-list-bottom-lift
