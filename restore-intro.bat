@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-intro\App.tsx" (
  echo Backup not found: src.pre-intro
  exit /b 1
)
copy /Y "src.pre-intro\App.tsx" "App.tsx"
copy /Y "src.pre-intro\settingsService.ts" "src\services\settingsService.ts"
if exist "src\components\IntroScreen.tsx" del /Q "src\components\IntroScreen.tsx"
echo Restored intro onboarding from src.pre-intro
