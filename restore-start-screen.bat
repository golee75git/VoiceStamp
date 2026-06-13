@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-start-screen\App.tsx" (
  echo Backup not found: src.pre-start-screen
  exit /b 1
)
copy /Y "src.pre-start-screen\App.tsx" "App.tsx"
copy /Y "src.pre-start-screen\services\settingsService.ts" "src\services\settingsService.ts"
if exist "src\components\StartScreen.tsx" del /Q "src\components\StartScreen.tsx"
echo Restored start screen from src.pre-start-screen
