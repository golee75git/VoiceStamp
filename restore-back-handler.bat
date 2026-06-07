@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-back-handler\screens\MainScreen.tsx" (
  echo Backup not found: src.pre-back-handler
  exit /b 1
)
copy /Y "src.pre-back-handler\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
echo Restored back-handler rollback from src.pre-back-handler
