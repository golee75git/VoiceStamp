@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-onboarding-idle\App.tsx" (
  echo Backup not found: src.pre-onboarding-idle
  exit /b 1
)
copy /Y "src.pre-onboarding-idle\App.tsx" "App.tsx"
copy /Y "src.pre-onboarding-idle\settingsService.ts" "src\services\settingsService.ts"
echo Restored onboarding idle logic from src.pre-onboarding-idle
