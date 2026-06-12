@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-onboarding-replay\MainScreen.tsx" (
  echo Backup not found: src.pre-onboarding-replay
  exit /b 1
)
copy /Y "src.pre-onboarding-replay\MainScreen.tsx" "src\screens\MainScreen.tsx"
copy /Y "src.pre-onboarding-replay\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-onboarding-replay\IntroScreen.tsx" "src\components\IntroScreen.tsx"
echo Restored onboarding replay menu from src.pre-onboarding-replay
